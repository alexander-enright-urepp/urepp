// IAPManager.swift
import Foundation
import Capacitor
import StoreKit

@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IAPPlugin"
    public let jsName = "IAPPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getReceipt", returnType: CAPPluginReturnPromise)
    ]
    
    private var products: [SKProduct] = []
    private var pendingCallback: CAPPluginCall?
    
    override public func load() {
        super.load()
        SKPaymentQueue.default().add(self)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self), !productIds.isEmpty else {
            call.reject("No product IDs provided")
            return
        }
        
        pendingCallback = call
        let request = SKProductsRequest(productIdentifiers: Set(productIds))
        request.delegate = self
        request.start()
    }
    
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Product ID is required")
            return
        }
        
        guard let product = products.first(where: { $0.productIdentifier == productId }) else {
            call.reject("Product not found. Call getProducts first.")
            return
        }
        
        guard SKPaymentQueue.canMakePayments() else {
            call.reject("In-app purchases are disabled")
            return
        }
        
        pendingCallback = call
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        pendingCallback = call
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
    
    @objc func getReceipt(_ call: CAPPluginCall) {
        guard let receiptURL = Bundle.main.appStoreReceiptURL,
              FileManager.default.fileExists(atPath: receiptURL.path),
              let receipt = try? Data(contentsOf: receiptURL) else {
            call.reject("No receipt available")
            return
        }
        
        let receiptString = receipt.base64EncodedString()
        call.resolve(["receipt": receiptString])
    }
}

// MARK: - SKProductsRequestDelegate
extension IAPPlugin: SKProductsRequestDelegate {
    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        self.products = response.products
        
        let productsData: [[String: Any]] = response.products.map { product in
            var data: [String: Any] = [
                "id": product.productIdentifier,
                "title": product.localizedTitle,
                "description": product.localizedDescription,
                "price": product.price.doubleValue,
                "priceLocale": product.priceLocale.identifier
            ]
            
            if let period = product.subscriptionPeriod {
                data["subscriptionPeriod"] = period.unit.rawValue
            }
            
            return data
        }
        
        pendingCallback?.resolve(["products": productsData])
        pendingCallback = nil
    }
    
    public func request(_ request: SKRequest, didFailWithError error: Error) {
        pendingCallback?.reject("Failed to load products: \(error.localizedDescription)")
        pendingCallback = nil
    }
}

// MARK: - SKPaymentTransactionObserver
extension IAPPlugin: SKPaymentTransactionObserver {
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                handlePurchased(transaction)
            case .failed:
                handleFailed(transaction)
            case .restored:
                handleRestored(transaction)
            case .purchasing:
                // Transaction is being processed
                break
            case .deferred:
                // Transaction is deferred
                pendingCallback?.reject("Purchase deferred")
                pendingCallback = nil
            @unknown default:
                break
            }
        }
    }
    
    public func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
        pendingCallback?.resolve(["restored": true])
        pendingCallback = nil
    }
    
    public func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        pendingCallback?.reject("Restore failed: \(error.localizedDescription)")
        pendingCallback = nil
    }
    
    private func handlePurchased(_ transaction: SKPaymentTransaction) {
        guard let receiptURL = Bundle.main.appStoreReceiptURL,
              let receipt = try? Data(contentsOf: receiptURL) else {
            pendingCallback?.reject("Could not retrieve receipt")
            SKPaymentQueue.default().finishTransaction(transaction)
            return
        }
        
        let receiptString = receipt.base64EncodedString()
        
        SKPaymentQueue.default().finishTransaction(transaction)
        
        pendingCallback?.resolve([
            "productId": transaction.payment.productIdentifier,
            "transactionId": transaction.transactionIdentifier ?? "",
            "receipt": receiptString,
            "purchased": true
        ])
        pendingCallback = nil
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        SKPaymentQueue.default().finishTransaction(transaction)
        
        if let error = transaction.error as? SKError {
            switch error.code {
            case .paymentCancelled:
                pendingCallback?.reject("Purchase cancelled")
            case .paymentInvalid:
                pendingCallback?.reject("Invalid payment")
            case .paymentNotAllowed:
                pendingCallback?.reject("Payment not allowed")
            default:
                pendingCallback?.reject(error.localizedDescription)
            }
        } else {
            pendingCallback?.reject("Purchase failed")
        }
        pendingCallback = nil
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        SKPaymentQueue.default().finishTransaction(transaction)
        // Could emit event here if needed
    }
}
