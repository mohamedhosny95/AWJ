import Foundation

/// Stable identities carry existing permissions and device configuration into AWJ.
enum AWJCompatibility {
    static let keychainService = "RepHealthCompanion"
    static let originKey = "repOrigin"
    static let importKeyAccount = "repVitalsImportKey"
    static let pairingSchemes = ["awj", "awj-pair", "rep-pair", "healthos"]
}
