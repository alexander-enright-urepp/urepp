'use client'

import { useIAP } from '../hooks/useIAP';
import { Loader2, Check, Crown, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function iOSPremiumButton() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { 
    products, 
    loading, 
    purchasing, 
    error, 
    isNative, 
    purchase,
    restorePurchases 
  } = useIAP(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setProfile(profileData);
      }
    };
    getUser();
  }, []);

  // Only show on iOS native app
  if (!isNative) return null;

  const premiumProduct = products.find(p => p.id === 'com.urepp.app.premium.monthly');
  const isPremium = profile?.is_premium;

  const handlePurchase = async () => {
    if (!premiumProduct) return;
    
    const success = await purchase(premiumProduct.id);
    if (success) {
      // Refresh profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(profileData);
      setShowUpgrade(false);
    }
  };

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 px-3 py-2 rounded-lg">
        <Crown className="w-5 h-5" />
        <span className="font-semibold">Premium Active</span>
      </div>
    );
  }

  if (showUpgrade) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade to Premium</h3>
          <p className="text-gray-600 mb-4">Unlock all premium features and themes</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {premiumProduct ? (
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            {purchasing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Subscribe {premiumProduct.price.toFixed(2)}/month
              </>
            )}
          </button>
        ) : loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Product not available
          </div>
        )}

        <button
          onClick={() => setShowUpgrade(false)}
          className="w-full mt-3 py-3 text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>

        <button
          onClick={restorePurchases}
          disabled={loading}
          className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Restore Purchases
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Subscriptions auto-renew. Manage in App Store settings.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowUpgrade(true)}
      className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-all"
    >
      <Crown className="w-5 h-5" />
      <span>Upgrade</span>
    </button>
  );
}
