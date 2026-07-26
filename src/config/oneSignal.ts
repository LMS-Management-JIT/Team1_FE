import OneSignal from 'react-onesignal';
import { toast } from 'sonner';

let isInitStarted = false;
let isListenerAdded = false;

export const setupOneSignal = async (accountId: string) => {
  if (!accountId) return;

  try {
    if (!isInitStarted && !OneSignal.initialized) {
      isInitStarted = true;
      await OneSignal.init({
        appId: "919a378c-ae46-4a1d-b781-f646ee5133fb",
        allowLocalhostAsSecureOrigin: true,
      });
    }

    if (OneSignal.Notifications.permission !== true) {
      await OneSignal.Slidedown.promptPush();
    }

    // XỬ LÝ AN TOÀN TRÁNH LỖI 409 CONFLICT KHI RELOAD/TEST
    try {
      await OneSignal.login(String(accountId));
    } catch (loginError: any) {
      // Nếu gặp lỗi xung đột (409) hoặc lỗi định danh, thử logout ngầm rồi đăng nhập lại một nhịp
      console.warn("OneSignal login conflict detected, retrying...", loginError);
      await OneSignal.logout();
      await OneSignal.login(String(accountId));
    }

    if (!isListenerAdded) {
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
      });
      isListenerAdded = true;
    }

  } catch (error) {
    console.error("Lỗi cấu hình OneSignal:", error);
    isInitStarted = false;
  }
};

export const logoutOneSignal = async () => {
  try {
    await OneSignal.logout();
  } catch (error) {
    console.error("Lỗi đăng xuất OneSignal:", error);
  }
};