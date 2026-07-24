export type NotificationType =
    | "XP_EARNED"
    | "RANK_UP"
    | "SUBMISSION_GRADED"
    | "CLASS_ADDED"
    | "LESSON_PUBLISHED"
    | "LESSON_REMINDER"
    | "AI_QUOTA_RESET"
    | "LESSON_COMPLETED";

export interface AppNotification {
    id: string;
    studentId: string;
    type: NotificationType;
    title: string;
    message: string;
    refId: string | null;
    isRead: boolean;
    createdAt: string;
}
