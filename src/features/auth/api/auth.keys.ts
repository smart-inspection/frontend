export const auth_keys = {
    all: ["auth"] as const,
    current_user: () => [...auth_keys.all, "me"] as const,
}