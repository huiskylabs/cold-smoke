import GameController

// The Xbox Series X|S controller exposes this standard system profile.
// Button transitions are sent immediately; steady sticks don't cross the JS bridge.
@MainActor
final class SkiGamepad {
    private var observers: [NSObjectProtocol] = []
    private var controller: GCController?
    private var timer: Timer?
    private struct State: Equatable {
        let x, y, lookX, lookY: Float
        let a, b, rt, menu, yButton, lb, rb, xButton: Bool
    }
    private var last: State?
    private let send: ([String: Any]?) -> Void
    init(send: @escaping ([String: Any]?) -> Void) {
        self.send = send
        for name in [Notification.Name.GCControllerDidConnect, .GCControllerDidDisconnect] {
            observers.append(NotificationCenter.default.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                Task { @MainActor in self?.refresh() }
            })
        }
        refresh()
    }
    deinit { timer?.invalidate(); for token in observers { NotificationCenter.default.removeObserver(token) } }
    private func refresh() {
        let pads = GCController.controllers().filter { $0.extendedGamepad != nil }
        if let controller, pads.contains(controller) { return }
        bind(pads.first)
    }
    func bind(_ pad: GCController?) {
        controller?.extendedGamepad?.valueChangedHandler = nil
        timer?.invalidate(); timer = nil; last = nil
        controller = pad; send(nil)
        guard let pad, let profile = pad.extendedGamepad else { return }
        pad.handlerQueue = .main
        profile.valueChangedHandler = { [weak self] profile, element in
            // Keep digital edges, including fast A taps. Analog movement is sampled below.
            if element is GCControllerButtonInput { MainActor.assumeIsolated { self?.sample(profile) } }
        }
        // Writable/virtual profiles need not emit hardware change callbacks. Poll in
        // both scenes; a display link attached to the lodge stops when it closes.
        let poll = Timer(timeInterval: 1 / 60, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { if let self, let profile = self.controller?.extendedGamepad { self.sample(profile) } }
        }
        timer = poll; RunLoop.main.add(poll, forMode: .common)
        sample(profile)
    }
    private func sample(_ p: GCExtendedGamepad) {
        let state = State(x: p.leftThumbstick.xAxis.value, y: p.leftThumbstick.yAxis.value,
                          lookX: p.rightThumbstick.xAxis.value, lookY: p.rightThumbstick.yAxis.value,
                          a: p.buttonA.isPressed, b: p.buttonB.isPressed, rt: p.rightTrigger.isPressed,
                          menu: p.buttonMenu.isPressed, yButton: p.buttonY.isPressed,
                          lb: p.leftShoulder.isPressed, rb: p.rightShoulder.isPressed, xButton: p.buttonX.isPressed)
        guard state != last else { return }; last = state
        send(["x": state.x, "y": state.y, "yButton": state.yButton, "a": state.a, "rt": state.rt,
              "menu": state.menu, "lb": state.lb, "rb": state.rb, "xButton": state.xButton,
              "b": state.b, "lookX": state.lookX, "lookY": state.lookY])
    }
}
