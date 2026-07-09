export interface ModuleTopicResponse {
    id: string;
    moduleId: string;
    topicId: string;
    topicOrder: number;
    deleted: boolean;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}
