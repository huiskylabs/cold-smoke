import UIKit
import Metal
import WebKit
import SwiftUI

private final class MetalSurface: UIView {
    override class var layerClass: AnyClass { CAMetalLayer.self }
    var metalLayer: CAMetalLayer { layer as! CAMetalLayer }
}

// WebKit runs the shared simulation and UI state. UIKit presents the game controls.
// The Metal layer behind the controls presents the mountain.
final class GameController: UIViewController, WKNavigationDelegate {
    private var web: WKWebView?
    private weak var surface: MetalSurface?
    private var lastViewport: CGSize?
    private var gameURL: URL?
    private var menuHost: UIHostingController<PauseMenu>?
    private var menuBar: CGRect = .null
    private var menuModel: PauseMenuModel?
    private weak var controls: GameControls?
    private struct ControlLayout: Equatable {
        var edge = ""
        var leftSplit = false
        var barTop: CGFloat = 0
        var barInset: CGFloat = 0
        var compactControls = false
        var photoAxis: CGFloat = 0
        var photoTop: CGFloat = 0
        var photoBottom: CGFloat = 0
        var division = CGRect.null
    }
    private var lastLayout: ControlLayout?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        if #available(iOS 27.1, *) {
            registerForTraitChanges(UITraitCollection.systemTraitsAffectingVerticalBarEdge + [UITraitHorizontalSizeClass.self]) {
                (controller: GameController, _: UITraitCollection) in controller.view.setNeedsLayout()
            }
        }
        do { try loadGame() }
        catch { showError(error.localizedDescription) }
    }

    private func loadGame() throws {
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Game") else {
            throw RenderError("Game/index.html is missing")
        }
        guard let device = MTLCreateSystemDefaultDevice() else { throw RenderError("Metal is unavailable on this device") }
        let surface = MetalSurface(frame: view.bounds)
        surface.isUserInteractionEnabled = false
        surface.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(surface)
        self.surface = surface
        let layer = surface.metalLayer
        layer.device = device
        layer.pixelFormat = .bgra8Unorm
        // Keep the last frame in proportion while the next display's drawable is being prepared.
        layer.contentsGravity = .resizeAspect
        let renderer = try MetalRenderer(device: device) { [weak layer] w, h in
            guard let layer, let drawable = layer.nextDrawable() else { return nil }
            let width = drawable.texture.width, height = drawable.texture.height
            // A delayed frame from the other display must never fill the new viewport.
            guard abs(w * height - h * width) <= (width + height + 1) / 2 else { return nil }
            return (drawable.texture, drawable)
        }
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.userContentController.addScriptMessageHandler(MetalBridge(renderer: renderer, presenter: self, url: url),
                                                             contentWorld: .page, name: "metal")

        let controls = GameControls(frame: view.bounds)
        controls.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        controls.overrideUserInterfaceStyle = .dark
        config.userContentController.add(controls, name: "gameControls")
        let overlay = WKWebView(frame: view.bounds, configuration: config)
        overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        overlay.isOpaque = false
        overlay.backgroundColor = .clear
        overlay.scrollView.backgroundColor = .clear
        overlay.scrollView.contentInsetAdjustmentBehavior = .never
        overlay.scrollView.isScrollEnabled = false
        #if DEBUG
        if #available(iOS 16.4, *) { overlay.isInspectable = true }
        #endif
        overlay.navigationDelegate = self
        controls.onSettings = { [weak self] in self?.showSettings($0) }
        controls.web = overlay
        self.controls = controls
        web = overlay
        gameURL = url
        view.addSubview(overlay)
        view.addSubview(controls)
        overlay.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    private func showSettings(_ settings: PauseSettings?) {
        guard let settings else {
            guard let host = menuHost else { return }
            host.willMove(toParent: nil)
            host.view.removeFromSuperview()
            host.removeFromParent()
            menuHost = nil
            menuModel = nil
            web?.accessibilityElementsHidden = false
            return
        }
        if let model = menuModel {
            if model.state != settings { model.state = settings }
            return
        }
        let model = PauseMenuModel(settings) { [weak self] id in self?.controls?.perform(id, "tap") }
        model.bar = menuBar
        let host = UIHostingController(rootView: PauseMenu(model: model))
        host.overrideUserInterfaceStyle = .dark
        host.view.backgroundColor = .clear
        host.view.accessibilityViewIsModal = true
        web?.accessibilityElementsHidden = true
        addChild(host)
        host.view.frame = view.bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(host.view)
        host.didMove(toParent: self)
        menuHost = host
        menuModel = model
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        if let surface, surface.bounds.width > 0, surface.bounds.height > 0 {
            let scale = surface.traitCollection.displayScale
            let pixels = CGSize(width: (surface.bounds.width * scale).rounded(), height: (surface.bounds.height * scale).rounded())
            if surface.metalLayer.drawableSize != pixels { surface.metalLayer.drawableSize = pixels }
        }
        updateViewport()
        updateControlLayout()
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        view.setNeedsLayout()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        lastViewport = nil
        updateViewport()
        lastLayout = nil
        updateControlLayout()
    }

    private func updateViewport() {
        guard let web, let size = surface?.bounds.size,
              size.width > 0, size.height > 0, size != lastViewport else { return }
        lastViewport = size
        web.callAsyncJavaScript("window.setMetalViewport?.(width, height)",
                                arguments: ["width": size.width, "height": size.height],
                                in: nil, in: .page, completionHandler: nil)
    }

    private func updateControlLayout() {
        guard #available(iOS 27.1, *), let web else { return }
        var layout = ControlLayout()
        var settingsBar = CGRect.null
        let barEdge = web.traitCollection.verticalBarEdge
        if barEdge == .leading || barEdge == .trailing {
            let rightToLeft = web.effectiveUserInterfaceLayoutDirection == .rightToLeft
            let left = (barEdge == .leading) != rightToLeft
            let physicalEdge: UIRectEdge = left ? .left : .right
            // UIKit reserves room along this strip for the camera, system UI and curved corners.
            let insets = web.edgeInsets(for: .bar(onEdge: physicalEdge, extent: 52))
            layout.edge = left ? "left" : "right"
            if left, web.traitCollection.userInterfaceIdiom == .phone, let scene = web.window?.windowScene {
                // The cover can also have a left bar. Only mirror the HUD in a half-width scene.
                let sceneSpace = scene.effectiveGeometry.coordinateSpace
                let screenSpace = scene.screen.coordinateSpace
                let display = sceneSpace.convert(screenSpace.bounds, from: screenSpace)
                layout.leftSplit = sceneSpace.bounds.width > 0 && sceneSpace.bounds.width <= display.width / 2 + 1
            }
            layout.barTop = insets.top
            layout.barInset = left ? insets.left : insets.right
            // The cover uses compact width in either orientation; the open viewfinder
            // uses its own right-hand rail regardless of the system bar's side.
            layout.compactControls = web.traitCollection.horizontalSizeClass == .compact
            let photoEdge: UIRectEdge = layout.compactControls ? physicalEdge : .right
            // Keep the standard bar's centerline even though the shutter is wider.
            var region = UIView.LayoutRegion.bar(onEdge: photoEdge, extent: 48)
            #if compiler(>=6.4.2)
            if #available(iOS 27.2, *) { region = .bar(onEdge: photoEdge) }
            #endif
            let bar = web.bounds.inset(by: web.edgeInsets(for: region))
            if layout.compactControls { settingsBar = web.convert(bar, to: nil) }
            layout.photoAxis = photoEdge == .left ? bar.midX - web.bounds.minX : web.bounds.maxX - bar.midX
            let shutter = web.edgeInsets(for: .bar(onEdge: photoEdge, extent: 68))
            layout.photoTop = max(shutter.top, bar.minY - web.bounds.minY)
            layout.photoBottom = max(shutter.bottom, web.bounds.maxY - bar.maxY)
        }
        if menuBar != settingsBar {
            menuBar = settingsBar
            menuModel?.bar = settingsBar
        }
        let fold = web.reservedRegions(kind: .division).first(where: { $0.isActive })?.frame.intersection(web.bounds) ?? .null
        layout.division = fold
        guard layout != lastLayout else { return }
        lastLayout = layout
        let vertical = fold.height > fold.width
        let start = fold.isNull ? 0 : (vertical ? fold.minX : fold.minY)
        let gap = fold.isNull ? 0 : (vertical ? fold.width : fold.height)
        web.callAsyncJavaScript("""
            const root = document.documentElement;
            root.dataset.barEdge = edge;
            root.toggleAttribute('data-left-split', leftSplit);
            root.dataset.controlLayout = compactControls ? 'compact' : 'expanded';
            root.style.setProperty('--bar-top', barTop + 'px');
            root.style.setProperty('--bar-inset', barInset + 'px');
            root.style.setProperty('--photo-bar-axis', photoAxis + 'px');
            root.style.setProperty('--photo-bar-top', photoTop + 'px');
            root.style.setProperty('--photo-bar-bottom', photoBottom + 'px');
            root.dataset.fold = axis;
            root.style.setProperty('--fold-start', start + 'px');
            root.style.setProperty('--fold-gap', gap + 'px');
            """, arguments: ["edge": layout.edge, "barTop": layout.barTop, "barInset": layout.barInset,
                             "compactControls": layout.compactControls, "leftSplit": layout.leftSplit,
                             "photoAxis": layout.photoAxis, "photoTop": layout.photoTop, "photoBottom": layout.photoBottom,
                             "axis": fold.isNull ? "" : vertical ? "vertical" : "horizontal",
                             "start": start, "gap": gap], in: nil, in: .page, completionHandler: nil)
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let local = action.request.url?.isFileURL == true && action.request.url?.standardizedFileURL.path == gameURL?.standardizedFileURL.path
        decisionHandler(local && action.targetFrame?.isMainFrame == true ? .allow : .cancel)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showError(error.localizedDescription)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        showError("The game was interrupted. / 游戏进程已中断。")
    }

    private func showError(_ text: String) {
        showSettings(nil)
        web?.isHidden = true
        controls?.isHidden = true
        let message = UILabel()
        message.text = text
        message.textColor = .white
        message.numberOfLines = 0
        message.textAlignment = .center
        let restart = UIButton(type: .system)
        if #available(iOS 26, *) { restart.configuration = .glass() }
        restart.setTitle("重新加载 · Reload", for: .normal)
        restart.addAction(UIAction { [weak self] _ in
            guard let self else { return }
            self.web = nil
            self.view.subviews.forEach { $0.removeFromSuperview() }
            do { try self.loadGame() } catch { self.showError(error.localizedDescription) }
        }, for: .touchUpInside)
        let stack = UIStackView(arrangedSubviews: [message, restart])
        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -20),
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
}
