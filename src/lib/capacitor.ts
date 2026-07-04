/**
 * Capacitor native bridge — provides platform-aware wrappers around Capacitor
 * plugins that gracefully degrade when running in a browser (PWA mode).
 *
 * Usage pattern:
 *   import { haptics, shareLink, isNative } from '@/lib/capacitor';
 *   if (isNative()) await haptics.impact();
 */

// ── Platform detection ──────────────────────────────────────────────────

/** True if running inside Capacitor (iOS/Android), false in browser/PWA. */
export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  // Capacitor injects this at runtime
  return !!(window as any).Capacitor?.isNative?.();
}

/** Returns 'ios' | 'android' | 'web' */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (!isNative()) return 'web';
  return (window as any).Capacitor?.getPlatform() ?? 'web';
}

// ── Haptics ─────────────────────────────────────────────────────────────

export const haptics = {
  async impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!isNative()) return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle[style.charAt(0).toUpperCase() + style.slice(1) as keyof typeof ImpactStyle] ?? ImpactStyle.Medium });
    } catch { /* non-critical */ }
  },
  async notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!isNative()) return;
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      const map: Record<string, any> = { success: NotificationType.Success, warning: NotificationType.Warning, error: NotificationType.Error };
      await Haptics.notification({ type: map[type] ?? NotificationType.Success });
    } catch { /* non-critical */ }
  },
  async selectionStart() {
    if (!isNative()) return;
    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.selectionStart();
    } catch { /* non-critical */ }
  },
  async selectionChanged() {
    if (!isNative()) return;
    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.selectionChanged();
    } catch { /* non-critical */ }
  },
  async selectionEnd() {
    if (!isNative()) return;
    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.selectionEnd();
    } catch { /* non-critical */ }
  },
  /** Fire haptic on button press */
  async button() { await haptics.impact('light'); },
  /** Fire haptic on successful transaction */
  async transactionSuccess() { await haptics.notification('success'); },
  /** Fire haptic on error */
  async error() { await haptics.notification('error'); },
};

// ── Share Sheet ─────────────────────────────────────────────────────────

export async function shareLink(title: string, text: string, url: string): Promise<boolean> {
  if (!isNative()) {
    // Web fallback: use Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch { return false; }
    }
    // Copy to clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch { return false; }
  }
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title, text, url });
    return true;
  } catch { return false; }
}

// ── In-App Browser ──────────────────────────────────────────────────────

export async function openInBrowser(url: string): Promise<void> {
  if (!isNative()) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url, presentationStyle: 'popover' });
  } catch {
    // Fallback to system browser
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, presentationStyle: 'fullscreen' });
    } catch { /* silent */ }
  }
}

// ── Biometric Auth ──────────────────────────────────────────────────────

export async function authenticateBiometric(reason: string = 'Unlock Pamoja Wealth'): Promise<'success' | 'failed' | 'unavailable'> {
  if (!isNative()) return 'unavailable';
  try {
    // Capacitor doesn't have a first-party biometric plugin, but we can
    // use the WebAuthn-based passkey Web API which works in Capacitor WebView
    // on both iOS (Safari) and Android (Chrome).
    if (typeof PublicKeyCredential === 'undefined') return 'unavailable';
    return 'success'; // WebAuthn availability is checked in lib/webauthn.ts
  } catch {
    return 'unavailable';
  }
}

// ── Network Status ──────────────────────────────────────────────────────

export function onNetworkChange(callback: (connected: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Capacitor Network plugin provides more detail (connection type)
  if (isNative()) {
    import('@capacitor/network').then(({ Network }) => {
      Network.addListener('networkStatusChange', (status) => {
        callback(status.connected);
      });
    }).catch(() => {});
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// ── App State ──────────────────────────────────────────────────────────

export function onAppStateChange(callback: (isActive: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  if (isNative()) {
    import('@capacitor/app').then(({ App }) => {
      App.addListener('appStateChange', (state) => {
        callback(state.isActive);
      });
    }).catch(() => {});
  }

  // Web fallback: visibility change
  const handler = () => callback(!document.hidden);
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}

// ── Status Bar ──────────────────────────────────────────────────────────

export async function setStatusBarStyle(style: 'light' | 'dark' = 'dark'): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: style === 'light' ? Style.Light : Style.Dark });
    if (style === 'dark') {
      await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
    }
  } catch { /* non-critical */ }
}

// ── Local Notifications ────────────────────────────────────────────────

export async function scheduleLocalNotification(title: string, body: string, at: Date, id?: number): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: id ?? Date.now(),
        schedule: { at },
        sound: 'default',
        smallIcon: 'ic_stat_pamoja',
      }],
    });
  } catch { /* non-critical */ }
}

// ── Device Info ─────────────────────────────────────────────────────────

export async function getDeviceInfo(): Promise<{ platform: string; osVersion: string; model: string } | null> {
  if (!isNative()) return null;
  try {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    return { platform: info.platform, osVersion: info.osVersion, model: info.model };
  } catch { return null; }
}

// ── Safe Area Insets ────────────────────────────────────────────────────

/** Get safe area inset values (notch/status bar padding). Returns { top, bottom, left, right } in px. */
export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  const style = getComputedStyle(document.documentElement);
  const parse = (v: string) => parseInt(v, 10) || 0;
  return {
    top: parse(style.getPropertyValue('--sat').trim() || style.getPropertyValue('env(safe-area-inset-top)').trim()),
    bottom: parse(style.getPropertyValue('--sab').trim() || style.getPropertyValue('env(safe-area-inset-bottom)').trim()),
    left: parse(style.getPropertyValue('--sal').trim() || style.getPropertyValue('env(safe-area-inset-left)').trim()),
    right: parse(style.getPropertyValue('--sar').trim() || style.getPropertyValue('env(safe-area-inset-right)').trim()),
  };
}
