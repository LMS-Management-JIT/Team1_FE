import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getNotificationsByStudent,
    getUnreadCountByStudent,
    markAllNotificationsAsReadByStudent,
    markNotificationAsReadById,
    getMyNotifications,
    markMyNotificationAsRead,
    markAllMyNotificationsAsRead,
    type NotificationType as AccountNotificationType,
} from "../services/notificationService";
import type { AppNotification, UnifiedNotification } from "../types/notification";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadNotificationCount(studentId: string | undefined) {
    return useQuery({
        queryKey: ["notifications-unread-count", studentId],
        queryFn: () => getUnreadCountByStudent(studentId as string),
        enabled: Boolean(studentId),
        refetchInterval: POLL_INTERVAL_MS,
        refetchOnWindowFocus: true,
    });
}

export function useNotificationList(studentId: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: ["notifications", studentId],
        queryFn: () => getNotificationsByStudent(studentId as string),
        enabled: Boolean(studentId) && enabled,
    });
}

export function useMarkNotificationAsRead(studentId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => markNotificationAsReadById(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", studentId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", studentId] });
        },
    });
}

export function useMarkAllNotificationsAsRead(studentId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => markAllNotificationsAsReadByStudent(studentId as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", studentId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", studentId] });
        },
    });
}

function toUnifiedFromAccount(item: {
    id: string;
    title: string;
    body: string;
    type: AccountNotificationType;
    is_read: boolean;
    created_at: string;
}): UnifiedNotification {
    return {
        id: item.id,
        source: "account",
        title: item.title,
        message: item.body,
        isRead: item.is_read,
        createdAt: item.created_at,
        rawType: item.type,
    };
}

function toUnifiedFromStudent(item: AppNotification): UnifiedNotification {
    return {
        id: item.id,
        source: "student",
        title: item.title,
        message: item.message,
        isRead: item.isRead,
        createdAt: item.createdAt,
        rawType: item.type,
    };
}

export function useUnifiedNotifications(
    accountId: string | undefined,
    studentId: string | undefined,
    enabled: boolean
) {
    const accountQuery = useQuery({
        queryKey: ["notifications-account", accountId],
        queryFn: () => getMyNotifications(),
        enabled: Boolean(accountId) && enabled,
    });

    const studentQuery = useQuery({
        queryKey: ["notifications-student", studentId],
        queryFn: () => getNotificationsByStudent(studentId as string),
        enabled: Boolean(studentId) && enabled,
    });

    const merged: UnifiedNotification[] = [
        ...(accountQuery.data ?? []).map(toUnifiedFromAccount),
        ...(studentQuery.data ?? []).map(toUnifiedFromStudent),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
        data: merged,
        isLoading: accountQuery.isLoading || studentQuery.isLoading,
    };
}

export function useUnifiedUnreadCount(
    accountId: string | undefined,
    studentId: string | undefined
): number {
    const accountCountQuery = useQuery({
        queryKey: ["notifications-account-unread", accountId],
        queryFn: async () => {
            const list = await getMyNotifications();
            return list.filter((n) => !n.is_read).length;
        },
        enabled: Boolean(accountId),
        refetchInterval: POLL_INTERVAL_MS,
        refetchOnWindowFocus: true,
    });

    const studentCountQuery = useUnreadNotificationCount(studentId);

    return (accountCountQuery.data ?? 0) + (studentCountQuery.data ?? 0);
}

export function useMarkUnifiedAsRead(
    accountId: string | undefined,
    studentId: string | undefined
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (item: UnifiedNotification) => {
            if (item.source === "account") {
                return markMyNotificationAsRead(item.rawType as AccountNotificationType, item.id);
            }
            return markNotificationAsReadById(item.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications-account", accountId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-account-unread", accountId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-student", studentId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", studentId] });
        },
    });
}

export function useMarkAllUnifiedAsRead(
    accountId: string | undefined,
    studentId: string | undefined
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await Promise.all([
                accountId ? markAllMyNotificationsAsRead() : Promise.resolve(),
                studentId ? markAllNotificationsAsReadByStudent(studentId) : Promise.resolve(),
            ]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications-account", accountId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-account-unread", accountId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-student", studentId] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", studentId] });
        },
    });
}
