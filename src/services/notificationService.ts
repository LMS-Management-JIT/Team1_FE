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
