import { useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Square } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AudioRecorderButtonProps = {
    disabled?: boolean
    onRecorded: (blob: Blob) => Promise<void> | void
}

const PREFERRED_MIME_TYPES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
]

function getSupportedMimeType() {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
        return ''
    }

    if (typeof MediaRecorder.isTypeSupported !== 'function') {
        return ''
    }

    return PREFERRED_MIME_TYPES.find((value) => MediaRecorder.isTypeSupported(value)) ?? ''
}

export function AudioRecorderButton({
                                        disabled = false,
                                        onRecorded,
                                    }: AudioRecorderButtonProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<BlobPart[]>([])
    const mimeTypeRef = useRef('')

    const cleanupMedia = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        mediaRecorderRef.current = null
    }

    useEffect(() => {
        return () => {
            cleanupMedia()
        }
    }, [])

    const startRecording = async () => {
        if (disabled || isProcessing || isRecording) return

        if (
            typeof navigator === 'undefined' ||
            !navigator.mediaDevices ||
            typeof navigator.mediaDevices.getUserMedia !== 'function'
        ) {
            setErrorMessage('Este navegador no permite grabar audio desde el micrófono.')
            return
        }

        if (typeof MediaRecorder === 'undefined') {
            setErrorMessage('La grabación de audio no está disponible en este dispositivo.')
            return
        }

        try {
            setErrorMessage(null)
            chunksRef.current = []

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            })

            const mimeType = getSupportedMimeType()
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream)

            streamRef.current = stream
            mediaRecorderRef.current = recorder
            mimeTypeRef.current = recorder.mimeType || mimeType || 'audio/webm'

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            recorder.onerror = () => {
                setErrorMessage('Ocurrió un problema al grabar el audio.')
                setIsRecording(false)
                cleanupMedia()
            }

            recorder.onstop = async () => {
                try {
                    const blob = new Blob(chunksRef.current, {
                        type: mimeTypeRef.current || 'audio/webm',
                    })

                    if (!blob.size) {
                        setErrorMessage('No se pudo capturar audio válido desde el micrófono.')
                        return
                    }

                    setIsProcessing(true)
                    await onRecorded(blob)
                } catch (error) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : 'No se pudo procesar el audio grabado.',
                    )
                } finally {
                    setIsProcessing(false)
                    setIsRecording(false)
                    chunksRef.current = []
                    cleanupMedia()
                }
            }

            recorder.start(250)
            setIsRecording(true)
        } catch (error) {
            setIsRecording(false)
            cleanupMedia()
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'No se pudo acceder al micrófono.',
            )
        }
    }

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current

        if (!recorder || recorder.state === 'inactive') {
            setIsRecording(false)
            cleanupMedia()
            return
        }

        try {
            recorder.requestData()
        } catch {
            // noop
        }

        recorder.stop()
        setIsRecording(false)
    }

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant={isRecording ? 'destructive' : 'default'}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || isProcessing}
                className="w-full sm:w-auto"
            >
                {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                    <Square className="h-4 w-4" />
                ) : (
                    <Mic className="h-4 w-4" />
                )}

                {isProcessing
                    ? 'Procesando audio...'
                    : isRecording
                        ? 'Detener grabación'
                        : 'Grabar desde micrófono'}
            </Button>

            {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
        </div>
    )
}