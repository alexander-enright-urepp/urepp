'use client';

import { useState } from 'react';
import { Share2, Download, Check, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ShareableCardProps {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    primary_position?: string;
    grad_year?: number;
    high_school?: string;
    stat_primary?: string;
    stat_secondary?: string;
    is_premium?: boolean;
  };
}

export function ShareableCard({ profile }: ShareableCardProps) {
  const [copied, setCopied] = useState(false);
  const isPremium = profile.is_premium;

  const generateCardData = () => {
    return {
      name: `${profile.first_name} ${profile.last_name}`,
      position: profile.primary_position || 'Athlete',
      class: profile.grad_year ? `Class of ${profile.grad_year}` : '',
      school: profile.high_school || '',
      stats: profile.stat_primary ? `Stat 1: ${profile.stat_primary}` : '',
      url: `${window.location.origin}/players/${profile.username}`,
    };
  };

  const shareCard = async () => {
    const cardUrl = `${window.location.origin}/card/${profile.username}`;
    
    if (navigator.share) {
      await navigator.share({
        title: `${profile.first_name} ${profile.last_name} - UREPP Recruit`,
        text: `Check out ${profile.first_name}'s recruiting profile!`,
        url: cardUrl,
      });
    } else {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    // Track share
    await supabase.from('shareable_cards').insert({
      profile_id: profile.id,
      shared_at: new Date().toISOString(),
    });
  };

  const downloadCard = async () => {
    if (!isPremium) return;
    // Generate and download image - would need html2canvas or similar
    alert('Card download feature coming soon for Premium users!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-4">Recruiting Card</h3>

      {/* Card Preview */}
      <div className={`relative rounded-xl overflow-hidden mb-4 ${
        isPremium 
          ? 'bg-gradient-to-br from-blue-600 to-purple-600 p-1'
          : 'bg-gray-200'
      }`}>
        <div className={`bg-white rounded-lg p-4 ${isPremium ? '' : 'opacity-75'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
              isPremium ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            
            <div className="flex-1">
              <p className="font-bold text-lg">{profile.first_name} {profile.last_name}</p>
              <p className="text-sm text-gray-600">{profile.primary_position || 'Athlete'}</p>
              <p className="text-xs text-gray-500">{profile.high_school}</p>
            </div>
          </div>

          {isPremium && profile.stat_primary && (
            <div className="mt-3 pt-3 border-t flex gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Primary Stat</p>
                <p className="font-bold text-blue-600">{profile.stat_primary}</p>
              </div>
              {profile.stat_secondary && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">Secondary Stat</p>
                  <p className="font-bold text-blue-600">{profile.stat_secondary}</p>
                </div>
              )}
            </div>
          )}

          {!isPremium && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Premium Feature
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={shareCard}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share
            </>
          )}
        </button>

        <button
          onClick={downloadCard}
          disabled={!isPremium}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download
          {!isPremium && <Crown className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
