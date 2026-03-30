'use client';

import { useState } from 'react';
import { BarChart3, Save, Edit3, X, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StatsEditorProps {
  profile: {
    id: string;
    height?: string;
    weight?: string;
    gpa?: number;
    sat_score?: number;
    act_score?: number;
    primary_position?: string;
    secondary_position?: string;
    stat_primary?: string;
    stat_secondary?: string;
    stat_tertiary?: string;
  };
  isPremium: boolean;
}

export function StatsEditor({ profile, isPremium }: StatsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    // Free stats
    height: profile?.height || '',
    weight: profile?.weight || '',
    gpa: profile?.gpa || '',
    sat_score: profile?.sat_score || '',
    act_score: profile?.act_score || '',
    // Premium stats
    primary_position: profile?.primary_position || '',
    secondary_position: profile?.secondary_position || '',
    stat_primary: profile?.stat_primary || '',
    stat_secondary: profile?.stat_secondary || '',
    stat_tertiary: profile?.stat_tertiary || '',
  });

  const handleSave = async () => {
    setSaving(true);
    
    const updateData: any = {
      height: formData.height,
      weight: formData.weight,
      gpa: formData.gpa ? parseFloat(formData.gpa as string) : null,
      sat_score: formData.sat_score ? parseInt(formData.sat_score as string) : null,
      act_score: formData.act_score ? parseInt(formData.act_score as string) : null,
    };
    
    // Only update premium fields if user is premium
    if (isPremium) {
      updateData.primary_position = formData.primary_position;
      updateData.secondary_position = formData.secondary_position;
      updateData.stat_primary = formData.stat_primary;
      updateData.stat_secondary = formData.stat_secondary;
      updateData.stat_tertiary = formData.stat_tertiary;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);
    
    setSaving(false);
    if (!error) setIsEditing(false);
  };

  const freeFields = [
    { key: 'height', label: 'Height', type: 'text' },
    { key: 'weight', label: 'Weight', type: 'text' },
    { key: 'gpa', label: 'GPA', type: 'number' },
    { key: 'sat_score', label: 'SAT', type: 'number' },
    { key: 'act_score', label: 'ACT', type: 'number' },
  ];

  const premiumFields = [
    { key: 'primary_position', label: 'Primary Position', type: 'text' },
    { key: 'secondary_position', label: 'Secondary Position', type: 'text' },
    { key: 'stat_primary', label: 'Primary Stat', type: 'text' },
    { key: 'stat_secondary', label: 'Secondary Stat', type: 'text' },
    { key: 'stat_tertiary', label: 'Tertiary Stat', type: 'text' },
  ];

  const renderField = (field: any) => (
    <div key={field.key}>
      <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
      <input
        type={field.type}
        value={formData[field.key as keyof typeof formData]}
        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
        disabled={!isEditing}
        className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          Stats
        </h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)} 
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Free Stats */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {freeFields.map(renderField)}
        </div>
      </div>

      {/* Premium Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Position & Sport Metrics</h3>
          {!isPremium && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" /> Premium
            </span>
          )}
        </div>
        
        {isPremium ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {premiumFields.map(renderField)}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <p className="text-gray-600 mb-4">Upgrade to Premium to edit position and sport metrics</p>
            <div className="grid grid-cols-3 gap-4 opacity-50">
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500">Primary Position</p>
                <p className="text-lg font-bold text-gray-300">--</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500">Secondary Position</p>
                <p className="text-lg font-bold text-gray-300">--</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-xs text-gray-500">Sport Stats</p>
                <p className="text-lg font-bold text-gray-300">--</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
