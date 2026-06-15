import axios from "axios"

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "")

const is_ngrok_url =
    API_BASE_URL.includes(".ngrok-free.dev") ||
    API_BASE_URL.includes(".ngrok.io") ||
    API_BASE_URL.includes(".ngrok.app")

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: is_ngrok_url ? { "ngrok-skip-browser-warning": "true" } : {},
})