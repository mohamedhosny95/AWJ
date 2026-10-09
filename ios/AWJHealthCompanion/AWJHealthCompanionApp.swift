import SwiftUI

@main
struct AWJHealthCompanionApp: App {
    @StateObject private var sync = HealthKitSyncCoordinator.shared
    @StateObject private var workout = WorkoutLiveActivityController.shared
    @State private var pairingMessage: String?

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                Form {
                    Section("Connection") {
                        TextField("AWJ origin, including https://", text: Binding(
                            get: { UserDefaults.standard.string(forKey: AWJCompatibility.originKey) ?? "" },
                            set: { UserDefaults.standard.set($0, forKey: AWJCompatibility.originKey) }
                        )).textInputAutocapitalization(.never).keyboardType(.URL)
                        
                        SecureField("Vitals import key", text: Binding(
                            get: { KeychainStore.read(AWJCompatibility.importKeyAccount) ?? "" },
                            set: { try? KeychainStore.write($0, account: AWJCompatibility.importKeyAccount) }
                        ))

                        if let pairingMessage {
                            Text(pairingMessage)
                                .font(.footnote)
                                .foregroundColor(.green)
                        }
                    }
                    Section("Apple Health") {
                        LabeledContent("Status", value: sync.status)
                        if let date = sync.lastSync { LabeledContent("Last sync", value: date.formatted()) }
                        Button("Authorize Apple Health") { Task { try? await sync.requestAuthorization() } }
                        Button("Sync last 7 days") { Task { try? await sync.syncRecentDays() } }
                    }
                    Section("Lock Screen Workout") {
                        LabeledContent("Status", value: workout.isActive ? workout.state.status : "Not active")
                        LabeledContent("Exercise", value: workout.state.exercise)
                        LabeledContent("Set", value: "\(workout.state.currentSet) of \(workout.state.setCount)")
                        Button(workout.isActive ? "Start 90-second rest" : "Start Gym Live Activity") {
                            Task { if workout.isActive { await workout.beginRest() } else { await workout.start() } }
                        }
                        Button("Complete set") { Task { await workout.completeSet() } }.disabled(!workout.isActive)
                        Button("End workout", role: .destructive) { Task { await workout.end() } }.disabled(!workout.isActive)
                        Text("The Live Activity shows the current exercise, set, rest timer, and workout status. Interactive controls use App Intents on iOS 17 or later.")
                            .font(.footnote).foregroundStyle(.secondary)
                    }
                    Section {
                        Text("AWJ uploads daily aggregates, sample counts, and coverage indicators. Raw heart-rate samples remain in Apple Health on this iPhone.")
                    }
                }
                .navigationTitle("AWJ Health")
                .task { try? await sync.bootstrap() }
                .onOpenURL { url in
                    if url.host == "workout" { Task { await workout.start() } }
                    else { handlePairingUrl(url) }
                }
            }
        }
    }

    private func handlePairingUrl(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else { return }
        if let scheme = url.scheme, AWJCompatibility.pairingSchemes.contains(scheme) {
            if let host = components.host {
                let scheme = components.scheme == "https" ? "https" : "https"
                let origin = "\(scheme)://\(host)"
                UserDefaults.standard.set(origin, forKey: AWJCompatibility.originKey)
            }
            if let keyItem = components.queryItems?.first(where: { $0.name == "key" || $0.name == "pairingKey" })?.value {
                try? KeychainStore.write(keyItem, account: AWJCompatibility.importKeyAccount)
                pairingMessage = "Connected via pairing QR code!"
                Task {
                    try? await sync.syncRecentDays()
                }
            }
        }
    }
}
