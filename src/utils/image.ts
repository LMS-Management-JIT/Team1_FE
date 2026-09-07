export const fallbackCourseImage =
    "https://placehold.co/600x360?text=Course";

export const fallbackAvatarImage =
    "https://placehold.co/200x200?text=Avatar";

export function getImageUrl(
    url?: string | null,
    fallback = fallbackCourseImage,
) {
    if (!url || url.trim().length === 0) {
        return fallback;
    }

    return url;
}