'use client';

import { useState } from 'react';
import { BarChart3, Save, Edit3, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StatsEditorProps {
  profile: {
    id: string;
    height?: string;
    weight?: string;
    gpa?: number;
    sat_score?: number;
    act_score?: number;
  };
  isPremium: boolean;
}

export function StatsEditor({ profile, isPremium }: StatsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    height: profile?.height || '',
    weight: profile?.weight || '',
    gpa: profile?.gpa || '',
    sat_score: profile?.sat_score || '',
    act_score: profile?.act_score || '',
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', profile.id);
    setSaving(false);
    if (!error) setIsEditing(false);
  };

  const fields = [
    { key: 'height', label: 'Height', type: 'text' },
    { key: 'weight', label: 'Weight', type: 'text' },
    { key: 'gpa', label: 'GPA', type: 'number' },
    { key: 'sat_score', label: 'SAT', type: 'number' },
    { key: 'act_score', label: 'ACT', type: 'number' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          Stats
        </h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 border px-4 py-2 rounded-lg">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {fields.map((field) => (
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
        ))}
      </div>
    </div>
  );
}
