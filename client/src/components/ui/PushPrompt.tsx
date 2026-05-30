import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import api from '../../api/client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const dismissed = localStorage.getItem('push_dismissed');
    if (dismissed) return;
    const permission = Notification.permission;
    if (permission === 'granted') {
      setSubscribed(true);
      return;
    }
    if (permission === 'denied') return;
    // Only show the prompt if the server actually has push configured (VAPID key).
    let timer: ReturnType<typeof setTimeout> | undefined;
    api.get('/forms/vapid-public-key')
      .then(() => { timer = setTimeout(() => setVisible(true), 10000); })
      .catch(() => { /* push not configured — never prompt */ });
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { data: keyData } = await api.get('/forms/vapid-public-key');
      const sw = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.key) as unknown as ArrayBuffer,
      });
      const json = sub.toJSON();
      if (json.keys) {
        await api.post('/forms/push-subscribe', {
          endpoint: sub.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        });
      }
      setSubscribed(true);
      setVisible(false);
    } catch {
      setError('Could not enable notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem('push_dismissed', '1');
    setVisible(false);
  }

  if (!visible || subscribed) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-24 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-40 animate-fade-in">
      <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">Stay Connected</p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            Get notified about Sunday services, events, and church announcements.
          </p>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Subscribing…' : 'Enable Notifications'}
            </button>
            <button onClick={handleDismiss} className="px-3 py-2 text-gray-500 text-xs hover:text-gray-700 transition-colors">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
