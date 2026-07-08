import {useQuery} from "@tanstack/react-query";
import {getTopicDetail} from "../services/topic.service";

export function useTopicDetail(topicId: string | undefined) {
    return useQuery({
        queryKey: ["topic", topicId],
        queryFn: () => getTopicDetail(topicId as string),
        enabled: Boolean(topicId),
    });
}