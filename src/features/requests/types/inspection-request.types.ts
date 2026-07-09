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

export const INSPECTION_REQUEST_MAX_LENGTHS = {
    companyName: 150,
    contactName: 100,
    contactEmail: 150,
    contactPhone: 20,
    location: 200,
    serviceType: 100,
    equipmentType: 100,
    notes: 500,
} as const;

export const PHONE_NUMERIC_REGEX = /^[0-9]*$/;

export const NO_SCRIPT_PATTERN = /<script|<\/script|javascript:|on\w+\s*=|<iframe|<img/i;

export const inspectionRequestInitialValues: InspectionRequestFormValues = {
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    requestedDate: '',
    location: '',
    serviceType: '',
    equipmentType: '',
    notes: '',
};

function hasScriptInjection(value: string): boolean {
    return NO_SCRIPT_PATTERN.test(value);
}

export function validateInspectionRequestForm(
    values: InspectionRequestFormValues,
): InspectionRequestFormErrors {
    const errors: InspectionRequestFormErrors = {};

    if (!values.companyName.trim()) {
        errors.companyName = 'La empresa es obligatoria.';
    } else if (values.companyName.length > INSPECTION_REQUEST_MAX_LENGTHS.companyName) {
        errors.companyName = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.companyName} caracteres.`;
    } else if (hasScriptInjection(values.companyName)) {
        errors.companyName = 'El texto contiene caracteres no permitidos.';
    }

    if (!values.contactName.trim()) {
        errors.contactName = 'El contacto es obligatorio.';
    } else if (values.contactName.length > INSPECTION_REQUEST_MAX_LENGTHS.contactName) {
        errors.contactName = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.contactName} caracteres.`;
    } else if (hasScriptInjection(values.contactName)) {
        errors.contactName = 'El texto contiene caracteres no permitidos.';
    }

    if (values.contactEmail.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (values.contactEmail.length > INSPECTION_REQUEST_MAX_LENGTHS.contactEmail) {
            errors.contactEmail = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.contactEmail} caracteres.`;
        } else if (!emailPattern.test(values.contactEmail.trim())) {
            errors.contactEmail = 'Ingresa un correo válido.';
        }
    }

    if (values.contactPhone.trim()) {
        if (!PHONE_NUMERIC_REGEX.test(values.contactPhone.trim())) {
            errors.contactPhone = 'El teléfono solo debe contener números.';
        } else if (values.contactPhone.length > INSPECTION_REQUEST_MAX_LENGTHS.contactPhone) {
            errors.contactPhone = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.contactPhone} dígitos.`;
        }
    }

    if (!values.location.trim()) {
        errors.location = 'La ubicación es obligatoria.';
    } else if (values.location.length > INSPECTION_REQUEST_MAX_LENGTHS.location) {
        errors.location = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.location} caracteres.`;
    } else if (hasScriptInjection(values.location)) {
        errors.location = 'El texto contiene caracteres no permitidos.';
    }

    if (values.serviceType.length > INSPECTION_REQUEST_MAX_LENGTHS.serviceType) {
        errors.serviceType = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.serviceType} caracteres.`;
    } else if (hasScriptInjection(values.serviceType)) {
        errors.serviceType = 'El texto contiene caracteres no permitidos.';
    }

    if (values.equipmentType.length > INSPECTION_REQUEST_MAX_LENGTHS.equipmentType) {
        errors.equipmentType = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.equipmentType} caracteres.`;
    } else if (hasScriptInjection(values.equipmentType)) {
        errors.equipmentType = 'El texto contiene caracteres no permitidos.';
    }

    if (values.notes.length > INSPECTION_REQUEST_MAX_LENGTHS.notes) {
        errors.notes = `Máximo ${INSPECTION_REQUEST_MAX_LENGTHS.notes} caracteres.`;
    } else if (hasScriptInjection(values.notes)) {
        errors.notes = 'El texto contiene caracteres no permitidos.';
    }

    return errors;
}