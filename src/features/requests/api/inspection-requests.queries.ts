import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    createInspectionRequest,
    getInspectionRequests,
} from "./inspection-requests.api"
import { inspectionRequestsKeys } from "./inspection-requests.keys"

export function useInspectionRequestsQuery() {
    return useQuery({
        queryKey: inspectionRequestsKeys.list,
        queryFn: getInspectionRequests,
    })
}

export function useCreateInspectionRequestMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createInspectionRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: inspectionRequestsKeys.list,
            })
        },
    })
}