import UIKit
import Photos
import Capacitor

/// Vista principal de la app: registra los plugins propios de Primeros Alimentos.
class PAViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SaveImagePlugin())
        // Fondo según el modo claro u oscuro del sistema, para que no haya un destello crema al abrir o recargar en modo oscuro
        let bg = UIColor { t in
            t.userInterfaceStyle == .dark
                ? UIColor(red: 0x12 / 255.0, green: 0x12 / 255.0, blue: 0x32 / 255.0, alpha: 1)
                : UIColor(red: 0xee / 255.0, green: 0xea / 255.0, blue: 0xd8 / 255.0, alpha: 1)
        }
        view.backgroundColor = bg
        webView?.backgroundColor = bg
        webView?.scrollView.backgroundColor = bg
        webView?.isOpaque = false
    }
}

/// Guarda una imagen (PNG en base64) directamente en Fotos.
@objc(SaveImagePlugin)
public class SaveImagePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SaveImagePlugin"
    public let jsName = "SaveImage"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "save", returnType: CAPPluginReturnPromise)
    ]

    @objc func save(_ call: CAPPluginCall) {
        guard let b64 = call.getString("data"),
              let data = Data(base64Encoded: b64),
              let image = UIImage(data: data) else {
            call.reject("bad_image")
            return
        }
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                call.reject("denied")
                return
            }
            PHPhotoLibrary.shared().performChanges({
                PHAssetChangeRequest.creationRequestForAsset(from: image)
            }) { ok, err in
                if ok { call.resolve() } else { call.reject(err?.localizedDescription ?? "error") }
            }
        }
    }
}
