import type { CourseDocument } from "../types/topic";
import { API_BASE_URL, asArray, fetchJson, type ApiListEnvelope } from "./apiClient.ts";

function normalizeDocument(raw: unknown, index: number): CourseDocument {
    const doc = raw as Partial<CourseDocument> & Record<string, unknown>;

    return {
        id: String(doc.id ?? doc.documentId ?? `doc-${index}`),
        documentName: String(doc.documentName ?? doc.name ?? doc.title ?? `Document ${index + 1}`),
        url: String(doc.url ?? doc.fileUrl ?? ""),
    };
}

export async function getCourseDocuments(moduleId?: string): Promise<CourseDocument[]> {
    const urls = [
        ...(moduleId ? [`${API_BASE_URL}/documents/module/${encodeURIComponent(moduleId)}`] : []),
        `${API_BASE_URL}/documents`,
    ];

    const data = await fetchJson<CourseDocument[] | ApiListEnvelope<CourseDocument>>(urls);
    const raw = asArray<CourseDocument>(data);

    return raw.map(normalizeDocument);
}