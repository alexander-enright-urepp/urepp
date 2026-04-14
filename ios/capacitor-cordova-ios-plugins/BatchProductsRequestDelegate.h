
#import <Foundation/Foundation.h>
#import <StoreKit/StoreKit.h>

@interface BatchProductsRequestDelegate : NSObject <SKProductsRequestDelegate>

@property (nonatomic, copy) void (^completionHandler)(NSArray<SKProduct *> *products, NSArray<NSString *> *invalidIdentifiers);

- (void)fetchProductsWithIdentifiers:(NSSet<NSString *> *)productIdentifiers completion:(void (^)(NSArray<SKProduct *> *, NSArray<NSString *> *))completion;

@end
