export const admin_keys = {
    all: ["admin"] as const,
    users: () => [...admin_keys.all, "users"] as const,
    user: (id: number) => [...admin_keys.all, "users", id] as const,
}