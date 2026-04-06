import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urepp.recruiters',
  appName: 'UREPP Recruiters',
  webDir: 'dist',
  server: {
    url: 'https://www.urepp.app/recruiter-login',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;
