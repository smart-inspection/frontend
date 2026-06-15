import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    convertInspectionRequest,
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
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: inspectionRequestsKeys.list,
            })
        },
    })
}

export function useConvertInspectionRequestMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
                         inspectionRequestId,
                         payload,
                     }: {
            inspectionRequestId: number
            payload: { inspection_id: number; status?: string }
        }) => convertInspectionRequest(inspectionRequestId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: inspectionRequestsKeys.list,
            })
        },
    })
}