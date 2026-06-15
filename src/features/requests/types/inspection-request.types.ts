export type InspectionRequestStatus = "pending" | "converted"

export interface InspectionRequest {
    id: number
    companyName: string
    contactName: string
    contactEmail: string | null
    contactPhone: string | null
    requestedDate: string | null
    location: string
    serviceType: string | null
    equipmentType: string | null
    notes: string | null
    status: string
    inspectionId: number | null
    createdAt: string
    updatedAt: string
}

export interface InspectionRequestCreateInput {
    companyName: string
    contactName: string
    contactEmail?: string | null
    contactPhone?: string | null
    requestedDate?: string | null
    location: string
    serviceType?: string | null
    equipmentType?: string | null
    notes?: string | null
    status?: InspectionRequestStatus
}

export interface InspectionRequestFormValues {
    companyName: string
    contactName: string
    contactEmail: string
    contactPhone: string
    requestedDate: string
    location: string
    serviceType: string
    equipmentType: string
    notes: string
}

export type InspectionRequestFormErrors = Partial<
    Record<keyof InspectionRequestFormValues, string>
>

export const inspectionRequestInitialValues: InspectionRequestFormValues = {
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    requestedDate: "",
    location: "",
    serviceType: "",
    equipmentType: "",
    notes: "",
}

export function validateInspectionRequestForm(
    values: InspectionRequestFormValues,
): InspectionRequestFormErrors {
    const errors: InspectionRequestFormErrors = {}

    if (!values.companyName.trim()) {
        errors.companyName = "La empresa es obligatoria."
    }

    if (!values.contactName.trim()) {
        errors.contactName = "El contacto es obligatorio."
    }

    if (values.contactEmail.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(values.contactEmail.trim())) {
            errors.contactEmail = "Ingresa un correo válido."
        }
    }

    if (!values.location.trim()) {
        errors.location = "La ubicación es obligatoria."
    }

    return errors
}