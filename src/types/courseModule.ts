export interface CourseModuleResponse {
    id: string;
    courseId: string;
    moduleId: string;
    deleted: boolean;
    createdBy?: string | null;
    updatedBy?: string | null;
    createDate?: string | null;
    updateDate?: string | null;
}
