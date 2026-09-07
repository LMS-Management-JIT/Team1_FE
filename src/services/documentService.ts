import type {CourseDocument} from "../types/topic";
import {apiClient, asArray} from "./apiClient";

function normalizeDocument(raw: unknown, index: number): CourseDocument {
    const doc = raw as Partial<CourseDocument> & Record<string, unknown>;

    return {
        id: String(doc.id ?? doc.documentId ?? `doc-${index}`),
        documentName: String(
            doc.documentName ??
            doc.name ??
            doc.title ??
            `Document ${index + 1}`
        ),
        url: String(doc.url ?? doc.fileUrl ?? ""),
    };
}

export async function getCourseDocuments(
    moduleId?: string
): Promise<CourseDocument[]> {
    const endpoints = [
        ...(moduleId ? [`/documents/module/${encodeURIComponent(moduleId)}`] : []),
        "/documents",
    ];

    let raw: CourseDocument[] = [];

    for (const endpoint of endpoints) {
        const {data} = await apiClient.get(endpoint);
        raw = asArray<CourseDocument>(data);

        if (raw.length > 0) {
            break;
        }
    }

    return raw.map(normalizeDocument);
}