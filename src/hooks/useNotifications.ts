import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getNotifications,
    getUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";

const POLL_INTERVAL_MS = 30_000; // 30s — đủ gần real-time mà không cần WebSocket riêng cho việc này

export function useUnreadNotificationCount(studentId: string | undefined) {
    return useQuery({
        queryKey: ["notifications-unread-count", studentId],
        queryFn: () => getUnreadCount(studentId as string),
        enabled: Boolean(studentId),
        refetchInterval: POLL_INTERVAL_MS,
        refetchOnWindowFocus: true,
    });
}

// Chỉ tải danh sách đầy đủ khi dropdown thực sự mở (enabled truyền vào từ component)
export function useNotificationList(studentId: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: ["notifications", studentId],
        queryFn: () => getNotifications(studentId as string),
        enabled: Boolean(studentId) && enabled,
    });
}

export function useMarkNotificationAsRead(studentId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", studentId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", studentId] });
        },
    });
}

export function useMarkAllNotificationsAsRead(studentId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => markAllNotificationsAsRead(studentId as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", studentId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", studentId] });
        },
    });
}
