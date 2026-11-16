import Foundation
import UIKit
import WebKit
#if os(visionOS)
import Photos
#endif

final class MetalBridge: NSObject, WKScriptMessageHandlerWithReply {
    private let renderQueue = DispatchQueue(label: "ColdSmoke.Metal", qos: .userInteractive)
    private let renderer: MetalRenderer
    private weak var presenter: UIViewController?
    private let url: URL
    private var failure: String? // accessed on renderQueue

    #if os(visionOS)
    var onPhotoPreview: ((CGImage) -> Void)?
    #endif

    init(renderer: MetalRenderer, presenter: UIViewController, url: URL) {
        self.renderer = renderer
        self.presenter = presenter
        self.url = url.standardizedFileURL
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard message.frameInfo.isMainFrame, let source = message.frameInfo.request.url, source.isFileURL,
              source.standardizedFileURL.path == url.path, let packet = message.body as? [String: Any] else {
            replyHandler(nil, "Invalid Metal message origin")
            return
        }
        if packet["device"] as? Bool == true {
            replyHandler(["backend": "metal", "name": "Metal", "renderer": renderer.device.name,
                          "maxTex": 16384, "hdr": true, "r32fTarget": true], nil)
            return
        }
        #if os(visionOS)
        let preview = packet["previewGamePhoto"] as? Bool == true
        if let textureID = preview ? -1 : packet["saveGamePhoto"] as? Int {
            renderQueue.async { [renderer] in
                do {
                    try renderer.gamePhoto(textureID: textureID) { photo, error in
                        Task { @MainActor in
                            guard let photo else { replyHandler(nil, error ?? "No photo"); return }
                            if preview { self.onPhotoPreview?(photo); replyHandler(true, nil); return }
                            let access = await PHPhotoLibrary.requestAuthorization(for: .addOnly)
                            guard access == .authorized || access == .limited else { replyHandler("denied", nil); return }
                            do {
                                try await PHPhotoLibrary.shared().performChanges {
                                    PHAssetChangeRequest.creationRequestForAsset(from: UIImage(cgImage: photo))
                                }
                                replyHandler("saved", nil)
                            } catch { replyHandler(nil, error.localizedDescription) }
                        }
                    }
                } catch { DispatchQueue.main.async { replyHandler(nil, error.localizedDescription) } }
            }
            return
        }
        #endif
        if packet["capture"] as? Bool == true {
            renderQueue.async { [renderer] in
                do {
                    try renderer.capture { photo, error in
                        DispatchQueue.main.async { replyHandler(photo, error) }
                    }
                } catch { DispatchQueue.main.async { replyHandler(nil, error.localizedDescription) } }
            }
            return
        }
        if let png = packet["sharePNG"] as? String, let name = packet["name"] as? String {
            share(png: png, name: name, reply: replyHandler)
            return
        }
        guard let operations = packet["commands"] as? [[Any]], let encoded = packet["bytes"] as? String else {
            replyHandler(nil, "Invalid Metal packet")
            return
        }
        renderQueue.async { [self] in
            do {
                if let failure { throw RenderError(failure) }
                guard let data = Data(base64Encoded: encoded) else { throw RenderError("Invalid Metal upload") }
                try renderer.submit(operations, data: data) { error, gpuSeconds in
                    DispatchQueue.main.async { replyHandler(gpuSeconds, error) }
                }
            } catch {
                let text = error.localizedDescription
                failure = text
                DispatchQueue.main.async { replyHandler(nil, text) }
            }
        }
    }

    private func share(png: String, name: String, reply: @escaping (Any?, String?) -> Void) {
        guard let presenter, presenter.presentedViewController == nil,
              name == (name as NSString).lastPathComponent, name.hasSuffix(".png"),
              let data = Data(base64Encoded: png) else {
            reply(nil, "Cannot open this photo")
            return
        }
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: false)
            let file = dir.appendingPathComponent(name)
            try data.write(to: file)
            let sheet = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = presenter.view
            sheet.popoverPresentationController?.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.midY, width: 1, height: 1)
            sheet.completionWithItemsHandler = { _, completed, _, error in
                try? FileManager.default.removeItem(at: dir)
                reply(completed, error?.localizedDescription)
            }
            presenter.present(sheet, animated: true)
        } catch {
            try? FileManager.default.removeItem(at: dir)
            reply(nil, error.localizedDescription)
        }
    }
}
