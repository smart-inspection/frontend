import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { get_current_user, login } from "./auth.api"
import { auth_keys } from "./auth.keys"
import { auth_storage } from "../lib/auth.storage"
import type { LoginInput } from "../types/auth.types"

export function useCurrentUserQuery() {
    return useQuery({
        queryKey: auth_keys.current_user(),
        queryFn: get_current_user,
        enabled: auth_storage.is_authenticated(),
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 min
    })
}

export function useLoginMutation() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: (payload: LoginInput) => login(payload),
        onSuccess: (data) => {
            auth_storage.set_token(data.access_token)
            void query_client.invalidateQueries({ queryKey: auth_keys.all })
        },
    })
}

export function useLogoutMutation() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            auth_storage.clear_token()
        },
        onSuccess: () => {
            query_client.removeQueries({ queryKey: auth_keys.all })
            query_client.clear()
        },
    })
}