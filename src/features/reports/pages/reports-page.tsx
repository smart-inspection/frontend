import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ReportsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Informes</h1>
        <p className="text-sm text-slate-600">
          Gestión de borradores, generación y exportación de informes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Borradores e informes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Aquí mostraremos el flujo de generación, edición y exportación.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}