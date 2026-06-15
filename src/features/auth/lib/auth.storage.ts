const TOKEN_KEY = "smart_inspect_token"

export const auth_storage = {
    get_token(): string | null {
        return localStorage.getItem(TOKEN_KEY)
    },

    set_token(token: string): void {
        localStorage.setItem(TOKEN_KEY, token)
    },

    clear_token(): void {
        localStorage.removeItem(TOKEN_KEY)
    },

    is_authenticated(): boolean {
        return !!localStorage.getItem(TOKEN_KEY)
    },
}