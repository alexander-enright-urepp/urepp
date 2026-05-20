'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ThemeCustomizerProps {
  profile: {
    id: string;
    custom_theme?: {
      banner_color?: string;
      accent_color?: string;
      layout?: string;
    };
  };
  isPremium: boolean;
}

const PRESET_THEMES = [
  { id: 'classic', name: 'Classic Blue', banner: '#3b82f6', accent: '#1e40af' },
  { id: 'dark', name: 'Midnight', banner: '#1a1a2e', accent: '#e94560' },
  { id: 'champions', name: 'Champions Gold', banner: '#ffd700', accent: '#b8860b' },
  { id: 'forest', name: 'Forest Green', banner: '#228b22', accent: '#006400' },
  { id: 'crimson', name: 'Crimson Red', banner: '#dc143c', accent: '#8b0000' },
];

export function ThemeCustomizer({ profile, isPremium }: ThemeCustomizerProps) {
  const [theme, setTheme] = useState(profile?.custom_theme || {
    banner_color: '#3b82f6',
    accent_color: '#1e40af',
    layout: 'standard'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveTheme = async () => {
    if (!isPremium) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ custom_theme: theme })
      .eq('id', profile.id);
    
    setSaving(false);
    
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setTheme({
      ...theme,
      banner_color: preset.banner,
      accent_color: preset.accent
    });
  };

  if (!isPremium) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Palette className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
        <p className="text-gray-600 mb-4">Upgrade to Premium to customize your profile theme and colors.</p>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold">
          Upgrade - $10/month
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Palette className="w-6 h-6 text-blue-500" />
        Customize Your Profile
      </h2>

      {/* Preset Themes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Preset Themes</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme.banner_color === preset.banner
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div 
                className="h-12 rounded-lg mb-2"
                style={{ background: `linear-gradient(135deg, ${preset.banner}, ${preset.accent})` }}
              />
              <p className="text-sm font-medium">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.banner_color}
                onChange={(e) => setTheme({ ...theme, banner_color: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer border-0"
              />
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{theme.banner_color}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.accent_color}
                onChange={(e) => setTheme({ ...theme, accent_color: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer border-0"
              />
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{theme.accent_color}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="rounded-xl overflow-hidden border">
          <div 
            className="h-32 p-6 flex items-end"
            style={{ backgroundColor: theme.banner_color }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-xl font-bold"
                 style={{ color: theme.accent_color }}>
              AE
            </div>
          </div>
          <div className="p-6 bg-white">
            <h3 className="text-xl font-bold">Alexander Enright</h3>
            <p className="text-gray-600">@alexanderenright</p>
            <div className="flex gap-2 mt-3">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: `${theme.banner_color}20`, color: theme.accent_color }}
              >
                PG
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                Class of 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveTheme}
        disabled={saving}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          saved 
            ? 'bg-green-500' 
            : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50'
        }`}
      >
        {saving ? 'Saving...' : saved ? (
          <span className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Saved!
          </span>
        ) : 'Save Theme'}
      </button>
    </div>
  );
}
