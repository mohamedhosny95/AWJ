// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: AWJCompatibility.keychainService,
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: AWJCompatibility.keychainService,
            targets: [AWJCompatibility.keychainService]
        )
    ],
    targets: [
        .target(
            name: AWJCompatibility.keychainService,
            path: ".",
            exclude: ["AWJWorkoutLiveActivityWidget.swift"]
        )
    ]
)
