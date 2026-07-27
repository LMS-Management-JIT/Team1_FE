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
import { apiClient } from "./apiClient";
import type { AppNotification } from "../types/notification";

export async function getNotifications(
    studentId: string,
    limit = 20
): Promise<AppNotification[]> {
    const { data } = await apiClient.get<AppNotification[]>(
        `/notifications/student/${studentId}`,
        { params: { limit } }
    );
    return data;
}

export async function getUnreadCount(studentId: string): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>(
        `/notifications/student/${studentId}/unread-count`
    );
    return data.count;
}

export async function markNotificationAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(studentId: string): Promise<void> {
    await apiClient.put(`/notifications/student/${studentId}/read-all`);
}
