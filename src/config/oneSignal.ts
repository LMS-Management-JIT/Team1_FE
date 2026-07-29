import OneSignal from 'react-onesignal';
import { toast } from 'sonner';

let isInitStarted = false;
let currentLoggedInAccountId: string | null = null;
let authOperationPromise: Promise<void> = Promise.resolve();
let hasPromptedPermission = false; // Track đã prompt permission chưa
let lastPermissionState: boolean | null = null; // Track trạng thái permission trước đó

// Detect Incognito mode
const isIncognitoMode = async (): Promise<boolean> => {
  try {
    const requestFileSystem = (window as any).requestFileSystem || (window as any).webkitRequestFileSystem;
    if (!requestFileSystem) return false;

    return new Promise<boolean>((resolve) => {
      requestFileSystem((window as any).TEMPORARY, 100, () => resolve(false), () => resolve(true));
    });
  } catch {
    return false;
  }
};

// Listen to permission change event (reset flag khi permission thay đổi)
const setupPermissionChangeListener = () => {
  OneSignal.Notifications.addEventListener('permissionChange', (isGranted: boolean) => {
    // Nếu permission từ granted → denied hoặc permission bị revoke/unregister
    // thì reset flag để prompt lại lần tới
    if (lastPermissionState === true && isGranted === false) {
      hasPromptedPermission = false;
    }
    
    lastPermissionState = isGranted;
  });
};

// Hàm yêu cầu permission thông báo
const requestNotificationPermission = async (): Promise<void> => {
  const currentPermission = OneSignal.Notifications.permission;
  
  // Track permission state
  if (lastPermissionState === null) {
    lastPermissionState = currentPermission;
  }
  
  // Nếu đã có permission, không cần làm gì
  if (currentPermission) {
    return;
  }

  // Nếu đã prompt một lần rồi, đừng prompt lại (tránh 409)
  if (hasPromptedPermission) {
    return;
  }

  // Check Incognito mode - Chrome Incognito không hỗ trợ notifications
  const isIncognito = await isIncognitoMode();
  if (isIncognito) {
    // Silent skip trong Incognito mode - không show error
    // User sẽ vào được app nhưng không nhận được notification
    return;
  }

  // Mark đã prompt
  hasPromptedPermission = true;

  // Gửi prompt 1 lần duy nhất (silent - không log)
  try {
    await OneSignal.Slidedown.promptPush();
    
    // Sau khi user cho phép, đợi OneSignal SDK setup subscription + service worker activate
    // để tránh error "No active registration" hoặc "No SW registration for postMessage"
    if (OneSignal.Notifications.permission) {
      // Delay đủ lâu để service worker fully activate và ready
      // Timeline: 0-1s register → 1-2s activate → 2-3s subscription → 3-7s final setup
      // Tăng từ 5.5s → 7s để đảm bảo SW hoàn toàn ready trước khi sử dụng
      await new Promise(resolve => setTimeout(resolve, 7000));
    } else {
      // User từ chối - silent, đừng log error
      toast.warning("Vui lòng cho phép thông báo để nhận tin tức kịp thời", {
        duration: 5000,
        position: 'top-right',
      });
    }
  } catch (error: any) {
    // Catch "Permission blocked" hoặc các errors khác (Incognito, etc)
    // Silent handle - không throw error
    // User vẫn vào được app
    if (!OneSignal.Notifications.permission) {
      // Kiểm tra nếu là Incognito mode thì không show toast
      const isIncognito = await isIncognitoMode();
      if (!isIncognito) {
        toast.warning("Vui lòng cho phép thông báo để nhận tin tức kịp thời", {
          duration: 5000,
          position: 'top-right',
        });
      }
    }
  }
};

export const setupOneSignal = async (accountId: string, externalIdHash?: string | null) => {
  if (!accountId) return;
  if (currentLoggedInAccountId === accountId && isInitStarted) return;

  authOperationPromise = authOperationPromise.then(async () => {
    try {
      // OneSignal.init() chỉ gọi 1 lần duy nhất trong app lifecycle
      if (!isInitStarted) {
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

          window.dispatchEvent(new CustomEvent('app:new-notification'));
        });

        // Setup permission change listener để reset flag khi permission thay đổi
        setupPermissionChangeListener();
      }

      // Nếu account khác, logout account cũ trước (tránh 409 conflict)
      if (currentLoggedInAccountId !== accountId && currentLoggedInAccountId !== null) {
        try {
          await OneSignal.logout();
          // Đợi logout hoàn tất trước khi login account mới
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (logoutError) {
          console.error("Lỗi logout OneSignal:", logoutError);
        }
      }

      // Gọi OneSignal.login() nếu account khác account hiện tại
      if (currentLoggedInAccountId !== accountId) {
        if (externalIdHash) {
          await OneSignal.login(String(accountId), externalIdHash);
        } else {
          await loginWithRetry(String(accountId));
        }
        currentLoggedInAccountId = accountId;
      }

      // Yêu cầu permission nếu chưa có
      await requestNotificationPermission();
    } catch (error) {
      console.error("Lỗi cấu hình OneSignal:", error);
      // KHÔNG reset isInitStarted - OneSignal.init() chỉ gọi 1 lần
      // Chỉ reset account ID khi lỗi
      currentLoggedInAccountId = null;
      throw error;
    }
  });

  return authOperationPromise;
};

async function loginWithRetry(accountId: string, attempt = 1): Promise<void> {
  try {
    await OneSignal.login(accountId);
  } catch (error: any) {
    const status = error?.status || error?.response?.status;
    if (status === 409 && attempt < 5) {
      // Exponential backoff: 1.5s, 3s, 4.5s, 6s
      const delayMs = 1500 * attempt;
      await new Promise(resolve => setTimeout(resolve, delayMs));
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
      // KHÔNG reset isInitStarted - OneSignal.init() chỉ gọi 1 lần duy nhất
      // Chỉ reset permission prompt flag
      hasPromptedPermission = false;
    } catch (error) {
      console.error("Lỗi đăng xuất OneSignal:", error);
    }
  });
  return authOperationPromise;
};