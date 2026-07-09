import {useQuery} from "@tanstack/react-query";
import {getModuleTopicsByTopic} from "../services/moduleTopicService";

export function useModuleIdForTopic(topicId: string | undefined) {
    return useQuery({
        queryKey: ["module-id-for-topic", topicId],
        queryFn: async () => {
            const relations = await getModuleTopicsByTopic(topicId as string);
            const active = relations.find((r) => !r.deleted) ?? relations[0];
            return active?.moduleId ?? null;
        },
        enabled: Boolean(topicId),
        staleTime: 5 * 60 * 1000,
    });
}
