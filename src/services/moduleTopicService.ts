import {apiClient} from "./apiClient";
import type {ModuleTopicResponse} from "../types/moduleTopic";

// Dùng để suy ra moduleId từ topicId hiện tại (phục vụ nối breadcrumb / nút quay lại
// từ trang Lesson Detail về đúng trang danh sách chương của module chứa topic đó).
export async function getModuleTopicsByTopic(topicId: string): Promise<ModuleTopicResponse[]> {
    const {data} = await apiClient.get<ModuleTopicResponse[]>(`/module-topics/topic/${topicId}`);
    return data;
}
