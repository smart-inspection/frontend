import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EvidencesPage() {
    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Evidencias</h1>
                <p className="text-sm text-slate-600">
                    Carga, visualización y procesamiento OCR de evidencias.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Módulo de evidencias</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600">
                        Aquí mostraremos carga de imágenes, preview y OCR por evidencia.
                    </p>
                </CardContent>
            </Card>
        </section>
    )
}