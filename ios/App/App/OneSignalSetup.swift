import Foundation
import OneSignalFramework

class OneSignalSetup {
    static func initialize(launchOptions: [UIApplication.LaunchOptionsKey: Any]?) {
        OneSignal.initialize("209456e7-6318-4254-aad7-54df0d7198f4", withLaunchOptions: launchOptions)
        
        OneSignal.Notifications.requestPermission({ accepted in
            print("OneSignal: Permission \(accepted)")
        }, fallbackToSettings: true)
    }
}
