export const LessonType = {
    READING: "READING",
    LECTURE: "LECTURE",
    PRACTICE: "PRACTICE",
} as const;

export type LessonType = (typeof LessonType)[keyof typeof LessonType];

export interface Lesson {
    id: string;
    topicId: string;
    lessonName: string;
    lessonOrder: number;
    published: boolean;

    content: string;
    videoUrl?: string;
    imageUrl?: string;

    duration: number;
    description: string;

    starterCode?: string;
    language?: string;

    type: LessonType;

    deleted: boolean;

    createdBy?: string;
    updatedBy?: string;

    createdAt?: string;
    updatedAt?: string;
}