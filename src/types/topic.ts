export interface Lesson {
  id: string;
  title: string;
  meta: string;
  type: string;
  status: "completed" | "current" | "upcoming";
}

export interface Topic {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseDocument {
  id: string;
  title: string;
  url: string;
}
