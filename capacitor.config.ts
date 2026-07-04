import { CapacitorConfig } from '@capacitor/cli';

/**
 * Pamoja Wealth — Capacitor Mobile App Configuration
 *
 * Production mode: loads from local `webDir` (dist folder) for offline-first.
 * Dev mode: set `PW_CAPACITOR_LIVE_RELOAD=true` to load from dev server.
 *
 * App Store requirement: `server.hostname` must NOT be set for production builds.
 * Local asset loading ensures the app works offline and passes app review.
 */

const isLiveReload = process.env.PW_CAPACITOR_LIVE_RELOAD === 'true';

const config: CapacitorConfig = {
  appId: 'com.pamojawealth.app',
  appName: 'Pamoja Wealth',
  webDir: 'dist',

  // Live-reload for local development only.
  // Production builds: remove the `server` block entirely.
  ...(isLiveReload
    ? {
        server: {
          androidScheme: 'https',
          iosScheme: 'https',
          hostname: 'app.pamojawealth.app',
          url: 'http://localhost:5173',
          cleartext: true,
        },
      }
    : {}),

  plugins: {
    // ── Splash Screen ──
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#059669',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
    },

    // ── Push Notifications (FCM / APNs) ──
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // ── Local Notifications (meeting reminders, contribution nudges) ──
    LocalNotifications: {
      smallIcon: 'ic_stat_pamoja',
      iconColor: '#059669',
    },

    // ── Cookie support for auth tokens ──
    CapacitorCookies: {
      enabled: true,
    },

    // ── Keyboard handling ──
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },

    // ── Haptics — transaction feedback ──
    Haptics: {},

    // ── App state (background/foreground) ──
    App: {},

    // ── Network status monitoring ──
    Network: {},

    // ── Status Bar ──
    StatusBar: {
      style: 'dark',
      backgroundColor: '#059669',
    },
  },

  ios: {
    contentInset: 'automatic',
    scheme: 'PamojaWealth',
    allowsLinkPreview: true,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    // Required for App Store: privacy manifest
    privacyManifest: {
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeEmailAddress',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePhoneNumber',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
        {
          NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypePaymentInfo',
          NSPrivacyCollectedDataTypeLinked: true,
          NSPrivacyCollectedDataTypeTracking: false,
          NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAppFunctionality'],
        },
      ],
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
    },
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#059669',
    // Required for Android 14+ (SDK 34)
    useLegacyBridge: false,
  },
};

export default config;
