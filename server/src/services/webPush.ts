import webpush from 'web-push';

export const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
export const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

export function initWebPush() {
  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
      'mailto:admin@lighthouseparish.org',
      vapidPublicKey,
      vapidPrivateKey,
    );
  }
}

export { webpush };
