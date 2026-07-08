import type { InspectionCreateInput } from "@/features/inspections/types/inspections.types"

export type CreateInspectionFormValues = Omit<InspectionCreateInput, "status">

export type CreateInspectionFormErrors = Partial<
    Record<keyof CreateInspectionFormValues, string>
>

export const createInspectionInitialValues: CreateInspectionFormValues = {
    code: "",
    client_name: "",
    equipment_type: "",
    inspection_type: "",
    inspection_date: "",
    location: "",
    requested_by: "",
    responsible_inspector: "",
}

export const CODE_MIN_LENGTH = 3
export const CODE_MAX_LENGTH = 30
export const CLIENT_NAME_MAX_LENGTH = 100
export const EQUIPMENT_TYPE_MAX_LENGTH = 60
export const INSPECTION_TYPE_MAX_LENGTH = 60
export const LOCATION_MAX_LENGTH = 100
export const REQUESTED_BY_MAX_LENGTH = 80
export const RESPONSIBLE_INSPECTOR_MAX_LENGTH = 80

export const INSPECTION_DATE_MIN_DAYS_BEFORE = 30
export const INSPECTION_DATE_MAX_DAYS_AFTER = 180

function get_date_bounds(): { min: string; max: string } {
    const today = new Date()
    const min_date = new Date(today)
    min_date.setDate(min_date.getDate() - INSPECTION_DATE_MIN_DAYS_BEFORE)
    const max_date = new Date(today)
    max_date.setDate(max_date.getDate() + INSPECTION_DATE_MAX_DAYS_AFTER)

    const to_iso = (d: Date) => d.toISOString().slice(0, 10)
    return { min: to_iso(min_date), max: to_iso(max_date) }
}

export const inspection_date_bounds = get_date_bounds()

const LETTERS_SPACES_DOTS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ.\s]+$/
const LETTERS_SPACES_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
const LETTERS_SPACES_COMMAS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ,\s]+$/
const CODE_REGEX = /^[A-Za-z0-9-]+$/
const MALICIOUS_PATTERN = /<\s*script|<\s*\/?\s*[a-z]+\s*>|javascript\s*:|on\w+\s*=/i

function has_malicious_pattern(value: string): boolean {
    return MALICIOUS_PATTERN.test(value)
}

export function validateCreateInspection(
    values: CreateInspectionFormValues,
): CreateInspectionFormErrors {
    const errors: CreateInspectionFormErrors = {}

    const code = values.code.trim()
    const client_name = values.client_name.trim()
    const equipment_type = values.equipment_type.trim()
    const inspection_type = values.inspection_type.trim()
    const inspection_date = values.inspection_date.trim()
    const location = values.location?.trim() ?? ""
    const requested_by = values.requested_by?.trim() ?? ""
    const responsible_inspector = values.responsible_inspector?.trim() ?? ""

    if (!code) {
        errors.code = "El código es obligatorio."
    } else if (has_malicious_pattern(code)) {
        errors.code = "El código contiene caracteres no permitidos."
    } else if (code.length < CODE_MIN_LENGTH || code.length > CODE_MAX_LENGTH) {
        errors.code = `El código debe tener entre ${CODE_MIN_LENGTH} y ${CODE_MAX_LENGTH} caracteres.`
    } else if (!CODE_REGEX.test(code)) {
        errors.code = "El código solo admite letras, números y guiones."
    }

    if (!client_name) {
        errors.client_name = "El cliente es obligatorio."
    } else if (has_malicious_pattern(client_name)) {
        errors.client_name = "El cliente contiene caracteres no permitidos."
    } else if (client_name.length < 2 || client_name.length > CLIENT_NAME_MAX_LENGTH) {
        errors.client_name = `El cliente debe tener entre 2 y ${CLIENT_NAME_MAX_LENGTH} caracteres.`
    } else if (!LETTERS_SPACES_DOTS_REGEX.test(client_name)) {
        errors.client_name = "El cliente solo admite letras, espacios y puntos."
    }

    if (!equipment_type) {
        errors.equipment_type = "El tipo de equipo es obligatorio."
    } else if (has_malicious_pattern(equipment_type)) {
        errors.equipment_type = "El tipo de equipo contiene caracteres no permitidos."
    } else if (equipment_type.length < 2 || equipment_type.length > EQUIPMENT_TYPE_MAX_LENGTH) {
        errors.equipment_type = `El tipo de equipo debe tener entre 2 y ${EQUIPMENT_TYPE_MAX_LENGTH} caracteres.`
    } else if (!LETTERS_SPACES_REGEX.test(equipment_type)) {
        errors.equipment_type = "El tipo de equipo solo admite letras y espacios."
    }

    if (!inspection_type) {
        errors.inspection_type = "El tipo de inspección es obligatorio."
    } else if (has_malicious_pattern(inspection_type)) {
        errors.inspection_type = "El tipo de inspección contiene caracteres no permitidos."
    } else if (
        inspection_type.length < 2 ||
        inspection_type.length > INSPECTION_TYPE_MAX_LENGTH
    ) {
        errors.inspection_type = `El tipo de inspección debe tener entre 2 y ${INSPECTION_TYPE_MAX_LENGTH} caracteres.`
    } else if (!LETTERS_SPACES_REGEX.test(inspection_type)) {
        errors.inspection_type = "El tipo de inspección solo admite letras y espacios."
    }

    if (!inspection_date) {
        errors.inspection_date = "La fecha de inspección es obligatoria."
    } else {
        const parsed_date = new Date(inspection_date)
        if (Number.isNaN(parsed_date.getTime())) {
            errors.inspection_date = "Ingresa una fecha válida."
        } else {
            const min_date = new Date(inspection_date_bounds.min)
            const max_date = new Date(inspection_date_bounds.max)
            if (parsed_date < min_date || parsed_date > max_date) {
                errors.inspection_date =
                    "La fecha debe estar dentro del rango permitido (no muy pasada ni muy futura)."
            }
        }
    }

    if (location) {
        if (has_malicious_pattern(location)) {
            errors.location = "La ubicación contiene caracteres no permitidos."
        } else if (location.length > LOCATION_MAX_LENGTH) {
            errors.location = `La ubicación no debe superar los ${LOCATION_MAX_LENGTH} caracteres.`
        } else if (!LETTERS_SPACES_COMMAS_REGEX.test(location)) {
            errors.location = "La ubicación solo admite letras, comas y espacios."
        }
    }

    if (requested_by) {
        if (has_malicious_pattern(requested_by)) {
            errors.requested_by = "Este campo contiene caracteres no permitidos."
        } else if (requested_by.length > REQUESTED_BY_MAX_LENGTH) {
            errors.requested_by = `Este campo no debe superar los ${REQUESTED_BY_MAX_LENGTH} caracteres.`
        } else if (!LETTERS_SPACES_REGEX.test(requested_by)) {
            errors.requested_by = "Este campo solo admite letras y espacios."
        }
    }

    if (responsible_inspector) {
        if (has_malicious_pattern(responsible_inspector)) {
            errors.responsible_inspector = "Este campo contiene caracteres no permitidos."
        } else if (responsible_inspector.length > RESPONSIBLE_INSPECTOR_MAX_LENGTH) {
            errors.responsible_inspector = `Este campo no debe superar los ${RESPONSIBLE_INSPECTOR_MAX_LENGTH} caracteres.`
        } else if (!LETTERS_SPACES_REGEX.test(responsible_inspector)) {
            errors.responsible_inspector = "Este campo solo admite letras y espacios."
        }
    }

    return errors
}