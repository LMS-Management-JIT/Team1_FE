export type LessonType =
    | "READING"
    | "LECTURE"
    | "PRACTICE"
    | string;


export interface Lesson {
    id: string;
    lessonName: string;
    type: LessonType;
    meta?: string;
}

export interface TopicSummary {
    id?: string;
    topicId?: string;
    topicName: string;
}

export interface TopicWithLessons {
    id?: string;
    topicId?: string;

    topicName: string;

    lessons: Lesson[];
}


export interface CourseDocument {
    id: string;
    documentName: string;
    url: string;
}