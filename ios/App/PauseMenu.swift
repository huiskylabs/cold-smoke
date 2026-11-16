import SwiftUI

// Only presentation and navigation live here. Values and actions come from the same
// running game as the HUD, including the variants registered by the web build.
struct PauseSettings: Decodable, Equatable {
    struct Choice: Decodable, Equatable, Identifiable {
        let id, title: String
        let on, marked: Bool
    }
    struct Versions: Decodable, Equatable {
        struct Row: Decodable, Equatable { let title: String; let options: [Choice] }
        let title: String
        let rows: [Row]
    }
    struct Gesture: Decodable, Equatable { let title, detail: String }
    let sections, times, weather, views, terrain, encounters: [Choice]
    let active, seed, record, quality, tier, snowfall: String
    let running, direct, english, sound, daily: Bool
    let versions: [Versions]
    let help: [Gesture]
}

final class PauseMenuModel: ObservableObject {
    @Published var state: PauseSettings
    @Published var bar: CGRect = .null
    let send: (String) -> Void
    init(_ state: PauseSettings, send: @escaping (String) -> Void) { self.state = state; self.send = send }
}

struct PauseMenu: View {
    typealias Choice = PauseSettings.Choice
    @ObservedObject var model: PauseMenuModel
    @Environment(\.horizontalSizeClass) private var widthClass
    @Environment(\.dynamicTypeSize) private var typeSize
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @State private var detailVisible: Bool
    @State private var confirmation: String?
    @ScaledMetric(relativeTo: .body) private var tileWidth: CGFloat = 82
    private var captionInk: Color { Color.primary.opacity(0.88) }
    private var s: PauseSettings { model.state }
    init(model: PauseMenuModel) {
        self.model = model
        _detailVisible = State(initialValue: model.state.direct)
    }
    private func t(_ zh: String, _ en: String) -> String { s.english ? en : zh }
    private func send(_ id: String) { model.send(id) }
    private func title(_ page: String) -> String {
        switch page {
        case "mt": return t("雪山", "Mountain")
        case "opt": return t("偏好设置", "Preferences")
        case "vers": return t("版本对比", "Version comparison")
        default: return s.sections.first { $0.id == "nav:" + page }?.title ?? ""
        }
    }
    private func open(_ page: String) { detailVisible = true; send("nav:" + page) }
    private var liveTime: Choice? { s.times.first(where: \.marked) ?? s.times.first(where: \.on) }
    private var status: String {
        [liveTime?.title, s.snowfall].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · ")
    }
    private func symbol(_ id: String) -> String {
        let icons = ["sky":"cloud.sun","view":"viewfinder","seg":"point.bottomleft.forward.to.point.topright.scurvepath",
                     "ev":"pawprint","mt":"mountain.2","keys":"hand.draw","opt":"slider.horizontal.3","vers":"square.stack.3d.up",
                     "day":"sun.max.fill","golden":"sun.horizon.fill","sunset":"sunset.fill","dusk":"moon.haze.fill","night":"moon.stars.fill","dawn":"sunrise.fill",
                     "chase":"figure.skiing.downhill","fp":"eye","tips":"skis","low":"arrow.down","high":"arrow.up",
                     "left":"arrow.left","right":"arrow.right","front":"person.crop.square","far":"scope"]
        return icons[id] ?? "circle"
    }
    var body: some View {
        GeometryReader { geo in
            // Two panes need 588 points of content width plus the outer margins.
            let wide = widthClass != .compact && geo.size.width >= 652 && !typeSize.isAccessibilitySize
            let inset: CGFloat = wide ? 32 : 16
            let fold = division(in: geo)
            let stacked = !fold.isNull && fold.width > fold.height
            let gap = fold.isNull ? 12 : (stacked ? fold.height : fold.width) + 2 * inset
            let layout = stacked ? AnyLayout(VStackLayout(spacing: gap)) : AnyLayout(HStackLayout(spacing: gap))
            let rail = !wide && !model.bar.isNull
            ZStack {
                Color.black.opacity(0.12).ignoresSafeArea()
                layout {
                    if wide || !detailVisible {
                        directory(wide: wide, rail: rail)
                            .frame(width: wide && !stacked ? (fold.isNull ? min(264, max(205, geo.size.width * 0.28)) : max(0, fold.minX - 2 * inset)) : nil,
                                   height: wide && stacked ? max(0, fold.minY - 2 * inset) : nil)
                    }
                    if wide || detailVisible { detail(wide: wide, rail: rail) }
                }
                .padding(inset)
                .onAppear { if wide { detailVisible = true } }
                .onChange(of: wide) { isWide in if isWide { detailVisible = true } }
            }.overlay(alignment: .topLeading) {
                if rail {
                    GeometryReader { full in
                        let origin = full.frame(in: .global).origin
                        VStack(spacing: 8) {
                            if detailVisible {
                                railButton("chevron.backward", t("返回","Back"), "settings-back") { back() }
                            }
                            if !s.running || detailVisible {
                                railButton(s.running ? "play.fill" : "xmark", s.running ? t("继续滑行","Resume") : t("关闭","Close"),
                                           s.running ? "m-go" : "menu-close") { send(s.running ? "m-go" : "mn") }
                            }
                        }.fixedSize().position(x: model.bar.midX - origin.x,
                            y: model.bar.minY - origin.y + (detailVisible ? 50 : 23))
                    }.ignoresSafeArea()
                }
            }
        }
        .preferredColorScheme(.dark)
        .environment(\.locale, Locale(identifier: s.english ? "en" : "zh-Hans"))
        .alert(t("重新开始滑行？", "Start a new run?"), isPresented: Binding(get: { confirmation != nil }, set: { if !$0 { confirmation = nil } }),
               presenting: confirmation) { id in
            Button(t("取消","Cancel"), role: .cancel) {}
            Button(actionTitle(id), role: .destructive) { send(id) }
        } message: { id in Text(id == "m-top" ? t("这一趟滑行会结束，你将回到山顶的出发页。","This run will end and you’ll return to the start screen.") : t("这一趟滑行会结束，你将从新雪山的山顶出发。", "This run will end. You’ll start at the summit of the new mountain.")) }
    }
    private func division(in geometry: GeometryProxy) -> CGRect {
        if #available(iOS 27.1, *) { return geometry.reservedRegions(kind: .division).first(where: \.isActive)?.frame ?? .null }
        return .null
    }
    private func back() {
        if s.active == "vers" { open("opt") } else { detailVisible = false }
    }
    @ViewBuilder private func railButton(_ icon: String, _ label: String, _ id: String, action: @escaping () -> Void) -> some View {
        let button = Button(action: action) { Image(systemName: icon).font(.body.weight(.semibold)).frame(width: 46, height: 46) }
            .accessibilityLabel(label).accessibilityIdentifier(id)
        if #available(iOS 26, *) {
            button.buttonStyle(.plain).glassEffect(.regular.interactive(), in: Circle())
        } else { button.buttonStyle(.plain).background(.regularMaterial, in: Circle()) }
    }
    // The two panes sample the ski scene. Keep the header and all of a pane's
    // scrolling rows on the same glass surface, without nested glass cards.
    private struct PaneGlass: ViewModifier {
        @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
        @Environment(\.colorSchemeContrast) private var contrast
        var hasPreview = false
        @ViewBuilder func body(content: Content) -> some View {
            let shape = RoundedRectangle(cornerRadius: 24, style: .continuous)
            if reduceTransparency {
                // The weather page supplies opaque backing only under its controls.
                content.background(hasPreview ? Color.clear : Color(uiColor: .secondarySystemBackground), in: shape)
                    .clipShape(shape)
            } else if #available(iOS 26, *) {
                content.clipShape(shape)
                    .glassEffect(.clear, in: shape)
                    .background(.black.opacity(contrast == .increased ? 0.55 : 0.40), in: shape)
            } else {
                content.background(.thinMaterial, in: shape).clipShape(shape)
            }
        }
    }
    private func resume() -> some View {
        let label = s.running ? t("继续滑行","Resume") : t("出发","Start skiing")
        return Button { send("m-go") } label: {
            Label(label, systemImage: "play.fill").foregroundStyle(.primary).font(.headline).frame(maxWidth: .infinity, minHeight: 32)
        }.modifier(PrimaryAction()).accessibilityIdentifier("m-go")
    }
    private struct PrimaryAction: ViewModifier {
        @ViewBuilder func body(content: Content) -> some View {
            if #available(iOS 26.0, *) { content.buttonStyle(.glass).controlSize(.large) }
            else { content.buttonStyle(.bordered).controlSize(.large) }
        }
    }
    private func smallButton(_ icon: String, _ label: String, _ id: String, perform: @escaping () -> Void) -> some View {
        Button(action: perform) { Image(systemName: icon).font(.body.weight(.semibold)).frame(minWidth: 44, minHeight: 44) }
            .foregroundStyle(.primary).accessibilityLabel(label).accessibilityIdentifier(id)
    }
    private func directory(wide: Bool, rail: Bool) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text(s.running ? t("滑行暂停","Paused") : t("滑行菜单","Ski menu")).font(.largeTitle.bold()).accessibilityAddTraits(.isHeader)
                Spacer(minLength: 0)
                if !s.running && !rail { smallButton("xmark", t("关闭","Close"), "menu-close") { send("mn") } }
            }.padding(.horizontal, 18).padding(.top, 14).padding(.bottom, 6)
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    navGroup(t("本次滑行","This run"), ["sky","view","seg","ev","mt"], wide)
                    navGroup(t("更多","More"), ["keys","opt"], wide)
                }.padding(.horizontal, 10).padding(.vertical, 6)
            }
            Divider()
            resume().padding(12)
        }.modifier(PaneGlass())
    }
    private func navGroup(_ heading: String, _ ids: [String], _ wide: Bool) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(heading).font(.subheadline.weight(.semibold)).foregroundStyle(captionInk).padding(.horizontal, 12).padding(.bottom, 4)
            ForEach(ids.filter { id in s.sections.contains { $0.id == "nav:" + id } }, id: \.self) { id in
                let active = wide && (s.active == id || (s.active == "vers" && id == "opt"))
                Button { open(id) } label: {
                    HStack(spacing: 10) {
                        Image(systemName: symbol(id)).foregroundStyle(active ? Color.primary : Color.secondary).frame(width: 23)
                        Text(title(id)).font(.body.weight(active ? .semibold : .regular))
                        Spacer(minLength: 0)
                        if !wide { Image(systemName: "chevron.forward").font(.caption.bold()).foregroundStyle(.tertiary) }
                    }.padding(.horizontal, 12).frame(minHeight: 44)
                        .background(active ? Color.primary.opacity(0.13) : .clear, in: RoundedRectangle(cornerRadius: 12))
                        .contentShape(Rectangle())
                }.buttonStyle(.plain).accessibilityAddTraits(active ? .isSelected : []).accessibilityIdentifier("settings-nav-" + id)
            }
        }
    }
    private func detail(wide: Bool, rail: Bool) -> some View {
        let page = s.active
        return VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                if !rail && (!wide || page == "vers") {
                    smallButton("chevron.backward",t("返回","Back"),"settings-back") {
                        back()
                    }
                }
                Text(title(page)).font(.title.bold()).accessibilityAddTraits(.isHeader)
                Spacer(minLength: 0)
                if !wide && !rail {
                    if s.running { smallButton("play.fill", t("继续滑行","Resume"), "m-go") { send("m-go") } }
                    else { smallButton("xmark",t("关闭","Close"),"menu-close") { send("mn") } }
                }
            }.padding(.horizontal, wide ? 20 : 8).padding(.vertical, 8)
            .frame(minHeight: 58)
            .background(reduceTransparency && page == "sky" ? Color(uiColor: .secondarySystemBackground) : .clear)
            Divider()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    switch page {
                    case "sky": weatherPage()
                    case "view": viewsPage()
                    case "seg": terrainPage()
                    case "ev": encountersPage()
                    case "mt": mountainPage()
                    case "keys": helpPage()
                    case "opt": preferencesPage()
                    case "vers": versionsPage()
                    default: EmptyView()
                    }
                }.padding(16).frame(maxWidth: .infinity, alignment: .leading)
            }.id(page)
        }.frame(maxWidth: .infinity, maxHeight: .infinity).modifier(PaneGlass(hasPreview: page == "sky"))
    }
    private func group<Content: View>(_ label: String, footer: String = "", @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            if !label.isEmpty { Text(label).font(.headline).accessibilityAddTraits(.isHeader) }
            content()
            if !footer.isEmpty { Text(footer).font(.footnote).foregroundStyle(captionInk).fixedSize(horizontal: false, vertical: true) }
        }.padding(14).frame(maxWidth: .infinity, alignment: .leading)
            .background(reduceTransparency && s.active == "sky" ? Color(uiColor: .secondarySystemBackground) : .clear,
                        in: RoundedRectangle(cornerRadius: 17, style: .continuous))
    }
    private func row(_ label: String, detail: String = "", icon: String? = nil, trailing: String? = nil) -> some View {
        HStack(spacing: 12) {
            if let icon { Image(systemName: icon).foregroundStyle(.secondary).frame(width: 24) }
            VStack(alignment: .leading, spacing: 3) {
                Text(label)
                if !detail.isEmpty { Text(detail).font(.footnote).foregroundStyle(captionInk) }
            }
            Spacer(minLength: 8)
            if let trailing { Image(systemName: trailing).font(.subheadline.bold()).foregroundStyle(trailing == "checkmark" ? Color.primary : Color.secondary) }
        }.frame(minHeight: 44).contentShape(Rectangle())
    }
    private func rows<R: View>(_ choices: [Choice], @ViewBuilder _ make: @escaping (Choice) -> R) -> some View {
        VStack(spacing: 0) {
            ForEach(choices) { c in
                if c.id != choices.first?.id { Divider() }
                make(c)
            }
        }
    }
    private func weatherPage() -> some View {
        let automatic = s.times.first { $0.id == "time:auto" }?.on == true
        return VStack(alignment: .leading, spacing: 14) {
            // This transparent window looks directly onto Metal's current frame.
            VStack(alignment: .leading, spacing: 4) {
                Label(t("雪场实景","On the mountain"), systemImage: "viewfinder").font(.subheadline.weight(.semibold))
                Text(status).font(.title3.bold())
            }.foregroundStyle(.white).shadow(radius: 3)
                .frame(maxWidth: .infinity, minHeight: 82, alignment: .bottomLeading).padding(12)
                .background {
                    if reduceTransparency { LinearGradient(colors: [.clear, .black.opacity(0.65)], startPoint: .top, endPoint: .bottom) }
                }
            group(t("天色","Time of day")) {
                Toggle(t("自动昼夜变化","Automatic daylight"), isOn: Binding(get: { automatic }, set: { auto in
                    send(auto ? "time:auto" : (liveTime?.id == "time:auto" ? "time:day" : liveTime?.id ?? "time:day"))
                })).frame(minHeight: 44).accessibilityIdentifier("settings-auto-time")
                Divider()
                LazyVGrid(columns: [GridItem(.adaptive(minimum: tileWidth), spacing: 6)], spacing: 6) {
                    ForEach(s.times.filter { $0.id != "time:auto" }) { c in
                        Button { send(c.id) } label: {
                            VStack(spacing: 4) {
                                Image(systemName: symbol(String(c.id.dropFirst(5)))).font(.title3)
                                HStack(spacing: 3) { if c.on { Image(systemName: "checkmark").font(.caption.bold()) }; Text(c.title).font(.subheadline) }
                            }.frame(maxWidth: .infinity, minHeight: 54)
                                .foregroundStyle(.primary)
                                .background(c.on ? Color.primary.opacity(0.15) : .clear, in: RoundedRectangle(cornerRadius: 10))
                        }.buttonStyle(.plain).accessibilityAddTraits(c.on ? .isSelected : []).accessibilityIdentifier(c.id)
                    }
                }
            }
            if !s.weather.isEmpty {
                group(t("降雪","Snowfall")) {
                    if typeSize.isAccessibilitySize { choiceList(s.weather) }
                    else { Picker(t("降雪","Snowfall"), selection: binding(s.weather)) {
                        ForEach(s.weather) { Text($0.title).tag($0.id) }
                    }.pickerStyle(.segmented).accessibilityIdentifier("settings-snowfall") }
                }
            }
        }
    }
    private func binding(_ items: [Choice]) -> Binding<String> {
        Binding(get: { items.first(where: \.on)?.id ?? "" }, set: { send($0) })
    }
    private func choiceList(_ choices: [Choice]) -> some View {
        rows(choices) { c in Button { send(c.id) } label: {
            row(c.title, trailing: c.on ? "checkmark" : nil)
        }.buttonStyle(.plain).accessibilityAddTraits(c.on ? .isSelected : []).accessibilityIdentifier(c.id) }
    }
    private func viewsPage() -> some View {
        group(t("选择机位","Camera position"), footer: t("滑行时也可以左右滑动机位栏，或轻点名称切换。","While skiing, swipe the camera strip or tap a name to switch views.")) {
            rows(s.views) { c in Button { send(c.id) } label: {
                row(c.title, icon: symbol(String(c.id.dropFirst(5))), trailing: c.on ? "checkmark" : nil)
            }.buttonStyle(.plain).accessibilityAddTraits(c.on ? .isSelected : []).accessibilityIdentifier(c.id) }
        }
    }
    private func terrainPage() -> some View {
        group(t("前往下一段","Skip to terrain")) {
            Text(t("选择地形，前往前方最近的对应路段。","Choose a terrain type to move to its next stretch ahead.")).font(.subheadline).foregroundStyle(.secondary)
            rows(s.terrain) { c in Button { send(c.id) } label: {
                row(c.title, detail: c.on ? t("当前地形","Current terrain") : "", trailing: "arrow.forward")
            }.buttonStyle(.plain).accessibilityIdentifier(c.id) }
        }
    }
    private func encountersPage() -> some View {
        group(t("安排一次偶遇","Choose an encounter")) {
            Text(s.running ? t("点选后继续滑行，留意前方的动物或空中的航班。","Choosing an encounter resumes your run. Look ahead for wildlife or up for the plane.") : t("动物会出现在前方，航班会从天空飞过。","Look ahead for wildlife or up for the plane.")).font(.subheadline).foregroundStyle(.secondary)
            rows(s.encounters) { c in Button { send(c.id) } label: {
                row(c.title, icon: c.id == "plane" ? "airplane" : "pawprint", trailing: "arrow.forward")
            }.buttonStyle(.plain).accessibilityIdentifier(c.id) }
        }
    }
    private func actionTitle(_ id: String) -> String {
        switch id {
        case "m-top": return t("回到山顶","Return to summit")
        case "mountain:daily": return t("今日之山","Today’s mountain")
        default: return t("换一座山","New mountain")
        }
    }
    private func mountainAction(_ id: String, icon: String) -> some View {
        Button { if s.running && !(id == "mountain:daily" && s.daily) { confirmation = id } else { send(id) } } label: { row(actionTitle(id), icon: icon) }
            .buttonStyle(.plain).accessibilityIdentifier(id)
    }
    private func mountainPage() -> some View {
        VStack(spacing: 16) {
            group(t("当前雪山","Current mountain")) {
                row(s.seed, detail: s.daily ? t("今日之山","Today’s mountain") : "", icon: "mountain.2.fill")
                if !s.record.isEmpty { Divider(); Text(s.record).font(.footnote).foregroundStyle(captionInk) }
                if s.running { Divider(); mountainAction("m-top", icon:"arrow.counterclockwise") }
            }
            group(t("选择雪山","Choose a mountain"), footer: t("今日之山向所有人开放，每天北京时间零点更换。","Everyone skis the same daily mountain. It changes at midnight Beijing time.")) {
                mountainAction("mountain:daily", icon:"calendar")
                Divider()
                mountainAction("mountain:new", icon:"shuffle")
            }
        }
    }
    private func helpPage() -> some View {
        VStack(spacing: 16) {
            group(t("滑行手势","On the slopes")) {
                ForEach(Array(s.help.enumerated()), id: \.offset) { i, item in
                    if i > 0 { Divider() }
                    row(item.title, detail: item.detail)
                }
            }
            group(t("拍照","Photography")) {
                row(t("打开相机","Open the camera"), detail: t("轻点相机取景，按快门拍照。轻点返回继续滑行。","Tap the camera to frame a shot, then tap the shutter. Tap Back to keep skiing."), icon:"camera")
            }
        }
    }
    // Give the whole row one target and expose both its name and its current value.
    private func valueRow<Options: View, Value: Hashable>(_ label: String, value: String,
            selection: Binding<Value>, id: String, @ViewBuilder options: () -> Options) -> some View {
        Menu {
            Picker(label, selection: selection, content: options).pickerStyle(.inline)
        } label: {
            LabeledContent {
                HStack(spacing: 4) {
                    Text(value)
                    Image(systemName: "chevron.up.chevron.down").font(.caption2.bold())
                }.foregroundStyle(.secondary)
            } label: { Text(label) }.frame(minHeight: 44).contentShape(Rectangle())
        }.buttonStyle(.plain).accessibilityLabel(label).accessibilityValue(value).accessibilityIdentifier(id)
    }
    private var qualityOptions: [(String,String)] { [("auto",t("自动","Automatic")),("0",t("高","High")),("1",t("均衡","Balanced")),("2",t("流畅","Smooth"))] }
    private func preferencesPage() -> some View {
        VStack(spacing: 16) {
            group(t("声音与画面","Sound & graphics")) {
                Toggle(t("游戏声音","Game sound"), isOn: Binding(get: { s.sound }, set: { if $0 != s.sound { send("o-snd") } }))
                    .frame(minHeight: 44).accessibilityIdentifier("settings-sound")
                Divider()
                valueRow(t("画质","Graphics quality"), value: qualityOptions.first { $0.0 == s.quality }?.1 ?? s.quality, selection: Binding(get: { s.quality }, set: { send("quality:" + $0) }), id: "settings-quality") {
                    ForEach(qualityOptions, id: \.0) { item in Text(item.1).tag(item.0) }
                }
                if s.quality == "auto" { Text(t("当前画质：","Current quality: ") + s.tier).font(.footnote).foregroundStyle(captionInk) }
            }
            group(t("语言","Language")) {
                valueRow(t("游戏语言","Game language"), value: s.english ? "English" : "简体中文", selection: Binding(get: { s.english }, set: { if s.english != $0 { send("o-lang") } }), id: "settings-language") {
                    Text("简体中文").tag(false); Text("English").tag(true)
                }
            }
            if s.sections.contains(where: { $0.id == "nav:vers" }) {
                group(t("高级","Advanced")) {
                    Button { open("vers") } label: { row(title("vers"), icon: symbol("vers"), trailing: "chevron.forward") }
                        .buttonStyle(.plain).accessibilityIdentifier("settings-nav-vers")
                }
            }
        }
    }
    private func versionsPage() -> some View {
        VStack(spacing: 16) {
            ForEach(Array(s.versions.enumerated()), id: \.offset) { _, g in
                group(g.title) {
                    ForEach(Array(g.rows.enumerated()), id: \.offset) { i, r in
                        if i > 0 { Divider() }
                        valueRow(r.title, value: r.options.first(where: \.on)?.title ?? "—", selection: binding(r.options), id: r.options.first?.id ?? r.title) {
                            ForEach(r.options) { o in Text(o.title + (o.marked ? t("（推荐）"," (recommended)") : "")).tag(o.id) }
                        }
                    }
                }
            }
            group("") {
                Button { send("sw-vreset") } label: { row(t("恢复推荐版本","Restore recommended versions"), icon:"arrow.counterclockwise") }
                    .buttonStyle(.plain).disabled(!s.versions.flatMap(\.rows).flatMap(\.options).contains { $0.on && !$0.marked })
            }
        }
    }
}
