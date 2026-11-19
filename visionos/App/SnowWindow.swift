import CompositorServices
import GameController
import Metal
import SwiftUI
import WebKit

@main
struct ColdSmokeVisionApp: App {
    @StateObject private var game = SnowWindow()
    var body: some Scene {
        WindowGroup(id: "lodge") { Lodge(game: game) }.defaultSize(width: 1040, height: 680)
        instruments.restorationBehavior(instrumentRestoration)
        ImmersiveSpace(id: "slope") {
            CompositorLayer(configuration: SlopeConfiguration()) { layer in game.attach(layer) }
        }.immersionStyle(selection: .constant(.full), in: .full)
    }

    private var instrumentRestoration: SceneRestorationBehavior {
        if #available(visionOS 26, *) { return .disabled }
        return .automatic
    }

    private var instruments: some Scene {
        WindowGroup(id: "instruments") {
            SlopeControls(ui: game.interface, immersive: true)
                .frame(width: 740, height: 400, alignment: .bottom)
                .handlesGameControllerEvents(matching: .gamepad)
                .persistentSystemOverlays(.hidden)
                .onAppear { reportSlopeMilestone("Native instrument window visible") }
        }
        .windowStyle(.plain)
        .windowResizability(.contentSize)
    }
}

private struct Lodge: View {
    @ObservedObject var game: SnowWindow
    @Environment(\.openImmersiveSpace) var open
    @Environment(\.dismissImmersiveSpace) var dismiss
    @Environment(\.scenePhase) var phase
    @Environment(\.dismissWindow) var hideWindow
    @Environment(\.pushWindow) var pushWindow
    var body: some View {
        ZStack {
            GameView(game: game)
            SlopeControls(ui: game.interface)
        }
            .handlesGameControllerEvents(matching: .gamepad)
            .onAppear {
                game.open = { await open(id: "slope") }
                game.showInstruments = { pushWindow(id: "instruments") }
                game.hideInstruments = { hideWindow(id: "instruments") }
                game.dismiss = { await dismiss() }
            }
            .onChange(of: phase) { _, next in
                if next == .background { game.windowBackgrounded() }
            }
            .alert("Cold Smoke", isPresented: Binding(get: { game.problem != nil }, set: { if !$0 { game.problem = nil } })) {
                Button("OK") { game.problem = nil }
            } message: { Text(game.problem ?? "") }
    }
}
private struct GameView: UIViewControllerRepresentable {
    let game: SnowWindow
    func makeUIViewController(context: Context) -> SnowWindow { game }
    func updateUIViewController(_ controller: SnowWindow, context: Context) {}
}
private final class Surface: UIView {
    override class var layerClass: AnyClass { CAMetalLayer.self }
}
@MainActor
final class SnowWindow: UIViewController, ObservableObject, WKScriptMessageHandler, WKNavigationDelegate {
    @Published var problem: String?
    let interface = SlopeInterface()
    var showInstruments: (() -> Void)?
    var hideInstruments: (() -> Void)?
    var open: (() async -> OpenImmersiveSpaceAction.Result)?
    private var lodgeHidden = false
    private func restoreLodge() {
        guard lodgeHidden else { return }
        lodgeHidden = false; hideInstruments?()
    }
    var dismiss: (() async -> Void)?
    private var web: WKWebView?
    private var metalLayer: CAMetalLayer?
    private var gamepad: SkiGamepad?
    private var renderer: MetalRenderer?
    private var slope: SpatialSlope?
    private var changing = false
    private var ready = false
    private var pinches: [SpatialEventCollection.Event.ID: Bool] = [:]
    private var hands = (false, false)
    private let page = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Game")

    private func isGamePage(_ url: URL?) -> Bool {
        guard let url, url.isFileURL, let page else { return false }
        return url.standardizedFileURL.path == page.standardizedFileURL.path
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        NotificationCenter.default.addObserver(self, selector: #selector(sceneDidActivate(_:)),
                                               name: UIScene.didActivateNotification, object: nil)
        do {
            guard let device = MTLCreateSystemDefaultDevice(), let page else { throw RenderError("Cannot load Metal or the offline mountain.") }
            let surface = Surface(frame: view.bounds)
            surface.autoresizingMask = [.flexibleWidth, .flexibleHeight]; surface.isUserInteractionEnabled = false
            view.addSubview(surface)
            let layer = surface.layer as! CAMetalLayer
            layer.device = device; layer.pixelFormat = .bgra8Unorm; layer.contentsGravity = .resizeAspect; metalLayer = layer
            let renderer = try MetalRenderer(device: device) { [weak layer] _, _ in
                guard let surface = layer?.nextDrawable() else { return nil }
                return (surface.texture, surface)
            }
            self.renderer = renderer
            let c = WKWebViewConfiguration()
            c.mediaTypesRequiringUserActionForPlayback = []
            interface.perform = { [weak self] id, phase in
                self?.call("window.slope.action(id, phase)", ["id": id, "phase": phase])
            }
            let bridge = MetalBridge(renderer: renderer, presenter: self, url: page)
            bridge.onPhotoPreview = { [weak self] image in
                guard let self, self.slope == nil else { return }
                self.interface.preview = UIImage(cgImage: image)
            }
            c.userContentController.addScriptMessageHandler(bridge, contentWorld: .page, name: "metal")
            c.userContentController.add(self, name: "slope")
            let w = WKWebView(frame: view.bounds, configuration: c)
            w.autoresizingMask = [.flexibleWidth, .flexibleHeight]; w.isOpaque = false; w.backgroundColor = .clear
            w.scrollView.backgroundColor = .clear; w.scrollView.isScrollEnabled = false
            w.scrollView.contentInsetAdjustmentBehavior = .never
            #if DEBUG
            w.isInspectable = true
            #endif
            w.accessibilityElementsHidden = true
            view.addSubview(w); web = w; w.navigationDelegate = self
            gamepad = SkiGamepad { [weak self] p in
                self?.call("window.slope?.pad(p)", ["p": p as Any? ?? NSNull()])
            }
            w.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
        } catch { fail(error.localizedDescription) }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let scale = view.traitCollection.displayScale
        metalLayer?.drawableSize = CGSize(width: view.bounds.width * scale, height: view.bounds.height * scale)
    }
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let allowed = isGamePage(action.request.url) && action.targetFrame?.isMainFrame == true
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-SlopeDiagnostics") {
            let normalized = action.request.url?.standardizedFileURL.path != page?.path
            reportSlopeMilestone("Window navigation allowed=\(allowed), bundle path needed normalization=\(allowed && normalized)")
        }
        #endif
        decisionHandler(allowed ? .allow : .cancel)
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        fail(error.localizedDescription)
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        fail(error.localizedDescription)
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        ready = false; closeSlope(); fail("The game process stopped. Reopen the game to load the mountain.")
    }
    private func fail(_ text: String) {
        slopeLog.error("\(text, privacy: .public)")
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-SlopeDiagnostics") {
            FileHandle.standardError.write(Data(("Slope error: " + text + "\n").utf8))
        }
        #endif
        problem = text
    }
    func call(_ js: String, _ args: [String: Any] = [:], _ done: ((Any?) -> Void)? = nil) {
        guard let web else { done?(nil); return }
        web.callAsyncJavaScript(js, arguments: args, in: nil, in: .page) { result in
            switch result {
            case .success(let value): done?(value)
            case .failure(let error): slopeLog.error("Game JS: \(error.localizedDescription, privacy: .public)"); done?(nil)
            }
        }
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, isGamePage(message.frameInfo.request.url) else { return }
        if let payload = message.body as? [String: Any] {
            do {
                let data = try JSONSerialization.data(withJSONObject: payload)
                let update = try JSONDecoder().decode(SlopeReadout.self, from: data)
                #if DEBUG
                if update.mode != interface.state.mode { reportSlopeMilestone("Native UI: " + update.mode) }
                #endif
                interface.apply(update)
            } catch { slopeLog.error("Invalid interface update: \(error.localizedDescription, privacy: .public)") }
            return
        }
        guard let action = message.body as? String else { return }
        switch action {
        case "ready":
            ready = true; reportSlopeMilestone("Offline mountain ready")
            #if DEBUG
            if ProcessInfo.processInfo.arguments.contains("-SlopeSmoke") { openSlope() }
            #endif
        case "open": openSlope()
        case "close": closeSlope()
        default:
            if action.hasPrefix("error:") { closeSlope(); fail(String(action.dropFirst(6))) }
        }
    }
    private func openSlope() {
        guard ready, !changing, slope == nil, let open else { return }
        changing = true
        Task {
            let result = await open()
            changing = false
            if case .error = result { fail("无法打开沉浸空间，请先关闭其他沉浸体验再试。") }
        }
    }
    private func closeSlope() {
        guard slope != nil, !changing else { return }
        changing = true
        restoreLodge()
        Task { await dismiss?(); changing = false }
    }
    func windowBackgrounded() {
        if slope == nil && !changing { call("window.slope?.background()") }
    }

    @objc private func sceneDidActivate(_ note: Notification) {
        guard ready, let scene = note.object as? UIWindowScene,
              scene === web?.window?.windowScene || slope != nil else { return }
        call("window.slope?.foreground()")
    }

    func attach(_ layer: LayerRenderer) {
        // Each immersive space has independent tracking, frame IDs and pinch ownership.
        let token = UUID(); sessionID = token
        do {
            let spatial = try SpatialSlope(layer, request: { [weak self] packet, reply in
                guard let self, self.sessionID == token else { reply(false); return }
                self.call("return window.slope.frame(packet)", ["packet": packet]) { reply($0 as? Bool == true) }
            }, didEnd: { [weak self] in
                guard let self, self.sessionID == token else { return }
                self.finishSlope()
            })
            slope = spatial
            renderer?.onStereoFrame = { [weak spatial] id, eyes in spatial?.completed(id, eyes: eyes) }
            layer.onSpatialEvent = { [weak self] events in
                guard let self, self.sessionID == token else { return }
                var cancelled = false
                for e in events where e.kind == .indirectPinch || e.kind == .directPinch || e.kind == .pointer {
                    switch e.phase {
                    case .active: self.pinches[e.id] = self.pinches[e.id] ?? (e.chirality == .left)
                    case .ended: self.pinches.removeValue(forKey: e.id)
                    case .cancelled: self.pinches.removeValue(forKey: e.id); cancelled = true
                    @unknown default: break
                    }
                }
                let next = (self.pinches.values.contains(true), self.pinches.values.contains(false))
                if next != self.hands || cancelled {
                    self.hands = next; self.call("window.slope.hands(l,r,c)", ["l":next.0,"r":next.1,"c":cancelled])
                }
            }
            call("window.slope.begin(); return true") { [weak self] ok in
                guard let self, self.sessionID == token else { return }
                guard ok as? Bool == true else { self.closeSlope(); return }
                self.lodgeHidden = true; self.showInstruments?()
                Task {
                    do { try await spatial.start() }
                    catch { self.fail(error.localizedDescription); self.closeSlope(); self.finishSlope() }
                }
                #if DEBUG
                if !self.tested && ProcessInfo.processInfo.arguments.contains("-SlopeSmoke") { self.tested = true; self.smoke(token) }
                if ProcessInfo.processInfo.arguments.contains("-SlopeDiagnostics") { self.sampleQuality(token) }
                #endif
            }
        } catch { fail(error.localizedDescription); Task { await dismiss?() } }
    }
    private var sessionID: UUID?
    #if DEBUG
    private var tested = false
    #endif
    private func finishSlope() {
        renderer?.onStereoFrame = nil
        sessionID = nil; slope?.stop(); slope = nil; pinches.removeAll(); hands = (false,false)
        restoreLodge(); call("window.slope.end()"); slopeLog.notice("Returned to window")
    }
    #if DEBUG
    private func sampleQuality(_ token: UUID) {
        Task {
            let file = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
                .appendingPathComponent("slope-quality.txt")
            var samples = "Immersive session " + Date().ISO8601Format() + "\n"
            try? samples.write(to: file, atomically: true, encoding: .utf8)
            for _ in 0..<12 {
                try? await Task.sleep(for: .seconds(5))
                guard sessionID == token else { return }
                call("""
                    const xr = __ski.m.XR, gpu = __ski.app().gfx.gpuSeconds;
                    const interval = xr.pose?.sceneInterval;
                    return [__ski.ui().state, 'preset ' + __ski.m.Quality.pick, xr.stats.frames + ' updates', xr.stats.W + 'x' + xr.stats.H,
                      'scale ' + xr.scale.toFixed(2), (gpu * 1000).toFixed(1) + ' ms GPU (latest)',
                      (interval > 0 ? (1 / interval).toFixed(1) : 'n/a') + ' new frames/s',
                      (xr.stats.avg * 1000).toFixed(1) + ' ms/update (last window)'].join(', ');
                    """) { result in
                    guard self.sessionID == token, let text = result as? String else { return }
                    reportSlopeMilestone(text)
                    samples += text + "\n"
                    try? samples.write(to: file, atomically: true, encoding: .utf8)
                }
            }
        }
    }

    private func smoke(_ token: UUID) {
        Task {
            let pad = GCController.withExtendedGamepad()
            guard let p = pad.extendedGamepad else { return }
            gamepad?.bind(pad)
            defer { gamepad?.bind(GCController.controllers().first { $0.extendedGamepad != nil }) }
            @MainActor func query(_ js: String) async -> Any? {
                await withCheckedContinuation { c in call("return " + js) { c.resume(returning: $0) } }
            }
            @MainActor func check(_ js: String, _ label: String) async -> Bool {
                for _ in 0..<100 {
                    if await query(js) as? Bool == true { slopeLog.notice("PASS \(label, privacy: .public)"); return true }
                    try? await Task.sleep(nanoseconds: 150_000_000)
                }
                slopeLog.error("FAIL \(label, privacy: .public)"); return false
            }
            guard await check("__ski.m.XR.stats.frames > 1", "compositor frames") else { return }
            // Exercise both modes without writing the wearer's input preference.
            let savedMotion = await query("__ski.m.XR.bodyControls") as? Bool ?? false
            defer { call("__ski.m.XR.bodyControls = enabled", ["enabled": savedMotion]) }
            call("__ski.m.XR.bodyControls = false; slope.hands(true,false,false); slope.hands(false,false,false)")
            guard await check("__ski.ui().state === 'title'", "pinch cannot start controller mode") else { return }
            p.buttonA.setValue(1)
            guard await check("__ski.ui().state === 'run' && !__ski.input().jump", "A starts without charging") else { return }
            p.rightShoulder.setValue(1)
            guard await check("__ski.game().view === 'fp' && Math.hypot(...__ski.m.XR.rig.map((v,i) => v - __ski.game().root.pos[i])) < 2", "RB reaches first person") else { return }
            @MainActor func checkCamera(_ zh: String, _ en: String) async -> Bool {
                for _ in 0..<20 {
                    let hud = interface.state
                    if hud.mode == "run", hud.camera == hud.text(zh, en) {
                        slopeLog.notice("PASS HUD camera: \(hud.camera, privacy: .public)")
                        return true
                    }
                    try? await Task.sleep(nanoseconds: 100_000_000)
                }
                slopeLog.error("FAIL HUD camera: \(en, privacy: .public)")
                return false
            }
            guard await checkCamera("第一人称", "First person") else { return }
            p.rightShoulder.setValue(0); p.leftShoulder.setValue(1)
            guard await check("__ski.game().view === 'chase'", "LB returns to chase") else { return }
            guard await checkCamera("追尾", "Chase") else { return }
            p.leftShoulder.setValue(0)
            p.buttonX.setValue(1)
            guard await check("!!__ski.m.XR.photoMode && Photo.shots === 0", "first X frames without taking a photo") else { return }
            let frozen = (await query("__ski.game().dist") as? NSNumber)?.doubleValue ?? -1
            p.leftThumbstick.xAxis.setValue(0.7)
            guard await check("Math.hypot(...__ski.m.XR.rig.map((v,i) => v-__ski.m.XR.photoMode.rig[i])) > 0.15 && __ski.game().dist === \(frozen) && Photo.shots === 0", "stick moves photo rig while skiing stays frozen and X is held") else { return }
            p.leftThumbstick.xAxis.setValue(0); p.buttonX.setValue(0)
            guard await check("Math.abs(Photo.pad.x) < 0.01", "photo stick released") else { return }
            p.buttonX.setValue(1)
            guard await check("Photo.shots === 1 && __ski.game().dist === \(frozen)", "second X saves immersive photo at frozen position") else { return }
            p.buttonX.setValue(0); p.buttonB.setValue(1)
            guard await check("!__ski.m.XR.photoMode && __ski.game().dist > \(frozen) && Photo.shots === 1", "B resumes the same run") else { return }
            p.buttonB.setValue(0)
            p.buttonA.setValue(0); p.leftThumbstick.xAxis.setValue(0.4); p.rightTrigger.setValue(1)
            guard await check("__ski.input().u > 0.2 && __ski.input().tuck && __ski.game().dist > 2", "stick and RT while skiing") else { return }
            p.leftThumbstick.xAxis.setValue(0); p.rightTrigger.setValue(0); p.buttonA.setValue(1)
            guard await check("__ski.game().s.charge >= 0.99", "A charges fully") else { return }
            p.buttonA.setValue(0)
            guard await check("__ski.game().s.air || __ski.game().s.popT >= 0", "release launches jump") else { return }
            // Synthetic pinch states use the same bridge as CompositorServices spatial events.
            call("slope.hands(true,true,false)")
            guard await check("!__ski.input().btn.jump && !__ski.input().btn.tuck", "pinches ignored with body controls off") else { return }
            call("__ski.m.XR.bodyControls = true")
            call("slope.hands(false,true,false)")
            guard await check("__ski.input().tuck", "right pinch tucks") else { return }
            call("slope.hands(true,false,false)")
            guard await check("__ski.input().jump && !__ski.input().tuck", "left pinch charges separately") else { return }
            call("slope.hands(false,false,true)")
            guard await check("!__ski.input().jump && !__ski.game().s.jOn", "cancel releases hands") else { return }
            let seed = (await query("__ski.m.Course.seed") as? NSNumber)?.intValue ?? -1
            p.buttonMenu.setValue(1)
            guard await check("!__ski.m.XR.active && __ski.ui().open && __ski.ui().paused", "Menu returns to paused window") else { return }
            p.buttonMenu.setValue(0)
            let distance = (await query("__ski.game().dist") as? NSNumber)?.doubleValue ?? -1
            try? await Task.sleep(nanoseconds: 500_000_000)
            guard await check("__ski.game().dist === \(distance)", "paused distance stays fixed") else { return }
            p.buttonMenu.setValue(1)
            guard await check("!__ski.ui().open", "Menu resumes window") else { return }
            p.buttonMenu.setValue(0); p.buttonX.setValue(1)
            guard await check("Photo.on && Photo.shots === 1", "first X opens window composition") else { return }
            p.buttonX.setValue(0); p.rightThumbstick.xAxis.setValue(0.5)
            guard await check("Photo.pad.lookX > 0.2", "window framing uses right stick") else { return }
            p.rightThumbstick.xAxis.setValue(0); p.buttonX.setValue(1)
            guard await check("Photo.on && Photo.shots === 2", "second X saves window photo") else { return }
            p.buttonX.setValue(0); p.buttonB.setValue(1)
            guard await check("!Photo.on && !__ski.ui().open", "B returns to window skiing") else { return }
            p.buttonB.setValue(0)
            p.buttonMenu.setValue(1)
            guard await check("__ski.ui().paused", "window pauses before reentering Immersive") else { return }
            p.buttonMenu.setValue(0)
            p.buttonY.setValue(1)
            guard await check("__ski.m.XR.active && __ski.m.Course.seed === \(seed) && __ski.game().dist > \(distance)", "Y resumes same mountain and advances") else { return }
            p.buttonY.setValue(0)
            slopeLog.notice("Vision smoke passed: resumed from \(distance) m on mountain \(seed)")
        }
    }
    #endif
}
