'use client';

import { useState } from 'react';
import { Share2, Download, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ShareableCardProps {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
    high_school: string;
    stats_json: any;
    is_premium?: boolean;
  };
}

export function ShareableCard({ profile }: ShareableCardProps) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateCard = async () => {
    setGenerating(true);
    
    // Track share
    await supabase.rpc('increment_share_count', {
      profile_id: profile.id
    });
    
    setGenerating(false);
  };

  const shareCard = async () => {
    const cardUrl = `${window.location.origin}/card/${profile.id}`;
    
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
    
    generateCard();
  };

  // Premium styling
  const isPremium = profile.is_premium;
  
  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl ${
      isPremium 
        ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-1' 
        : 'bg-gray-200'
    }`}>
      <div className={`${isPremium ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'} rounded-xl p-6`}>
        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              ⭐ FEATURED ATHLETE
            </span>
          </div>
        )}

        {/* Card Content */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
            isPremium 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          
          <div>
            <h3 className={`text-xl font-bold ${isPremium ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
              {profile.first_name} {profile.last_name}
            </h3>
            <p className="text-gray-600">{profile.position}</p>
            <p className="text-sm text-gray-500">{profile.high_school}</p>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className={`p-2 rounded-lg ${isPremium ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500">Batting Avg</p>
            <p className={`font-bold ${isPremium ? 'text-blue-600' : 'text-gray-700'}`}>
              {profile.stats_json?.batting_avg || '---'}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isPremium ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500">ERA</p>
            <p className={`font-bold ${isPremium ? 'text-blue-600' : 'text-gray-700'}`}>
              {profile.stats_json?.era || '---'}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isPremium ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500">Height</p>
            <p className={`font-bold ${isPremium ? 'text-blue-600' : 'text-gray-700'}`}>
              {profile.stats_json?.height || '---'}
            </p>
          </div>
        </div>

        {/* UREPP Branding */}
        <div className={`text-center pt-4 border-t ${isPremium ? 'border-purple-200' : 'border-gray-200'}`}>
          <p className={`text-xs font-medium ${isPremium ? 'text-purple-600' : 'text-gray-400'}`}>
            UREPP - Student Athlete Recruitment Platform
          </p>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={shareCard}
        disabled={generating}
        className={`mt-4 w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          isPremium
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-purple-200'
            : 'bg-gray-800 hover:bg-gray-900 text-white'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="w-5 h-5" /
            Share Card
          </>
        )}
      </button>
    </div>
  );
}
