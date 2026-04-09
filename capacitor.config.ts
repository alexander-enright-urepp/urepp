import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urepp.app',
  appName: 'UREPP',
  webDir: 'dist',
  // Use production site for proper routing
  server: {
    url: 'https://www.urepp.app',
    cleartext: false,
    allowNavigation: ['urepp.app', '*.urepp.app']
  },
  ios: {
    scheme: 'UREPP',
    contentInset: 'always'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#0ea5e9',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0ea5e9',
      overlaysWebView: false
    }
  }
};

export default config;