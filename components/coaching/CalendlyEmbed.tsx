'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CalendlyEmbedProps {
  calendlyUrl: string;
  coachName: string;
  height?: string;
}

export function CalendlyEmbed({ calendlyUrl, coachName, height = '700px' }: CalendlyEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Ensure the URL is properly formatted
  const fullUrl = calendlyUrl.startsWith('http') 
    ? calendlyUrl 
    : `https://calendly.com/${calendlyUrl}`;

  // Add UTM parameters for tracking
  const urlWithParams = `${fullUrl}?utm_source=urepp&utm_medium=app&utm_campaign=coaching`;

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading {coachName}&apos;s calendar...</p>
        </div>
      )}
      <iframe
        src={urlWithParams}
        width="100%"
        height={height}
        frameBorder="0"
        scrolling="no"
        className={`rounded-xl ${isLoading ? 'hidden' : 'block'}`}
        onLoad={() => setIsLoading(false)}
        title={`Book session with ${coachName}`}
      />
    </div>
  );
}
