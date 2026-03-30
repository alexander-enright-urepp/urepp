'use client';

import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, Eye, EyeOff, Trash2, Edit3, GripVertical, Crown, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Link {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  color?: string;
  is_visible: boolean;
  sort_order: number;
}

interface LinksEditorProps {
  profileId: string;
  isPremium: boolean;
}

const MAX_FREE_LINKS = 2;

export function LinksEditor({ profileId, isPremium }: LinksEditorProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    url: '',
    icon: '',
    color: '#3b82f6',
    is_visible: true,
  });

  useEffect(() => {
    fetchLinks();
  }, [profileId]);

  const fetchLinks = async () => {
    const { data } = await supabase
      .from('profile_links')
      .select('*')
      .eq('profile_id', profileId)
      .order('sort_order', { ascending: true });
    
    if (data) setLinks(data);
  };

  const canAddMore = isPremium || links.length < MAX_FREE_LINKS;

  const handleSave = async () => {
    if (!formData.title || !formData.url) return;

    if (editingLink) {
      await supabase
        .from('profile_links')
        .update(formData)
        .eq('id', editingLink.id);
    } else {
      await supabase
        .from('profile_links')
        .insert({
          ...formData,
          profile_id: profileId,
          sort_order: links.length,
        });
    }

    await fetchLinks();
    setShowAddDialog(false);
    setEditingLink(null);
    resetForm();
  };

  const deleteLink = async (id: string) => {
    await supabase.from('profile_links').delete().eq('id', id);
    await fetchLinks();
  };

  const toggleVisibility = async (link: Link) => {
    await supabase
      .from('profile_links')
      .update({ is_visible: !link.is_visible })
      .eq('id', link.id);
    await fetchLinks();
  };

  const editLink = (link: Link) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      subtitle: link.subtitle || '',
      url: link.url,
      icon: link.icon || '',
      color: link.color || '#3b82f6',
      is_visible: link.is_visible,
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      url: '',
      icon: '',
      color: '#3b82f6',
      is_visible: true,
    });
  };

  const openAddDialog = () => {
    setEditingLink(null);
    resetForm();
    setShowAddDialog(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-blue-500" />
          Links
        </h2>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <span className="text-sm text-gray-500">
              {links.length}/{MAX_FREE_LINKS} links
            </span>
          )}
          {isPremium && (
            <span className="text-sm text-green-600">Unlimited links</span>
          )}
        </div>
      </div>

      {/* Add Link Button */}
      {canAddMore ? (
        <button
          onClick={openAddDialog}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors mb-6"
        >
          <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <span className="text-gray-600">Add Link</span>
        </button>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-6">
          <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-gray-700 mb-2">Upgrade to Premium for unlimited links</p>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
            Upgrade - $10/month
          </button>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="text-gray-400 cursor-move">
              <GripVertical className="w-5 h-5" />
            </div>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: link.color || '#3b82f6', color: 'white' }}
            >
              {link.icon || '🔗'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{link.title}</p>
              {link.subtitle && (
                <p className="text-sm text-gray-500 truncate">{link.subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleVisibility(link)}
                className={`p-2 rounded-lg ${
                  link.is_visible ? 'text-gray-400' : 'text-gray-300'
                }`}
                title={link.is_visible ? 'Hide' : 'Show'}
              >
                {link.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => editLink(link)}
                className="p-2 text-gray-400 hover:text-blue-500 rounded-lg"
                title="Edit"
              >
                <Edit3 className="w-5 h-5" />
              </button>

              <button
                onClick={() => deleteLink(link.id)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingLink ? 'Edit Link' : 'Add Link'}</h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🔗"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Emoji or icon</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_visible" className="text-sm text-gray-700">Visible on public page</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title || !formData.url}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:opacity-50"
                >
                  {editingLink ? 'Save' : 'Add Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
