import type {LessonSummary} from "./lesson.ts";

export interface TopicSummary {
    id: string;
    topicName: string;
}

export interface TopicWithLessons extends TopicSummary {
    courseName?: string; // Backend chưa expose field này, tạm optional
    lessons: LessonSummary[];
}