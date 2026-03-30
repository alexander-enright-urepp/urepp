'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Eye, Users, TrendingUp, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalyticsWidgetProps {
  profileId: string;
  isPremium: boolean;
}

export function AnalyticsWidget({ profileId, isPremium }: AnalyticsWidgetProps) {
  const [views, setViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [last7Days, setLast7Days] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      // Total views
      const { count: totalViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);

      // Unique visitors (distinct viewer_ip or user_id)
      const { data: visitors } = await supabase
        .from('profile_views')
        .select('viewer_ip')
        .eq('profile_id', profileId)
        .not('viewer_ip', 'is', null);

      const uniqueIps = new Set(visitors?.map(v => v.viewer_ip) || []);

      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .gte('created_at', sevenDaysAgo.toISOString());

      setViews(totalViews || 0);
      setUniqueVisitors(uniqueIps.size);
      setLast7Days(recentViews || 0);
      setLoading(false);
    };

    fetchAnalytics();
  }, [profileId, isPremium]);

  if (!isPremium) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
        <p className="text-gray-600 mb-6">Upgrade to Premium to track profile analytics</p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 opacity-50">
            <div className="text-center">
              <Eye className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-2xl font-bold text-gray-300">--</p>
              <p className="text-xs text-gray-500">Total Views</p>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-2xl font-bold text-gray-300">--</p>
              <p className="text-xs text-gray-500">Unique Visitors</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-2xl font-bold text-gray-300">--</p>
              <p className="text-xs text-gray-500">Last 7 Days</p>
            </div>
          </div>
        </div>
        
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold">
          Upgrade - $10/month
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-500" />
        Analytics
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-3xl font-bold text-blue-600">{views.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Views</p>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <p className="text-3xl font-bold text-green-600">{uniqueVisitors.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Unique Visitors</p>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-3xl font-bold text-purple-600">{last7Days.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Last 7 Days</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">View History</h3>
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p>Detailed analytics charts coming soon</p>
        </div>
      </div>
    </div>
  );
}
