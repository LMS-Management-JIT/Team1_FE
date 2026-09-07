export interface LessonProgress {
    id: string;
    studentId: string;
    lessonId: string;
    progress: number;
    completed: boolean;
    lastPosition: number | null;
    completedAt: string | null;
}

export interface LessonProgressRequest {
    studentId: string;
    lessonId: string;
    progress: number;
    completed: boolean;
    lastPosition?: number | null;
}