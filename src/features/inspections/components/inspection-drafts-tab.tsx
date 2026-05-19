import { useEffect, useState } from "react"
import { Bot, Download, FileText, Save, Sparkles } from "lucide-react"

import { getExportDocxUrl, getExportPdfUrl } from "@/features/inspections/api/inspections.api"
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

import {
    formatInspectionDate,
    formatInspectionStatus,
    getInspectionStatusVariant,
} from "@/features/inspections/types/inspections.utils"
import type { ReportDraft } from "@/features/inspections/types/inspections.types"

type InspectionDraftsTabProps = {
    drafts: ReportDraft[]
    isGenerating: boolean
    isGeneratingLlm: boolean
    savingDraftId: number | null
    generateError?: string | null
    saveError?: string | null
    onGenerate: (templateVersion?: string) => Promise<void> | void
    onGenerateLlm: (templateVersion?: string) => Promise<void> | void
    onSave: (draftId: number, editedText: string) => Promise<void> | void
}

export function InspectionDraftsTab({
                                        drafts,
                                        isGenerating,
                                        isGeneratingLlm,
                                        savingDraftId,
                                        generateError,
                                        saveError,
                                        onGenerate,
                                        onGenerateLlm,
                                        onSave,
                                    }: InspectionDraftsTabProps) {
    const [templateVersion, setTemplateVersion] = useState("v1")
    const [llmTemplateVersion, setLlmTemplateVersion] = useState("llama3-v1")
    const [editedTexts, setEditedTexts] = useState<Record<number, string>>({})

    useEffect(() => {
        const nextState = Object.fromEntries(
            drafts.map((draft) => [
                draft.id,
                draft.edited_text ?? draft.generated_text ?? "",
            ]),
        )
        setEditedTexts(nextState)
    }, [drafts])

    return (
        <div className="space-y-5">
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Generación de borradores
                    </CardTitle>
                    <CardDescription>
                        Crea borradores tradicionales o con LLM y luego edítalos antes de exportar.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-xl border bg-muted/20 p-4">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="template-version">Template clásico</Label>
                                <Input
                                    id="template-version"
                                    value={templateVersion}
                                    onChange={(e) => setTemplateVersion(e.target.value)}
                                    placeholder="v1"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={() => onGenerate(templateVersion)}
                                disabled={isGenerating}
                                className="w-full"
                            >
                                <Sparkles className="h-4 w-4" />
                                {isGenerating ? "Generando..." : "Generar borrador"}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-4">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="llm-template-version">Template LLM</Label>
                                <Input
                                    id="llm-template-version"
                                    value={llmTemplateVersion}
                                    onChange={(e) => setLlmTemplateVersion(e.target.value)}
                                    placeholder="llama3-v1"
                                />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onGenerateLlm(llmTemplateVersion)}
                                disabled={isGeneratingLlm}
                                className="w-full"
                            >
                                <Bot className="h-4 w-4" />
                                {isGeneratingLlm ? "Generando con LLM..." : "Generar con LLM"}
                            </Button>
                        </div>
                    </div>

                    {generateError ? (
                        <div className="xl:col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                            {generateError}
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {!drafts.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Todavía no hay borradores generados para esta inspección.
                    </CardContent>
                </Card>
            ) : null}

            <div className="space-y-4">
                {drafts.map((draft) => {
                    const currentText =
                        editedTexts[draft.id] ??
                        draft.edited_text ??
                        draft.generated_text ??
                        ""

                    return (
                        <Card key={draft.id} className="border-border/60 shadow-sm">
                            <CardHeader className="space-y-3">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">{draft.title}</CardTitle>
                                        <CardDescription>
                                            {draft.template_version} · {formatInspectionDate(draft.created_at)}
                                        </CardDescription>
                                    </div>

                                    <Badge variant={getInspectionStatusVariant(draft.status)}>
                                        {formatInspectionStatus(draft.status)}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid gap-4 xl:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Texto generado</Label>
                                        <Textarea
                                            readOnly
                                            value={draft.generated_text || ""}
                                            className="min-h-48"
                                            placeholder="El contenido generado aparecerá aquí."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`draft-edited-${draft.id}`}>
                                            Texto editable
                                        </Label>
                                        <Textarea
                                            id={`draft-edited-${draft.id}`}
                                            value={currentText}
                                            onChange={(e) =>
                                                setEditedTexts((prev) => ({
                                                    ...prev,
                                                    [draft.id]: e.target.value,
                                                }))
                                            }
                                            className="min-h-48"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                    <p>
                                        <span className="font-medium text-foreground">Tiempo generación:</span>{" "}
                                        {typeof draft.generation_time_ms === "number"
                                            ? `${draft.generation_time_ms} ms`
                                            : "Sin dato"}
                                    </p>
                                    <p>
                                        <span className="font-medium text-foreground">ID borrador:</span>{" "}
                                        {draft.id}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => onSave(draft.id, currentText)}
                                        disabled={savingDraftId === draft.id}
                                    >
                                        <Save className="h-4 w-4" />
                                        {savingDraftId === draft.id
                                            ? "Guardando..."
                                            : "Guardar edición"}
                                    </Button>

                                    <Button asChild variant="outline">
                                        <a
                                            href={getExportPdfUrl(draft.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="h-4 w-4" />
                                            Exportar PDF
                                        </a>
                                    </Button>

                                    <Button asChild variant="outline">
                                        <a
                                            href={getExportDocxUrl(draft.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Download className="h-4 w-4" />
                                            Exportar DOCX
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {saveError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {saveError}
                </div>
            ) : null}
        </div>
    )
}