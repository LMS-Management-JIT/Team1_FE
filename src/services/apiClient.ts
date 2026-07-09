import axios from "axios";

console.log(import.meta.env.VITE_API_BASE_URL);
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export type ApiListEnvelope<T> = {
    data?: T;
    documents?: T;
    lessons?: T;
    topics?: T;
    content?: T;
};

export function asArray<T>(value: T[] | ApiListEnvelope<T> | unknown): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === "object") {
        const envelope = value as ApiListEnvelope<T>;

        return (
            (envelope.data as T[] | undefined) ??
            (envelope.documents as T[] | undefined) ??
            (envelope.lessons as T[] | undefined) ??
            (envelope.topics as T[] | undefined) ??
            (envelope.content as T[] | undefined) ??
            []
        );
    }

    return [];
}