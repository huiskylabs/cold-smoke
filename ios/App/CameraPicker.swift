import UIKit

struct CameraLayout: Decodable {
    struct Viewpoint: Decodable, Equatable {
        let id, title: String
    }
    let options: [Viewpoint]
    let selected, label: String
    let rect: [CGFloat]
}

// The lens stays in the middle. The names scroll underneath it, snapping one name to the lens.
final class CameraPicker: UIView, UIScrollViewDelegate {
    var selectViewpoint: ((String) -> Void)?
    private let strip = UIScrollView()
    private let names = UIView()
    private let lens: UIVisualEffectView
    private let fade = CAGradientLayer()
    private let feedback = UISelectionFeedbackGenerator()
    private var options = [CameraLayout.Viewpoint]()
    private var labels = [UILabel]()
    private var selected = 0
    private var step: CGFloat = 1
    private var lastSize = CGSize.zero
    private var highlighted: Int?
    private var dragStart = 0

    override init(frame: CGRect) {
        if #available(iOS 26, *) {
            let glass = UIGlassEffect(style: .regular)
            glass.tintColor = UIColor.black.withAlphaComponent(0.14)
            lens = UIVisualEffectView(effect: glass)
        } else {
            lens = UIVisualEffectView(effect: UIBlurEffect(style: .systemThinMaterialDark))
        }
        super.init(frame: frame)
        isAccessibilityElement = true
        accessibilityIdentifier = "cameraPicker"
        accessibilityTraits = .adjustable
        lens.isUserInteractionEnabled = false
        if #available(iOS 26, *) { lens.cornerConfiguration = .capsule() }
        else { lens.layer.cornerCurve = .continuous }
        lens.clipsToBounds = true
        addSubview(lens)
        strip.delegate = self
        strip.showsHorizontalScrollIndicator = false
        strip.contentInsetAdjustmentBehavior = .never
        strip.decelerationRate = .fast
        strip.bounces = false
        strip.isAccessibilityElement = false
        strip.accessibilityElementsHidden = true
        addSubview(names)
        names.addSubview(strip)
        strip.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(tap(_:))))
        fade.colors = [UIColor.clear.cgColor, UIColor.black.cgColor, UIColor.black.cgColor, UIColor.clear.cgColor]
        fade.locations = [0, 0.10, 0.90, 1]
        fade.startPoint = CGPoint(x: 0, y: 0.5)
        fade.endPoint = CGPoint(x: 1, y: 0.5)
        names.layer.mask = fade
    }

    required init?(coder: NSCoder) { fatalError("Use init(frame:)") }

    func update(_ model: CameraLayout, language: String) {
        guard let index = model.options.firstIndex(where: { $0.id == model.selected }) else { return }
        accessibilityLabel = model.label
        accessibilityLanguage = language
        accessibilityValue = model.options[index].title
        if options != model.options {
            options = model.options
            labels.forEach { $0.removeFromSuperview() }
            // Three copies let the first and last cameras be neighbours. Recenter after scrolling.
            labels = (0..<(options.count * 3)).map { i in
                let label = UILabel()
                label.text = options[i % options.count].title
                label.textAlignment = .center
                label.textColor = .white
                label.shadowColor = UIColor.black.withAlphaComponent(0.9)
                label.shadowOffset = CGSize(width: 0, height: 1)
                label.layer.shadowColor = UIColor.black.cgColor
                label.layer.shadowOffset = .zero
                label.layer.shadowRadius = 2
                label.layer.shadowOpacity = 0.8
                strip.addSubview(label)
                return label
            }
            selected = index
            invalidateLayout()
        } else if selected != index {
            selected = index
            strip.setContentOffset(offset(for: options.count + index), animated: false)
        }
    }

    private func invalidateLayout() {
        lastSize = .zero
        highlighted = nil
        setNeedsLayout()
    }

    override func traitCollectionDidChange(_ previous: UITraitCollection?) {
        super.traitCollectionDidChange(previous)
        if previous?.preferredContentSizeCategory != traitCollection.preferredContentSizeCategory { invalidateLayout() }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        guard !options.isEmpty, bounds.width > 0, bounds.size != lastSize else { return }
        lastSize = bounds.size
        let font = UIFontMetrics(forTextStyle: .subheadline).scaledFont(for: .systemFont(ofSize: 15, weight: .semibold),
                                                                       maximumPointSize: 23, compatibleWith: traitCollection)
        labels.forEach { $0.font = font }
        step = max(68, ceil(labels.map { $0.intrinsicContentSize.width }.max() ?? 0) + 24)
        names.frame = bounds
        strip.frame = names.bounds
        strip.contentSize = CGSize(width: bounds.width + CGFloat(labels.count - 1) * step, height: bounds.height)
        for (i, label) in labels.enumerated() {
            label.frame = CGRect(x: bounds.midX + (CGFloat(i) - 0.5) * step, y: 0, width: step, height: bounds.height)
        }
        let height = min(bounds.height - 4, max(34, font.lineHeight + 14))
        lens.frame = CGRect(x: bounds.midX - (step - 6) / 2, y: bounds.midY - height / 2, width: step - 6, height: height)
        if #unavailable(iOS 26) { lens.layer.cornerRadius = height / 2 }
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        fade.frame = bounds
        CATransaction.commit()
        strip.setContentOffset(offset(for: options.count + selected), animated: false)
        highlight()
    }

    private func index(at x: CGFloat) -> Int {
        min(max(0, Int((x / step).rounded())), labels.count - 1)
    }

    private func offset(for index: Int) -> CGPoint { CGPoint(x: CGFloat(index) * step, y: 0) }

    private func highlight() {
        guard !labels.isEmpty else { return }
        let index = index(at: strip.contentOffset.x)
        guard highlighted != index else { return }
        if let highlighted { labels[highlighted].textColor = .white }
        labels[index].textColor = .systemYellow
        highlighted = index
    }

    func scrollViewDidScroll(_ scrollView: UIScrollView) { highlight() }

    func scrollViewWillBeginDragging(_ scrollView: UIScrollView) { dragStart = index(at: strip.contentOffset.x) }

    func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint,
                                   targetContentOffset target: UnsafeMutablePointer<CGPoint>) {
        guard !options.isEmpty else { return }
        let release = index(at: strip.contentOffset.x)
        let projected = index(at: target.pointee.x)
        // A short flick advances a single stop. A long drag can cross several under the finger.
        let stop = release == dragStart ? min(max(projected, dragStart - 1), dragStart + 1) : release
        target.pointee = offset(for: stop)
    }

    func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
        if !decelerate { settle() }
    }

    func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) { settle() }
    func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) { settle() }

    private func settle() {
        guard !options.isEmpty else { return }
        let i = index(at: strip.contentOffset.x)
        select(i)
        strip.setContentOffset(offset(for: options.count + selected), animated: false)
    }

    @objc private func tap(_ gesture: UITapGestureRecognizer) {
        guard !options.isEmpty else { return }
        let index = index(at: gesture.location(in: strip).x - bounds.midX)
        move(to: index)
    }

    private func move(to index: Int) {
        select(index)
        if UIAccessibility.isReduceMotionEnabled {
            strip.setContentOffset(offset(for: options.count + selected), animated: false)
        } else {
            strip.setContentOffset(offset(for: index), animated: true)
        }
    }

    private func select(_ index: Int) {
        let next = index % options.count
        guard selected != next else { return }
        selected = next
        accessibilityValue = options[next].title
        feedback.selectionChanged()
        selectViewpoint?(options[next].id)
    }

    override func accessibilityIncrement() { if !options.isEmpty { move(to: options.count + selected + 1) } }
    override func accessibilityDecrement() { if !options.isEmpty { move(to: options.count + selected - 1) } }
}
