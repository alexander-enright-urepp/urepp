import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urepp.app',
  appName: 'UREPP',
  webDir: 'dist',
  // Use local dev server for proper routing and native bridge
  server: {
    url: 'http://localhost:3000',
    cleartext: true
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