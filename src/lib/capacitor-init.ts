/**
 * Capacitor mobile app initialization.
 *
 * Called from main.tsx at app startup. Sets up:
 * - Native status bar styling
 * - Push notification registration
 * - App state listeners
 * - Network monitoring
 * - Capacitor CSS class on <html>
 *
 * All operations gracefully no-op when running in a browser.
 */

export async function initCapacitor(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const isNative = !!(window as any).Capacitor?.isNative?.();
  if (!isNative) return;

  // Mark <html> with capacitor-native class for CSS targeting
  document.documentElement.classList.add('capacitor-native');

  // Status bar styling
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
    // Show the status bar overlay (prevents content from going behind it)
    await StatusBar.show();
  } catch { /* non-critical */ }

  // Network monitoring
  try {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    // Dispatch initial network status for the app
    window.dispatchEvent(new CustomEvent('capacitor:networkChange', {
      detail: { connected: status.connected, connectionType: status.connectionType },
    }));
  } catch { /* non-critical */ }

  // Listen for back button on Android
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      // If we can go back in browser history, do that
      if (canGoBack) {
        window.history.back();
      } else {
        // Otherwise, minimize the app (Android convention)
        App.minimizeApp?.();
      }
    });
  } catch { /* non-critical */ }

  console.log('[Pamoja] Capacitor native environment initialized');
}

/**
 * Register for push notifications via Capacitor.
 * Called after successful authentication.
 */
export async function registerPushNotifications(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const isNative = !!(window as any).Capacitor?.isNative?.();
  if (!isNative) return null;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Request permission
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive !== 'granted') return null;

    // Register with FCM/APNs
    await PushNotifications.register();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 10000);

      PushNotifications.addListener('registration', (token) => {
        clearTimeout(timeout);
        resolve(token.value);
      });

      PushNotifications.addListener('registrationError', (err) => {
        clearTimeout(timeout);
        console.error('[Pamoja] Push registration error:', err);
        resolve(null);
      });
    });
  } catch {
    return null;
  }
}

/**
 * Handle incoming push notifications (when app is in foreground).
 */
export function setupPushNotificationHandlers(
  onNotificationTap: (data: Record<string, string>) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const isNative = !!(window as any).Capacitor?.isNative?.();
  if (!isNative) return () => {};

  const cleaners: (() => void)[] = [];

  import('@capacitor/push-notifications').then(({ PushNotifications }) => {
    // Notification received in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Pamoja] Push received (foreground):', notification.title);
    });

    // Notification tapped (app opened from notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      const data = notification.notification.data as Record<string, string> | undefined;
      if (data) {
        onNotificationTap(data);
      }
    });
  }).catch(() => {});

  return () => cleaners.forEach(fn => fn());
}
