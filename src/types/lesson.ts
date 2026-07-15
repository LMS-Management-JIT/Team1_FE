export type LessonType = "READING" | "LECTURE" | "PRACTICE" | "QUIZ";

export interface Lesson {
    id: string;
    lessonName: string;
    type: LessonType;
    lessonOrder: number;
    published: boolean;
    content: string | null;
    videoUrl: string | null;
    duration: number | null;
    description: string | null;
    starterCode: string | null;
    language: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LessonSummary {
    id: string;
    lessonName: string;
    type: LessonType;
    lessonOrder: number;
    duration: number | null;
    published: boolean;
}