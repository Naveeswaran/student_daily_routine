// RoutineMate Notification & Web Push Service

import { pushAPI } from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported by this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('RoutineMate Service Worker registered successfully:', registration.scope);
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

// Request permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Desktop notifications not supported');
    return 'unsupported';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Subscribe to Web Push
export async function setupWebPushSubscription() {
  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission was ' + permission };
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, message: 'Service worker unavailable' };
    }

    // Get public key from backend
    const keyData = await pushAPI.getPublicKey();
    const vapidPublicKey = keyData.publicKey;

    if (!vapidPublicKey) {
      return { success: false, message: 'Failed to retrieve VAPID public key from backend' };
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe with Push Manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    const subJson = subscription.toJSON();
    const payload = {
      endpoint: subscription.endpoint,
      p256dh: subJson.keys?.p256dh || '',
      auth: subJson.keys?.auth || ''
    };

    // Save to backend database
    await pushAPI.subscribe(payload);
    return { success: true, message: 'Web Push Notifications successfully connected!' };
  } catch (error) {
    console.warn('Web Push subscription error:', error);
    return { success: false, message: error.message };
  }
}

// Play a subtle modern audio tone for reminders
export function playAlertTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio autoplay restrictions or unsupported
  }
}

// Display foreground browser notification fallback
export function triggerForegroundNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico'
      });
      playAlertTone();
    } catch (e) {
      console.log('Foreground notification fallback error', e);
    }
  }
}
