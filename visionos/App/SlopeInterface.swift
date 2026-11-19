import Photos
import SwiftUI

struct SlopeReadout: Decodable, Equatable {
    struct Challenge: Decodable, Equatable { let passed, missed: Int }
    var mode = "loading"
    var english = Locale.preferredLanguages.first?.hasPrefix("zh") == false
    var body = false, sound = true, bare = false, advancedMenu = false
    var speed = 0, drop = 0
    var camera = "", notice = "", detail = ""
    var challenge: Challenge?
    var settings: PauseSettings?

    func text(_ zh: String, _ en: String) -> String { english ? en : zh }
}

@MainActor
final class SlopeInterface: ObservableObject {
    @Published private(set) var state = SlopeReadout()
    @Published private(set) var menu: PauseMenuModel?
    @Published var preview: UIImage?
    @Published var saving = false
    var perform: (String, String) -> Void = { _, _ in }

    func apply(_ update: SlopeReadout) {
        guard update != state else { return }
        if let settings = update.settings {
            if let menu { if menu.state != settings { menu.state = settings } }
            else { menu = PauseMenuModel(settings) { [weak self] id in self?.perform(id, "tap") } }
        } else if menu != nil { menu = nil }
        if update.mode != "photo" { preview = nil }
        state = update
    }

    func savePreview() async throws {
        guard let preview, !saving else { return }
        saving = true
        defer { saving = false }
        let access = await PHPhotoLibrary.requestAuthorization(for: .addOnly)
        guard access == .authorized || access == .limited else {
            throw RenderError(state.text("请在设置中允许添加照片。", "Allow access to add photos in Settings."))
        }
        try await PHPhotoLibrary.shared().performChanges { PHAssetChangeRequest.creationRequestForAsset(from: preview) }
        if self.preview === preview { self.preview = nil }
    }
}

private struct SkiMetrics: View {
    let state: SlopeReadout
    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 14) {
            HStack(alignment: .firstTextBaseline, spacing: 5) {
                Text(state.speed, format: .number).font(.system(size: 38, weight: .medium, design: .rounded))
                Text("km/h").font(.caption)
            }
            Label {
                Text("\(state.drop.formatted()) m")
            } icon: { Image(systemName: "arrow.down.right") }
            .font(.headline).foregroundStyle(.secondary)
        }
        .monospacedDigit().fixedSize()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(state.text("时速 \(state.speed) 公里，落差 \(state.drop) 米", "\(state.speed) kilometers per hour, vertical drop \(state.drop) meters"))
        .accessibilityIdentifier("ski-metrics")
    }
}

private struct RingProgress: View {
    let state: SlopeReadout
    var body: some View {
        if let challenge = state.challenge {
            Label(state.text("光圈", "Rings") + " \(challenge.passed) / \(challenge.passed + challenge.missed)", systemImage: "circle.dashed")
                .font(.headline).monospacedDigit().foregroundStyle(.secondary)
                .accessibilityIdentifier("ring-progress")
        }
    }
}

struct SlopeControls: View {
    @ObservedObject var ui: SlopeInterface
    var immersive = false
    @State private var saveError: String?
    private var s: SlopeReadout { ui.state }
    private func t(_ zh: String, _ en: String) -> String { s.text(zh, en) }
    private func tap(_ id: String) { ui.perform(id, "tap") }
    private func icon(_ id: String, _ symbol: String, _ label: String) -> some View {
        Button { tap(id) } label: { Image(systemName: symbol).frame(width: 28, height: 28) }
            .buttonBorderShape(.circle).accessibilityLabel(label).accessibilityIdentifier(id)
    }
    private func hold(_ id: String, _ symbol: String, _ label: String) -> some View {
        HoldControl(symbol: symbol, label: label) { down in ui.perform(id, down ? "down" : "up") }
            .accessibilityIdentifier(id)
    }
    var body: some View {
        Group {
            if immersive { instruments }
            else if let image = ui.preview {
                VStack(spacing: 12) {
                    Image(uiImage: image).resizable().scaledToFit().accessibilityLabel(t("雪场照片","Slope photo"))
                    HStack {
                        Button { ui.preview = nil } label: { Image(systemName: "chevron.backward") }
                            .accessibilityLabel(t("返回取景","Back to camera"))
                        Spacer()
                        Button { Task { do { try await ui.savePreview() } catch { saveError = error.localizedDescription } } }
                            label: { Image(systemName: "square.and.arrow.down") }
                            .accessibilityLabel(t("保存到相册","Save to Photos"))
                    }.disabled(ui.saving)
                }.padding(24).frame(maxWidth: .infinity, maxHeight: .infinity).background(.regularMaterial)
            } else if let menu = ui.menu {
                PauseMenu(model: menu)
            } else { windowContent }
        }
        .alert(t("照片","Photo"), isPresented: Binding(get: { saveError != nil }, set: { if !$0 { saveError = nil } })) {
            Button(t("好","OK")) { saveError = nil }
        } message: { Text(saveError ?? "") }
    }

    @ViewBuilder private var instruments: some View {
        VStack(spacing: 9) {
            switch s.mode {
            case "run":
                HStack(alignment: .firstTextBaseline, spacing: 14) {
                    SkiMetrics(state: s)
                    if !s.camera.isEmpty {
                        Label(s.camera, systemImage: "viewfinder")
                            .font(.headline).foregroundStyle(.secondary)
                            .accessibilityLabel(t("视角，\(s.camera)", "Camera, \(s.camera)"))
                    }
                    RingProgress(state: s)
                }
            case "photo":
                Label(s.notice.isEmpty ? t("转头取景 · 左摇杆移动","Look to frame · Left stick to move") : s.notice, systemImage: "camera")
                    .font(.headline)
                Text(t("X 拍摄 · B 返回滑行","X to capture · B to ski")).font(.subheadline).foregroundStyle(.secondary)
            case "title", "starting":
                Label(s.body ? t("捏合并松开出发","Pinch and release to start") : t("按 A 出发","Press A to ski"), systemImage: s.body ? "hand.pinch" : "gamecontroller")
                    .font(.title2.bold())
                Text(s.body ? t("左右倾身转向 · 左手起跳 · 右手加速","Lean to steer · Left pinch to jump · Right pinch to tuck") : t("左摇杆转向 · 按住 A 蓄力 · RT 加速","Left stick to steer · Hold A to charge · RT to tuck"))
                Text(t("LB / RB 切换机位 · X 拍照 · Y 校准 · Menu 退出","LB / RB for cameras · X for photos · Y to recenter · Menu to exit"))
                    .font(.footnote).foregroundStyle(.secondary)
            default: ProgressView()
            }
        }.multilineTextAlignment(.center).padding(.horizontal, 22).padding(.vertical, 13)
            .glassBackgroundEffect(in: RoundedRectangle(cornerRadius: 28))
    }

    @ViewBuilder private var windowContent: some View {
        switch s.mode {
        case "title":
            SummitTitle(state: s, tap: tap)
        case "run":
            VStack {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        SkiMetrics(state: s)
                        RingProgress(state: s)
                    }.padding(14).glassBackgroundEffect(in: Capsule())
                    Spacer()
                    icon("mn","line.3.horizontal",t("滑行菜单","Ski menu"))
                    icon("snd",s.sound ? "speaker.wave.2.fill" : "speaker.slash.fill",t("游戏声音","Game sound"))
                    icon("photo","camera",t("拍摄","Photo"))
                }
                Spacer()
                if !s.notice.isEmpty { VStack { Text(s.notice).font(.headline); if !s.detail.isEmpty { Text(s.detail).font(.caption) } }.padding(12).glassBackgroundEffect() }
                HStack {
                    HStack(spacing: 6) { icon("prev","chevron.backward",t("上一个机位","Previous camera")); Text(s.camera); icon("next","chevron.forward",t("下一个机位","Next camera")) }
                    Spacer()
                    hold("tuck","forward.fill",t("加速","Tuck")); hold("jump","figure.skiing.downhill",t("跳","Jump"))
                }
            }.padding(24)
        case "photo":
            VStack {
                HStack {
                    icon("ph-back","chevron.backward",t("返回滑行","Back to skiing")); Spacer()
                    if !s.bare { icon("ph-reset","arrow.counterclockwise",t("复位","Reset")) }
                    icon("photoWords",s.bare ? "eye" : "eye.slash",s.bare ? t("显示提示","Show hints") : t("隐藏提示","Hide hints"))
                }
                Spacer()
                if !s.bare {
                    HStack { Spacer(); VStack {
                        hold("ph-up","chevron.up",t("升高","Raise camera"))
                        icon("ph-shut","camera.shutter.button",t("拍照","Take photo"))
                        hold("ph-dn","chevron.down",t("降低","Lower camera"))
                    } }
                }
                Spacer()
                if !s.bare { Text(s.notice.isEmpty ? t("左摇杆移动 · 右摇杆取景","Left stick to move · Right stick to look") + "   " + s.detail : s.notice).padding(10).glassBackgroundEffect() }
            }.padding(24)
        case "lost": Button(t("重新载入雪场","Reload mountain")) { tap("reload") }
        default: ProgressView(t("正在准备雪场","Preparing the mountain")).padding(22).glassBackgroundEffect()
        }
    }
}

private struct SummitTitle: View {
    let state: SlopeReadout
    let tap: (String) -> Void
    @Environment(\.dynamicTypeSize) private var typeSize
    private let sun = Color(red: 1, green: 0.80, blue: 0.51)

    private func shortcut(_ id: String, _ symbol: String, _ zh: String, _ en: String) -> some View {
        Button { tap(id) } label: {
            Label(state.text(zh, en), systemImage: symbol)
                .frame(maxWidth: .infinity, minHeight: 32, alignment: .leading)
        }.accessibilityIdentifier(id)
    }

    var body: some View {
        GeometryReader { geo in
            let wide = geo.size.width >= 620 && geo.size.width > geo.size.height
            let alignment: HorizontalAlignment = wide ? .leading : .center
            let margin: CGFloat = wide ? min(80, geo.size.width * 0.065) : 24
            ScrollView {
                VStack(alignment: alignment, spacing: 30) {
                    VStack(alignment: alignment, spacing: 12) {
                        Text(verbatim: "雪迹")
                            .font(.custom("NotoSerifSC-Bold", size: wide ? 78 : 54, relativeTo: .largeTitle))
                            .tracking(wide ? 22 : 14)
                        Rectangle().fill(sun).frame(width: 34, height: 1)
                        Text(verbatim: "COLD SMOKE").font(.custom("Jost-Regular", size: 15, relativeTo: .subheadline)).tracking(5)
                        Text(state.text("一个人，一座山，一直往下", "One skier, one mountain, all the way down"))
                            .font(.system(.headline, design: .serif)).tracking(state.english ? 0.6 : 2)
                            .padding(.top, 4)
                    }
                    .foregroundStyle(.white).shadow(color: .black.opacity(0.65), radius: 5, y: 1)
                    .multilineTextAlignment(wide ? .leading : .center)
                    .accessibilityElement(children: .combine).accessibilityAddTraits(.isHeader)

                    VStack(spacing: 10) {
                        Button { tap("space") } label: {
                            Label(state.text("沉浸模式", "Immersive"), systemImage: "vision.pro")
                                .font(.headline).frame(maxWidth: .infinity, minHeight: 38)
                        }.buttonStyle(.borderedProminent).tint(sun).foregroundStyle(.black)
                            .accessibilityIdentifier("space")
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10),
                                                 count: typeSize.isAccessibilitySize || geo.size.width < 360 ? 1 : 2), spacing: 8) {
                            if state.advancedMenu { shortcut("open:sky", "cloud.sun", "场景", "Scene") }
                            shortcut("open:view", "viewfinder", "视角", "Camera")
                            if state.advancedMenu { shortcut("daily", "mountain.2", "今日之山", "Daily mountain") }
                            shortcut("open:keys", "gamecontroller", "操作", "Controls")
                            shortcut("start", "play.fill", "窗口滑行", "Ski in window")
                            shortcut("open:opt", "slider.horizontal.3", "偏好设置", "Preferences")
                        }.buttonStyle(.bordered)
                    }.frame(maxWidth: 370)
                }
                .frame(maxWidth: .infinity, minHeight: max(0, geo.size.height - 48), alignment: wide ? .leading : .center)
                .padding(.horizontal, margin).padding(.vertical, 24)
            }
            .scrollBounceBehavior(.basedOnSize)
            .background {
                LinearGradient(colors: [.black.opacity(0.46), .clear],
                               startPoint: wide ? .leading : .top, endPoint: wide ? .trailing : .bottom)
                    .allowsHitTesting(false)
            }
        }
    }
}

private struct HoldControl: View {
    let symbol: String, label: String
    let change: (Bool) -> Void
    @GestureState private var held = false
    var body: some View {
        Image(systemName: symbol).font(.title3).frame(width: 52, height: 52)
            .glassBackgroundEffect(in: Circle()).contentShape(.interaction, Circle()).hoverEffect()
            .opacity(held ? 0.65 : 1)
            .gesture(DragGesture(minimumDistance: 0).updating($held) { _, state, _ in state = true })
            .onChange(of: held) { _, pressed in change(pressed) }
            .onDisappear { if held { change(false) } }
            .accessibilityLabel(label).accessibilityAddTraits(.isButton)
            .accessibilityAction { change(true); change(false) }
    }
}
