import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLoginMutation, useCurrentUserQuery } from "../api/auth.queries"

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
        set_form_error(null)

        if (!email.trim() || !password.trim()) {
            set_form_error("Ingresa tu correo y contraseña.")
            return
        }

        login_mutation.mutate(
            { email: email.trim(), password },
            {
                onSuccess: () => navigate("/", { replace: true }),
                onError: () =>
                    set_form_error("Credenciales incorrectas. Verifica tu correo y contraseña."),
            },
        )
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
                                    placeholder="••••••••"
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