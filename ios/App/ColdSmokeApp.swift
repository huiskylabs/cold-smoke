import SwiftUI

@main
struct ColdSmokeApp: App {
    var body: some Scene {
        WindowGroup {
            GameScreen()
                .ignoresSafeArea()
                .statusBarHidden()
                .persistentSystemOverlays(.hidden)
        }
    }
}

private struct GameScreen: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> GameController { GameController() }
    func updateUIViewController(_ controller: GameController, context: Context) {}
}
