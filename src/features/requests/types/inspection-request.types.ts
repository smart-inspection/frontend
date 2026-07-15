export const service_type_options = [
    "Inspección técnica",
    "INSPECCIÓN VISUAL (VT) - PARTICULAS MAGNETICAS (MT)",
] as const

export const equipment_type_options = [
    "Semirremolque",
    "Tracto",
] as const

export type ServiceType = (typeof service_type_options)[number]
export type EquipmentType = (typeof equipment_type_options)[number]

export type InspectionRequestStatus = "pending" | "converted"

export type InspectionRequest = {
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

export type InspectionRequestCreateInput = {
    companyName: string
    contactName: string
    contactEmail: string | null
    contactPhone: string | null
    requestedDate: string | null
    location: string
    serviceType: ServiceType
    equipmentType: EquipmentType
    notes: string | null
    status?: InspectionRequestStatus
}

export type InspectionRequestFormValues = {
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

const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phone_pattern = /^\d{7,15}$/
const letters_pattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/
const malicious_pattern =
    /<\s*\/?\s*(script|iframe|object|embed|svg|img|style|link|meta)|javascript\s*:|on\w+\s*=|data\s*:\s*text\/html|eval\s*\(|document\.|window\./i

function has_valid_length(value: string, max_length: number): boolean {
    return value.trim().length <= max_length
}

function contains_malicious_content(value: string): boolean {
    return malicious_pattern.test(value)
}

function has_only_letters(value: string): boolean {
    return letters_pattern.test(value.trim())
}

export function validateInspectionRequestForm(
    values: InspectionRequestFormValues,
): InspectionRequestFormErrors {
    const errors: InspectionRequestFormErrors = {}
    const today = new Date().toISOString().slice(0, 10)

    if (!values.companyName.trim()) {
        errors.companyName = "La empresa es obligatoria."
    } else if (!has_only_letters(values.companyName)) {
        errors.companyName = "La empresa solo puede contener letras y espacios."
    } else if (contains_malicious_content(values.companyName)) {
        errors.companyName = "La empresa contiene caracteres no permitidos."
    } else if (!has_valid_length(values.companyName, 150)) {
        errors.companyName = "La empresa no puede superar los 150 caracteres."
    }

    if (!values.contactName.trim()) {
        errors.contactName = "El contacto es obligatorio."
    } else if (!has_only_letters(values.contactName)) {
        errors.contactName = "El contacto solo puede contener letras y espacios."
    } else if (contains_malicious_content(values.contactName)) {
        errors.contactName = "El contacto contiene caracteres no permitidos."
    } else if (!has_valid_length(values.contactName, 150)) {
        errors.contactName = "El contacto no puede superar los 150 caracteres."
    }

    if (values.contactEmail.trim() && !email_pattern.test(values.contactEmail.trim())) {
        errors.contactEmail = "Ingresa un correo electrónico válido."
    } else if (contains_malicious_content(values.contactEmail)) {
        errors.contactEmail = "El correo contiene caracteres no permitidos."
    } else if (!has_valid_length(values.contactEmail, 150)) {
        errors.contactEmail = "El correo no puede superar los 150 caracteres."
    }

    if (values.contactPhone.trim() && !phone_pattern.test(values.contactPhone.trim())) {
        errors.contactPhone = "El teléfono solo debe contener entre 7 y 15 números."
    }

    if (values.requestedDate && values.requestedDate < today) {
        errors.requestedDate = "La fecha solicitada no puede ser anterior a hoy."
    }

    if (!values.location.trim()) {
        errors.location = "La ubicación es obligatoria."
    } else if (contains_malicious_content(values.location)) {
        errors.location = "La ubicación contiene caracteres no permitidos."
    } else if (!has_valid_length(values.location, 200)) {
        errors.location = "La ubicación no puede superar los 200 caracteres."
    }

    if (!service_type_options.includes(values.serviceType as ServiceType)) {
        errors.serviceType = "Selecciona un tipo de servicio válido."
    }

    if (!equipment_type_options.includes(values.equipmentType as EquipmentType)) {
        errors.equipmentType = "Selecciona un tipo de equipo válido."
    }

    if (contains_malicious_content(values.notes)) {
        errors.notes = "Las notas contienen contenido no permitido."
    } else if (!has_valid_length(values.notes, 5000)) {
        errors.notes = "Las notas no pueden superar los 5000 caracteres."
    }

    return errors
}
