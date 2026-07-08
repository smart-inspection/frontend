import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useCurrentUserQuery, useLoginMutation } from "../api/auth.queries"

const EMAIL_MAX_LENGTH = 100
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 50

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const MALICIOUS_PATTERN = /<\s*script|<\s*\/?\s*[a-z]+\s*>|javascript\s*:|on\w+\s*=/i

function contains_malicious_pattern(value: string): boolean {
    return MALICIOUS_PATTERN.test(value)
}

function validate_login(email: string, password: string): string | null {
    const trimmed_email = email.trim()
    const trimmed_password = password.trim()

    if (!trimmed_email || !trimmed_password) {
        return "Ingresa tu correo y contraseña."
    }

    if (contains_malicious_pattern(trimmed_email) || contains_malicious_pattern(trimmed_password)) {
        return "El texto ingresado contiene caracteres no permitidos."
    }

    if (trimmed_email.length > EMAIL_MAX_LENGTH) {
        return `El correo no debe superar los ${EMAIL_MAX_LENGTH} caracteres.`
    }

    if (!EMAIL_REGEX.test(trimmed_email)) {
        return "Ingresa un correo electrónico válido."
    }

    if (trimmed_password.length < PASSWORD_MIN_LENGTH) {
        return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
    }

    if (trimmed_password.length > PASSWORD_MAX_LENGTH) {
        return `La contraseña no debe superar los ${PASSWORD_MAX_LENGTH} caracteres.`
    }

    return null
}

export function LoginPage() {
    const navigate = useNavigate()
    const [email, set_email] = useState("")
    const [password, set_password] = useState("")
    const [form_error, set_form_error] = useState<string | null>(null)

    const { data: current_user } = useCurrentUserQuery()
    const login_mutation = useLoginMutation()

    useEffect(() => {
        if (current_user) {
            navigate("/", { replace: true })
        }
    }, [current_user, navigate])

    function handle_submit(event: React.FormEvent) {
        event.preventDefault()
        setFormErrorGuard()

        const validation_error = validate_login(email, password)
        if (validation_error) {
            set_form_error(validation_error)
            return
        }

        login_mutation.mutate(
            { email: email.trim(), password: password.trim() },
            {
                onSuccess: () => navigate("/", { replace: true }),
                onError: () =>
                    set_form_error("Credenciales incorrectas. Verifica tu correo y contraseña."),
            },
        )
    }

    function setFormErrorGuard() {
        set_form_error(null)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm space-y-4">
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Smart Inspect</h1>
                    <p className="text-sm text-muted-foreground">
                        Sistema web inteligente de inspecciones
                    </p>
                </div>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Iniciar sesión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handle_submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    maxLength={EMAIL_MAX_LENGTH}
                                    placeholder="correo@empresa.com"
                                    value={email}
                                    onChange={(e) => set_email(e.target.value)}
                                    disabled={login_mutation.isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    maxLength={PASSWORD_MAX_LENGTH}
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => set_password(e.target.value)}
                                    disabled={login_mutation.isPending}
                                />
                            </div>

                            {form_error ? (
                                <p className="text-sm text-destructive">{form_error}</p>
                            ) : null}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={login_mutation.isPending}
                            >
                                {login_mutation.isPending ? (
                                    "Ingresando..."
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Ingresar
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default LoginPage