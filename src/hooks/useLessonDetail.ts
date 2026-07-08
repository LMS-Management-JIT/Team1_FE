import {useQuery} from "@tanstack/react-query";
import {getLessonById} from "../services/lessonService.ts";

export function useLessonDetail(lessonId: string | undefined) {
    return useQuery({
        queryKey: ["lesson", lessonId],
        queryFn: () => getLessonById(lessonId as string),
        enabled: Boolean(lessonId),
    });
}