import {useQuery} from "@tanstack/react-query";
import {getTopicDetail} from "../services/topicLessonService.ts";

export function useTopicDetail(topicId: string | undefined, enabled: boolean = true) {
    return useQuery({
        queryKey: ["topic", topicId],
        queryFn: () => getTopicDetail(topicId as string),
        enabled: Boolean(topicId) && enabled,
    });
}
