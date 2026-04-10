import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';

// iOS Bridge Plugin for native functionality
export interface UREPPBridgePlugin {
  // Camera access
  requestCameraPermission(): Promise<{ status: string }>;
  openCamera(): Promise<{ image: string }>;
  
  // Notifications
  requestNotificationPermission(): Promise<{ status: string }>;
  
  // Deep linking
  handleDeepLink(url: string): Promise<{ success: boolean }>;
  
  // Share
  shareContent(options: { title: string; text: string; url: string }): Promise<void>;
}

// Web fallback for iOS bridge
const UREPPBridge = registerPlugin<UREPPBridgePlugin>('UREPPBridge', {
  web: () => ({
    async requestCameraPermission() {
      return { status: 'granted' };
    },
    async openCamera() {
      // Web fallback - use file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.click();
      return { image: '' };
    },
    async requestNotificationPermission() {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return { status: permission };
      }
      return { status: 'unsupported' };
    },
    async handleDeepLink() {
      return { success: true };
    },
    async shareContent(options: { title: string; text: string; url: string }) {
      if (navigator.share) {
        await navigator.share(options);
      }
    }
  })
});

// iOS App Helper
export class UREPPApp {
  static isNative() {
    return Capacitor.isNativePlatform();
  }

  static isIOS() {
    return Capacitor.getPlatform() === 'ios';
  }

  // Initialize app
  static async init() {
    if (this.isNative()) {
      // Hide splash screen after loading
      await SplashScreen.hide();
      
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0ea5e9' });
    }
  }

  // Save data to native storage
  static async saveData(key: string, value: string) {
    await Preferences.set({ key, value });
  }

  // Get data from native storage
  static async getData(key: string) {
    const result = await Preferences.get({ key });
    return result.value;
  }

  // Share profile
  static async shareProfile(username: string) {
    const url = `https://urepp.vercel.app/players/${username}`;
    await UREPPBridge.shareContent({
      title: 'Check out my UREPP profile!',
      text: 'View my recruiting profile on UREPP',
      url
    });
  }
}

export { App, StatusBar, SplashScreen, Preferences, UREPPBridge };
