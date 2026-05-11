import { useEffect, useState } from "react"
import { Languages, Save } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type {
    Evidence,
    Transcription,
    TranscriptionCreateInput,
} from "@/features/inspections/types/inspections.types"

type InspectionTranscriptionsTabProps = {
    evidences: Evidence[]
    transcriptions: Transcription[]
    isCreating: boolean
    savingTranscriptionId: number | null
    createError?: string | null
    updateError?: string | null
    onCreate: (
        payload: Omit<TranscriptionCreateInput, "inspection_id">,
    ) => Promise<void> | void
    onSave: (transcriptionId: number, finalText: string) => Promise<void> | void
}

export function InspectionTranscriptionsTab({
                                                evidences,
                                                transcriptions,
                                                isCreating,
                                                savingTranscriptionId,
                                                createError,
                                                updateError,
                                                onCreate,
                                                onSave,
                                            }: InspectionTranscriptionsTabProps) {
    const [sourcePath, setSourcePath] = useState("")
    const [language, setLanguage] = useState("es")
    const [modelName, setModelName] = useState("base")
    const [evidenceId, setEvidenceId] = useState("")
    const [draftTexts, setDraftTexts] = useState<Record<number, string>>({})

    useEffect(() => {
        const nextState = Object.fromEntries(
            transcriptions.map((item) => [
                item.id,
                item.final_text ?? item.raw_text ?? "",
            ]),
        )
        setDraftTexts(nextState)
    }, [transcriptions])

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!sourcePath.trim()) return

        await onCreate({
            source_file_path: sourcePath.trim(),
            language: language.trim() || null,
            model_name: modelName.trim() || "base",
            evidence_id: evidenceId.trim() ? Number(evidenceId) : null,
        })

        setSourcePath("")
        setEvidenceId("")
        setLanguage("es")
        setModelName("base")
    }

    return (
        <div className="space-y-5">
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Nueva transcripción
                    </CardTitle>
                    <CardDescription>
                        Registra una transcripción asociada a una evidencia o una fuente manual.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="source-path">Ruta fuente</Label>
                            <Input
                                id="source-path"
                                value={sourcePath}
                                onChange={(e) => setSourcePath(e.target.value)}
                                placeholder="/files/audio-inspection-001.wav"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence-id">ID de evidencia</Label>
                            <Input
                                id="evidence-id"
                                value={evidenceId}
                                onChange={(e) => setEvidenceId(e.target.value)}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="language">Idioma</Label>
                            <Input
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                placeholder="es"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="model-name">Modelo</Label>
                            <Input
                                id="model-name"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                placeholder="base"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-wrap gap-2">
                            {evidences.slice(0, 6).map((evidence) => (
                                <Button
                                    key={evidence.id}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEvidenceId(String(evidence.id))
                                        setSourcePath(evidence.file_path)
                                    }}
                                >
                                    Usar evidencia #{evidence.id}
                                </Button>
                            ))}
                        </div>

                        {createError ? (
                            <div className="md:col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                {createError}
                            </div>
                        ) : null}

                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" disabled={isCreating || !sourcePath.trim()}>
                                {isCreating ? "Registrando..." : "Crear transcripción"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {!transcriptions.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Aún no hay transcripciones registradas.
                    </CardContent>
                </Card>
            ) : null}

            <div className="space-y-4">
                {transcriptions.map((transcription) => {
                    const currentValue =
                        draftTexts[transcription.id] ??
                        transcription.final_text ??
                        transcription.raw_text ??
                        ""

                    return (
                        <Card key={transcription.id} className="border-border/60 shadow-sm">
                            <CardHeader className="space-y-3">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">
                                            Transcripción #{transcription.id}
                                        </CardTitle>
                                        <CardDescription>
                                            {transcription.source_file_path}
                                        </CardDescription>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={transcription.processed ? "default" : "outline"}>
                                            {transcription.processed ? "Procesada" : "Pendiente"}
                                        </Badge>
                                        <Badge variant="secondary">
                                            <Languages className="h-3 w-3" />
                                            {transcription.language || "Sin idioma"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="grid gap-4 xl:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Texto bruto</Label>
                                    <Textarea
                                        readOnly
                                        value={transcription.raw_text || ""}
                                        placeholder="El contenido bruto aparecerá aquí."
                                        className="min-h-36"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`transcription-final-${transcription.id}`}>
                                        Texto final editable
                                    </Label>
                                    <Textarea
                                        id={`transcription-final-${transcription.id}`}
                                        value={currentValue}
                                        onChange={(e) =>
                                            setDraftTexts((prev) => ({
                                                ...prev,
                                                [transcription.id]: e.target.value,
                                            }))
                                        }
                                        className="min-h-36"
                                    />
                                </div>

                                <div className="xl:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="grid gap-1 text-sm text-muted-foreground">
                                        <p>
                                            <span className="font-medium text-foreground">Modelo:</span>{" "}
                                            {transcription.model_name}
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground">Confianza:</span>{" "}
                                            {typeof transcription.confidence === "number"
                                                ? `${Math.round(transcription.confidence * 100)}%`
                                                : "Sin dato"}
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => onSave(transcription.id, currentValue)}
                                        disabled={savingTranscriptionId === transcription.id}
                                    >
                                        <Save className="h-4 w-4" />
                                        {savingTranscriptionId === transcription.id
                                            ? "Guardando..."
                                            : "Guardar edición"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {updateError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {updateError}
                </div>
            ) : null}
        </div>
    )
}