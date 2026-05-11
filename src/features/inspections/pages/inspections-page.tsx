import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InspectionsPage() {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Inspecciones</h1>
                    <p className="text-sm text-slate-600">
                        Gestiona los registros de inspección del sistema.
                    </p>
                </div>

                <Button>Nueva inspección</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Lista de inspecciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600">
                        Aquí mostraremos la tabla de inspecciones conectada al backend.
                    </p>
                </CardContent>
            </Card>
        </section>
    )
}