'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PremiumContextType {
  isPremium: boolean;
  subscription: any | null;
  loading: boolean;
  refreshPremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  subscription: null,
  loading: true,
  refreshPremium: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkPremium = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsPremium(false);
        setSubscription(null);
        setLoading(false);
        return;
      }

      // Check profile for premium status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, premium_until')
        .eq('user_id', user.id)
        .single();

      // Check if premium is still active
      const isActive = profile?.is_premium && 
        (!profile.premium_until || new Date(profile.premium_until) > new Date());

      setIsPremium(isActive);
      
      if (isActive) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Premium check error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPremium();

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      checkPremium();
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  return (
    <PremiumContext.Provider value={{ 
      isPremium, 
      subscription, 
      loading, 
      refreshPremium: checkPremium 
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
