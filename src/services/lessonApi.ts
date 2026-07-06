import api from "./api.ts";

export const getLessonById = async (lessonId) => {
    const {data} = await api.get(`/lessons/${lessonId}`);
    return data;
};

export const getLessonsByTopic = async (topicId) => {
    const {data} = await api.get(`/topics/${topicId}/lessons`);
    return data;
};

export const summarizeLecture = async (lessonId) => {
    const {data} = await api.post(`/lessons/${lessonId}/summary`);
    return data;
};

export const regenerateLectureSummary = async (lessonId) => {
    const {data} = await api.put(`/lessons/${lessonId}/summary`);
    return data;
};

export const submitPractice = async (lessonId, payload) => {
    const {data} = await api.post(`/lessons/${lessonId}/submit`, payload);
    return data;
};