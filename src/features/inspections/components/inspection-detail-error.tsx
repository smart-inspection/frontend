import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function InspectionDetailError() {
    return (
        <section className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6">
            <Card className="border-destructive/30">
                <CardContent className="space-y-3 py-10 text-center">
                    <h1 className="text-lg font-semibold text-destructive">
                        No se pudo cargar el detalle de la inspección
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Verifica el identificador o la conexión con el backend.
                    </p>

                    <div className="flex justify-center">
                        <Button asChild variant="outline">
                            <Link to="/inspections">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a inspecciones
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}