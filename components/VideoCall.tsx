'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Loader2, X } from 'lucide-react';

interface VideoCallProps {
  roomUrl: string;
  userName: string;
  onLeave?: () => void;
}

export default function VideoCall({ roomUrl, userName, onLeave }: VideoCallProps) {
  const router = useRouter();

  const handleLeftMeeting = useCallback(() => {
    if (onLeave) {
      onLeave();
    } else {
      router.back();
    }
  }, [onLeave, router]);

  useEffect(() => {
    if (!roomUrl) return;

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

    callFrame.join({
      url: roomUrl,
      userName: userName,
      showLocalVideo: true,
      showParticipantsBar: true,
    });

    callFrame.on('left-meeting', handleLeftMeeting);

    return () => {
      callFrame.destroy();
    };
  }, [roomUrl, userName, handleLeftMeeting]);

  if (!roomUrl) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return null;
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
