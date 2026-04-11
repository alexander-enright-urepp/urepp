import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

import AppInit from '@/components/AppInit'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UREPP - Universal Recruitment Profile Platform',
  description: 'Create and share your sports recruiting profile',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Inject Capacitor bridge if in native app
                if (typeof window !== 'undefined' && !window.Capacitor) {
                  // Try to find native bridge
                  var attempts = 0;
                  var checkInterval = setInterval(function() {
                    if (window.Capacitor) {
                      clearInterval(checkInterval);
                      console.log('[Bridge] Capacitor detected');
                    }
                    attempts++;
                    if (attempts > 50) clearInterval(checkInterval); // 5 seconds
                  }, 100);
                }
                
                // iOS Detection for debugging
                window.checkiOS = function() {
                  var ua = navigator.userAgent || '';
                  var isIPad = /iPad/.test(ua);
                  var isIPhone = /iPhone/.test(ua);
                  var isIPod = /iPod/.test(ua);
                  var isIOS = isIPad || isIPhone || isIPod;
                  var isChrome = /CriOS/.test(ua);
                  var isFirefox = /FxiOS/.test(ua);
                  var hasCapacitor = typeof window.Capacitor !== 'undefined';
                  
                  console.log('[iOS Check] UA:', ua.substring(0, 50));
                  console.log('[iOS Check] isIOS:', isIOS);
                  console.log('[iOS Check] hasCapacitor:', hasCapacitor);
                  console.log('[iOS Check] Capacitor Platform:', hasCapacitor ? window.Capacitor.getPlatform() : 'N/A');
                  
                  return {
                    isIOS: isIOS,
                    isNative: isIOS && !isChrome && !isFirefox,
                    hasCapacitor: hasCapacitor,
                    platform: hasCapacitor ? window.Capacitor.getPlatform() : null
                  };
                };
                
                // Run check on load
                setTimeout(window.checkiOS, 1000);
              })();
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <AppInit />
      </body>
    </html>
  )
}
