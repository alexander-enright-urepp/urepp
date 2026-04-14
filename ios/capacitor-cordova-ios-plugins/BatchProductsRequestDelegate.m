
#import "BatchProductsRequestDelegate.h"

@interface BatchProductsRequestDelegate ()
@property (nonatomic, strong) SKProductsRequest *productsRequest;
@end

@implementation BatchProductsRequestDelegate

- (void)fetchProductsWithIdentifiers:(NSSet<NSString *> *)productIdentifiers completion:(void (^)(NSArray<SKProduct *> *, NSArray<NSString *> *))completion {
    self.completionHandler = completion;
    self.productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:productIdentifiers];
    self.productsRequest.delegate = self;
    [self.productsRequest start];
}

#pragma mark - SKProductsRequestDelegate

- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
    NSLog(@"✅ Products found: %lu", (unsigned long)response.products.count);
    NSLog(@"❌ Invalid IDs: %@", response.invalidProductIdentifiers);
    
    if (self.completionHandler) {
        self.completionHandler(response.products, response.invalidProductIdentifiers);
    }
}

- (void)request:(SKRequest *)request didFailWithError:(NSError *)error {
    NSLog(@"❌ Product request failed: %@", error.localizedDescription);
    
    if (self.completionHandler) {
        self.completionHandler(nil, @[error.localizedDescription]);
    }
}

@end
