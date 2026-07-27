import { useQuery } from "@tanstack/react-query";
import { getModuleById } from "../services/moduleService";

export function useModuleDetail(moduleId: string | null | undefined) {
    return useQuery({
        queryKey: ["module-detail", moduleId],
        queryFn: () => getModuleById(moduleId as string),
        enabled: Boolean(moduleId),
        staleTime: 5 * 60 * 1000,
    });
}
