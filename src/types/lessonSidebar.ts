import type {Lesson} from "./lesson";

export interface LessonSidebarData {
    moduleName: string;
    topicName: string;
    completedLessons: number;
    totalLessons: number;
    lessons: Lesson[];
}