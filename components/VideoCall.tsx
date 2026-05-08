'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Loader2, X } from 'lucide-react';

// Global flag to prevent duplicate frames across component remounts
declare global {
  interface Window {
    _dailyFrameActive?: boolean;
  }
}

interface VideoCallProps {
  roomUrl: string;
  userName: string;
  onLeave?: () => void;
}

export default function VideoCall({ roomUrl, userName, onLeave }: VideoCallProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const callFrameRef = useRef<DailyCall | null>(null);

  const handleLeftMeeting = useCallback(() => {
    window._dailyFrameActive = false;
    if (onLeave) {
      onLeave();
    } else {
      router.back();
    }
  }, [onLeave, router]);

  const handleCancel = useCallback(() => {
    try {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    } catch (e) {
      console.log('Error destroying frame:', e);
    }
    window._dailyFrameActive = false;
    handleLeftMeeting();
  }, [handleLeftMeeting]);

  useEffect(() => {
    if (!roomUrl) return;
    
    // Check if another frame is already active
    if (window._dailyFrameActive) {
      console.log('Daily frame already active, skipping creation');
      return;
    }

    try {
      window._dailyFrameActive = true;

      const callFrame = DailyIframe.createFrame({
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: '0',
          zIndex: '1000',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      callFrameRef.current = callFrame;

      callFrame.join({
        url: roomUrl,
        userName: userName,
        showLocalVideo: true,
        showParticipantsBar: true,
      });

      callFrame.on('joined-meeting', () => {
        setIsJoined(true);
      });

      callFrame.on('left-meeting', handleLeftMeeting);
      
      callFrame.on('error', (e: any) => {
        console.error('Daily error:', e);
        setError('Video call error: ' + (e.errorMsg || 'Unknown error'));
      });

    } catch (err: any) {
      console.error('Failed to create Daily frame:', err);
      setError(err.message || 'Failed to start video call');
      window._dailyFrameActive = false;
    }

    return () => {
      try {
        if (callFrameRef.current) {
          callFrameRef.current.destroy();
          callFrameRef.current = null;
        }
      } catch (e) {
        console.log('Error cleaning up Daily frame:', e);
      }
      window._dailyFrameActive = false;
    };
  }, [roomUrl, userName, handleLeftMeeting]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 p-4">
        <X className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white text-center mb-4">{error}</p>
        <button 
          onClick={() => onLeave?.() || router.back()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!roomUrl) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Always show close button overlay for easy exit
  return (
    <>
      {/* Close button - fixed above Daily iframe */}
      <button
        onClick={handleCancel}
        className="fixed top-4 right-4 z-[2147483647] bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors flex items-center justify-center shadow-2xl border-2 border-white"
        style={{ 
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)'
        }}
        aria-label="Leave call"
      >
        <X className="w-6 h-6" />
      </button>
    </>
  );
}

// Simple button component for starting a call
interface StartCallButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function StartCallButton({ onClick, disabled, loading }: StartCallButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
    >
      {loading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Video Call
        </>
      )}
    </button>
  );
}
