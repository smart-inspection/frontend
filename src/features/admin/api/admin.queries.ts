import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { create_user, get_users, update_user } from "./admin.api"
import { admin_keys } from "./admin.keys"
import type { AdminUserCreateInput, AdminUserUpdateInput } from "../types/admin.types"

export function useAdminUsersQuery() {
    return useQuery({
        queryKey: admin_keys.users(),
        queryFn: get_users,
    })
}

export function useCreateUserMutation() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: (payload: AdminUserCreateInput) => create_user(payload),
        onSuccess: () => {
            void query_client.invalidateQueries({ queryKey: admin_keys.users() })
        },
    })
}

export function useUpdateUserMutation() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: ({ user_id, payload }: { user_id: number; payload: AdminUserUpdateInput }) =>
            update_user(user_id, payload),
        onSuccess: () => {
            void query_client.invalidateQueries({ queryKey: admin_keys.users() })
        },
    })
}