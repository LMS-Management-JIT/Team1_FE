export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

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
            (envelope.topics as T[] | undefined) ??
            (envelope.lessons as T[] | undefined) ??
            (envelope.documents as T[] | undefined) ??
            (envelope.content as T[] | undefined) ??
            (envelope.data as T[] | undefined) ??
            []
        );
    }

    return [];
}

export async function fetchJson<T>(urls: string[]): Promise<T> {
    let lastError: unknown;

    for (const url of urls) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(url, {
                headers: { Accept: "application/json" },
                signal: controller.signal,
            });

            if (!response.ok) {
                lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
                continue;
            }

            return (await response.json()) as T;
        } catch (error) {
            lastError = error;
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    throw lastError instanceof Error ? lastError : new Error("Failed to fetch API data");
}
