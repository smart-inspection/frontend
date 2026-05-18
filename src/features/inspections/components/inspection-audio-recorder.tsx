import { useRef, useState } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type AudioRecorderButtonProps = {
    disabled?: boolean
    onRecorded: (blob: Blob) => Promise<void> | void
}

export function AudioRecorderButton({
    disabled,
    onRecorded,
}: AudioRecorderButtonProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<BlobPart[]>([])

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)

        chunksRef.current = []
        streamRef.current = stream
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunksRef.current.push(event.data)
        }

        recorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })

            try {
                setIsProcessing(true)
                await onRecorded(blob)
            } finally {
                setIsProcessing(false)
                streamRef.current?.getTracks().forEach((track) => track.stop())
                streamRef.current = null
                mediaRecorderRef.current = null
                chunksRef.current = []
            }
        }

        recorder.start()
        setIsRecording(true)
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        setIsRecording(false)
    }

    return (
        <Button
            type="button"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing}
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
                <Square className="h-4 w-4" />
            ) : (
                <Mic className="h-4 w-4" />
            )}

            {isProcessing
                ? "Procesando audio..."
                : isRecording
                    ? "Detener grabación"
                    : "Hablar por micrófono"}
        </Button>
    )
}