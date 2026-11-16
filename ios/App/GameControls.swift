import UIKit
import WebKit

private struct ButtonLayout: Decodable, Equatable {
    let id, group, style, icon, title, label: String
    let selected, marked: Bool
    let rect: [CGFloat]
}

private struct ScrollLayout: Decodable {
    let id, page: String
    let rect, size, offset: [CGFloat]
}

private struct ControlSnapshot: Decodable {
    let settings: PauseSettings?
    let camera: CameraLayout?
    let controls: [ButtonLayout]
    let groups: [ScrollLayout]
    let lang: String
}

private final class HoldButton: UIButton {
    var activate: (() -> Void)?
    override func accessibilityActivate() -> Bool { activate?(); return true }
}

private final class PhotoButton: UIButton {
    // Keep the original shortcut's tap width around the smaller camera glyph.
    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        let extraWidth = max(0, 100 - bounds.width)
        return bounds.insetBy(dx: -extraWidth / 2, dy: 0).contains(point)
    }
}

// Empty space belongs to the ski surface, including a second finger steering while a button is held.
final class GameControls: UIView, WKScriptMessageHandler, UIScrollViewDelegate {
    weak var web: WKWebView?
    var onSettings: ((PauseSettings?) -> Void)?
    private var buttons: [String: UIButton] = [:]
    private var models: [String: ButtonLayout] = [:]
    private var scrollViews: [String: UIScrollView] = [:]
    private var pages: [String: String] = [:]
    private var cameraPicker: CameraPicker?
    private var photoActionsGlass: UIVisualEffectView?
    private var updating = false
    private let selectionFeedback = UISelectionFeedbackGenerator()
    private lazy var jumpFeedback: UIImpactFeedbackGenerator = {
        if #available(iOS 17.5, *) { return UIImpactFeedbackGenerator(style: .medium, view: self) }
        return UIImpactFeedbackGenerator(style: .medium)
    }()
    private let copper = UIColor(red: 0.53, green: 0.28, blue: 0.08, alpha: 1)
    private let amber = UIColor(red: 1, green: 0.79, blue: 0.48, alpha: 1)

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let target = super.hitTest(point, with: event)
        return target === self ? nil : target
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, let web, message.webView === web,
              message.frameInfo.request.url?.standardizedFileURL.path == web.url?.standardizedFileURL.path,
              let body = message.body as? [String: Any] else { return }
        if body["event"] as? String == "jumpCharged" {
            if buttons["jump"]?.isTracking == true, window?.windowScene?.activationState == .foregroundActive {
                jumpFeedback.impactOccurred()
            }
            return
        }
        guard let data = try? JSONSerialization.data(withJSONObject: body),
              let snapshot = try? JSONDecoder().decode(ControlSnapshot.self, from: data) else { return }
        updating = true
        defer { updating = false }

        onSettings?(snapshot.settings)
        if let camera = snapshot.camera, camera.rect.count == 4 {
            let picker = cameraPicker ?? CameraPicker(frame: .zero)
            if cameraPicker == nil {
                picker.selectViewpoint = { [weak self] id in
                    self?.web?.callAsyncJavaScript("window.gameControls?.selectCamera(id)", arguments: ["id": id],
                                                   in: nil, in: .page, completionHandler: nil)
                }
                cameraPicker = picker
                addSubview(picker)
            }
            picker.frame = frame(from: camera.rect)
            picker.update(camera, language: snapshot.lang)
        } else {
            cameraPicker?.removeFromSuperview()
            cameraPicker = nil
        }

        let active = Set(snapshot.controls.map(\.id))
        for id in buttons.keys.filter({ !active.contains($0) }) {
            buttons.removeValue(forKey: id)?.removeFromSuperview()
            models.removeValue(forKey: id)
        }
        let groups = Set(snapshot.groups.map(\.id))
        for id in scrollViews.keys.filter({ !groups.contains($0) }) {
            scrollViews.removeValue(forKey: id)?.removeFromSuperview()
            pages.removeValue(forKey: id)
        }
        for group in snapshot.groups { updateScrollView(group) }
        updatePhotoActionsGlass(snapshot.controls)
        for item in snapshot.controls where item.rect.count == 4 {
            let button = buttons[item.id] ?? makeButton(item.id)
            let parent: UIView = item.style == "photoPair" ? (photoActionsGlass?.contentView ?? self) : (scrollViews[item.group] ?? self)
            if button.superview !== parent { parent.addSubview(button) }
            var rect = frame(from: item.rect)
            if parent === photoActionsGlass?.contentView { rect = parent.convert(rect, from: self) }
            if button.frame != rect { button.frame = rect }
            if models[item.id] != item || button.accessibilityLanguage != snapshot.lang {
                configure(button, for: item, language: snapshot.lang)
                models[item.id] = item
            }
            if parent === self { bringSubviewToFront(button) }
        }
    }

    // One glass surface, with a distinct native button and VoiceOver target in each half.
    private func updatePhotoActionsGlass(_ items: [ButtonLayout]) {
        let bounds = items.lazy.filter { $0.style == "photoPair" && $0.rect.count == 4 }
            .reduce(CGRect.null) { $0.union(frame(from: $1.rect)) }
        guard !bounds.isNull else {
            photoActionsGlass?.removeFromSuperview()
            photoActionsGlass = nil
            return
        }
        let glass: UIVisualEffectView
        if let existing = photoActionsGlass { glass = existing }
        else {
            if #available(iOS 26, *) {
                glass = UIVisualEffectView(effect: UIGlassEffect(style: .regular))
                glass.cornerConfiguration = .capsule()
            } else {
                glass = UIVisualEffectView(effect: UIBlurEffect(style: .systemThinMaterialDark))
                glass.layer.cornerCurve = .continuous
            }
            glass.clipsToBounds = true
            glass.shouldGroupAccessibilityChildren = true
            glass.accessibilityIdentifier = "photoActions"
            addSubview(glass)
            photoActionsGlass = glass
        }
        glass.frame = bounds
        if #unavailable(iOS 26) { glass.layer.cornerRadius = bounds.width / 2 }
    }

    private func frame(from values: [CGFloat]) -> CGRect {
        CGRect(x: values[0], y: values[1], width: values[2], height: values[3])
    }

    // Keep the native controls and the game's section headings on the same scrolling surface.
    private func updateScrollView(_ group: ScrollLayout) {
        guard group.rect.count == 4, group.size.count == 2, group.offset.count == 2 else { return }
        let scroll = scrollViews[group.id] ?? UIScrollView()
        if scroll.superview == nil {
            scroll.accessibilityIdentifier = group.id
            scroll.contentInsetAdjustmentBehavior = .never
            scroll.showsHorizontalScrollIndicator = false
            scroll.showsVerticalScrollIndicator = false
            scroll.bounces = false
            scroll.delegate = self
            addSubview(scroll)
            scrollViews[group.id] = scroll
        }
        let viewport = frame(from: group.rect)
        let size = CGSize(width: group.size[0], height: group.size[1])
        if scroll.frame != viewport { scroll.frame = viewport }
        if scroll.contentSize != size { scroll.contentSize = size }
        if pages[group.id] != group.page {
            scroll.setContentOffset(CGPoint(x: group.offset[0], y: group.offset[1]), animated: false)
            pages[group.id] = group.page
        }
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        guard !updating, let id = scrollView.accessibilityIdentifier else { return }
        let p = scrollView.contentOffset
        web?.callAsyncJavaScript("window.gameControls?.scroll(id, x, y)",
                                 arguments: ["id": id, "x": p.x, "y": p.y], in: nil, in: .page, completionHandler: nil)
    }

    func perform(_ id: String, _ phase: String) {
        if id == "jump", phase == "down" { jumpFeedback.prepare() }
        web?.callAsyncJavaScript("window.gameControls?.perform(id, phase)",
                                 arguments: ["id": id, "phase": phase], in: nil, in: .page, completionHandler: nil)
    }

    private func makeButton(_ id: String) -> UIButton {
        let hold = ["jump", "tuck", "ph-up", "ph-dn"].contains(id)
        let button: UIButton
        if hold { button = HoldButton(type: .system) }
        else if id == "shoot" { button = PhotoButton(type: .system) }
        else { button = UIButton(type: .system) }
        button.accessibilityIdentifier = id
        button.isExclusiveTouch = false
        if let button = button as? HoldButton {
            button.addAction(UIAction { [weak self] _ in self?.perform(id, "down") }, for: .touchDown)
            button.addAction(UIAction { [weak self] _ in self?.perform(id, "up") }, for: [.touchUpInside, .touchUpOutside, .touchCancel])
            button.activate = { [weak self] in
                self?.perform(id, "down")
                self?.perform(id, "up")
            }
        } else {
            button.addAction(UIAction { [weak self] _ in
                guard let self else { return }
                if id == "snd" || self.models[id]?.style == "tile" { self.selectionFeedback.selectionChanged() }
                self.perform(id, "tap")
            }, for: .primaryActionTriggered)
        }
        buttons[id] = button
        return button
    }

    private func configure(_ button: UIButton, for item: ButtonLayout, language: String) {
        let prominent = item.style == "start"
        let accent = item.selected && item.style != "round"
        var config: UIButton.Configuration
        let sharesGlass = item.style == "photoPair"
        if sharesGlass {
            config = .plain()
        } else if #available(iOS 26, *) {
            config = prominent ? .prominentGlass() : .glass()
        } else {
            config = prominent ? .filled() : .gray()
        }
        button.tintColor = prominent ? copper : accent ? amber : .white
        let ink: UIColor = accent ? amber : .white
        config.baseForegroundColor = ink
        if prominent { config.baseBackgroundColor = copper }
        if accent { config.baseBackgroundColor = amber.withAlphaComponent(0.22) }
        let tile = item.style == "tile"
        config.cornerStyle = tile ? .large : .capsule
        config.contentInsets = .init(top: 2, leading: 4, bottom: 2, trailing: 4)
        let round = item.style == "round" || sharesGlass
        config.title = round ? nil : item.title
        config.titleAlignment = .center
        config.titleLineBreakMode = .byTruncatingTail
        if item.id == "jump" || item.id == "tuck" {
            config.image = UIImage(resource: item.id == "jump" ? .skiJump : .skiTuck)
            button.imageView?.contentMode = .scaleAspectFit
        } else if !item.icon.isEmpty {
            config.image = UIImage(systemName: item.icon)
            // Balance these fuller glyphs against the narrow Back chevron in both photo layouts.
            let symbol: UIImage.SymbolConfiguration
            switch item.id {
            case "ph-save":
                symbol = .init(pointSize: 14.5, weight: .medium)
                // Align the visible tray and arrow with the preview's Back chevron.
                config.contentInsets.bottom += 1.5
            case "ph-reset": symbol = .init(pointSize: 14.5, weight: .medium)
            case "ph-hide":  symbol = .init(pointSize: 13, weight: .regular)
            default:         symbol = .init(pointSize: round ? 18 : tile ? 17 : 16, weight: .medium)
            }
            config.preferredSymbolConfigurationForImage = symbol
            config.imagePlacement = tile ? .top : .leading
            config.imagePadding = tile ? 3 : 7
        }
        config.imageColorTransformer = UIConfigurationColorTransformer { _ in ink }
        let textStyle: UIFont.TextStyle = item.style == "start" ? .headline : (tile ? .caption1 : .subheadline)
        config.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { attributes in
            var result = attributes
            result.foregroundColor = ink
            result.font = UIFont.preferredFont(forTextStyle: textStyle)
            return result
        }
        button.configuration = config
        button.titleLabel?.adjustsFontForContentSizeCategory = true
        button.accessibilityLabel = item.label
        button.accessibilityLanguage = language
        button.accessibilityTraits = item.selected ? [.button, .selected] : .button
        let markerTag = 427
        if item.marked {
            let dot = button.viewWithTag(markerTag) ?? UIView()
            dot.tag = markerTag
            dot.isUserInteractionEnabled = false
            dot.backgroundColor = prominent ? ink : amber
            dot.layer.cornerRadius = 2
            dot.frame = CGRect(x: 9, y: 8, width: 4, height: 4)
            if dot.superview == nil { button.addSubview(dot) }
        } else { button.viewWithTag(markerTag)?.removeFromSuperview() }
        let checkTag = 428
        if tile && item.selected {
            let check = button.viewWithTag(checkTag) as? UIImageView ?? UIImageView()
            check.tag = checkTag
            check.image = UIImage(systemName: "checkmark", withConfiguration: UIImage.SymbolConfiguration(pointSize: 9, weight: .bold))
            check.tintColor = amber
            check.contentMode = .scaleAspectFit
            check.frame = CGRect(x: button.bounds.width - 17, y: 6, width: 11, height: 11)
            if check.superview == nil { button.addSubview(check) }
        } else { button.viewWithTag(checkTag)?.removeFromSuperview() }
    }
}
