import { authClient } from './authService';
import { apiClient } from './apiClient';
import type { AppNotification } from '../types/notification';

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

// ==========================================
// 1. LUỒNG DÙNG AUTHENTICATION (INBOX CÁ NHÂN)
// ==========================================

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

export async function markMyNotificationAsRead(
  type: NotificationType,
  notificationDocId: string
): Promise<void> {
  await authClient.patch(`/notifications/${type.toLowerCase()}/${notificationDocId}/read`);
}

export async function markAllMyNotificationsAsRead(): Promise<void> {
  await authClient.patch('/notifications/read-all');
}

// ==========================================
// 2. LUỒNG DÙNG STUDENT ID (DROPDOWN CHUÔNG 🔔)
// ==========================================

export async function getNotificationsByStudent(
  studentId: string,
  limit = 20
): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[]>(
    `/notifications/student/${studentId}`,
    { params: { limit } }
  );
  return data;
}

export async function getUnreadCountByStudent(studentId: string): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>(
    `/notifications/student/${studentId}/unread-count`
  );
  return data.count;
}

export async function markNotificationAsReadById(id: string): Promise<void> {
  await apiClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsReadByStudent(studentId: string): Promise<void> {
  await apiClient.put(`/notifications/student/${studentId}/read-all`);
}