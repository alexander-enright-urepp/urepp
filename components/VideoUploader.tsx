'use client';

import { useState } from 'react';
import { Upload, Youtube, ExternalLink, Crown } from 'lucide-react';

interface VideoUploaderProps {
  profile: any;
  isPremium: boolean;
}

export function VideoUploader({ profile, isPremium }: VideoUploaderProps) {
  const [showDialog, setShowDialog] = useState(false);

  // FREE: Locked
  if (!isPremium) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
        <p className="text-gray-600 mb-4">Upgrade to upload videos</p>
        <ul className="text-sm text-gray-500 text-left max-w-xs mx-auto space-y-2">
          <li>✓ Unlimited video uploads</li>
          <li>✓ YouTube & Hudl imports</li>
          <li>✓ Featured video highlighting</li>
        </ul>
      </div>
    );
  }

  // PREMIUM: Full access
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Videos</h2>
        <button onClick={() => setShowDialog(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Add Video
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
        <p className="text-gray-500">Video upload ready</p>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Video</h3>
            
            <div className="flex gap-2 mb-4">
              <button className="flex-1 py-2 border rounded-lg">YouTube</button>
              <button className="flex-1 py-2 border rounded-lg">Hudl</button>
            </div>

            <input type="url" placeholder="Video URL" className="w-full px-3 py-2 border rounded-lg mb-4" />
            
            <div className="flex gap-2">
              <button onClick={() => setShowDialog(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
              <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
