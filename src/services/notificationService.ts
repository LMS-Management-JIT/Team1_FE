import { authClient } from './authService';

export type NotificationType = 'SYSTEM' | 'CLASS' | 'ATTENDANCE';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  note?: string;
  type: NotificationType;
  collection: string;
  class_id?: string;
  session_id?: string;
  notification_id?: string;
  is_read: boolean;
  created_at: string;
};

export async function getMyNotifications(
  type?: NotificationType,
  signal?: AbortSignal
): Promise<NotificationItem[]> {
  const response = await authClient.get<NotificationItem[]>('/notifications/my', {
    params: type ? { type } : {},
    signal,
  });
  return response.data;
}

export async function markNotificationAsRead(type: NotificationType, notificationDocId: string): Promise<void> {
  await authClient.patch(`/notifications/${type.toLowerCase()}/${notificationDocId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await authClient.patch('/notifications/read-all');
}