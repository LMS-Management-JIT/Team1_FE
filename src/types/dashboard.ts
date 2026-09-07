export interface DashboardCourse {
    id: string;
    courseName: string;
    description: string;
    thumbnailUrl?: string | null;
}

export interface DashboardCourseProgress {
    courseId: string;
    courseName: string;
    description: string;
    thumbnailUrl?: string | null;
    progress: number;
    totalLessons: number;
    completedLessons: number;
}

export interface DashboardTeacher {
    id: string;
    accountId: string;
    profileId: string;
    fullName: string;
    phoneNumber?: string;
    gender?: string;
    address?: string;
    specialization?: string;
    qualification?: string;
    certifications?: string;
    available?: boolean;
}