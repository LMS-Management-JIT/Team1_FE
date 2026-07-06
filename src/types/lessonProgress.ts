export interface LessonProgress {
    id: string;
    accountId: string;
    lessonId: string;
    completed: boolean;
    progress: number;
    lastAccessed?: string;
}