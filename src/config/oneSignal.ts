import OneSignal from 'react-onesignal';
import { toast } from 'sonner';

let isInitStarted = false;
let currentLoggedInAccountId: string | null = null;
let authOperationPromise: Promise<void> = Promise.resolve();

export const setupOneSignal = async (accountId: string, externalIdHash?: string) => {
  if (!accountId) return;
  if (currentLoggedInAccountId === accountId && OneSignal.initialized) return;

  authOperationPromise = authOperationPromise.then(async () => {
    try {
      if (!isInitStarted && !OneSignal.initialized) {
        isInitStarted = true;
        await OneSignal.init({
          appId: "919a378c-ae46-4a1d-b781-f646ee5133fb",
          allowLocalhostAsSecureOrigin: true,
        });

        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
          const { title, body } = event.notification;

          toast(title || "Thông báo hệ thống", {
            description: body,
            duration: 6000,
            position: 'top-right',
            icon: '🔔',
            style: {
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              color: '#c2410c',
              borderRadius: '12px',
              fontWeight: '500',
            },
          });

          // 📢 Phát event cho toàn ứng dụng (cả Header và NotificationsPage)
          window.dispatchEvent(new CustomEvent('app:new-notification'));
        });
      }

      if (externalIdHash) {
        await OneSignal.login(String(accountId), externalIdHash);
      } else {
        await loginWithRetry(String(accountId));
      }
      currentLoggedInAccountId = accountId;

      if (OneSignal.Notifications.permission !== true) {
        OneSignal.Slidedown.promptPush().catch(() => {});
      }
    } catch (error) {
      console.error("Lỗi cấu hình OneSignal:", error);
      isInitStarted = false;
      currentLoggedInAccountId = null;
    }
  });

  return authOperationPromise;
};

async function loginWithRetry(accountId: string, attempt = 1): Promise<void> {
  try {
    await OneSignal.login(accountId);
  } catch (error: any) {
    const status = error?.status || error?.response?.status;
    if (status === 409 && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 800 * attempt));
      return loginWithRetry(accountId, attempt + 1);
    }
    throw error;
  }
}

export const logoutOneSignal = async () => {
  authOperationPromise = authOperationPromise.then(async () => {
    try {
      await OneSignal.logout();
      currentLoggedInAccountId = null;
    } catch (error) {
      console.error("Lỗi đăng xuất OneSignal:", error);
    }
  });
  return authOperationPromise;
};