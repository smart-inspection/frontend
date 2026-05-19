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

export function validateCreateInspection(
    values: CreateInspectionFormValues,
): CreateInspectionFormErrors {
    const errors: CreateInspectionFormErrors = {}

    if (!values.code.trim()) {
        errors.code = "El código es obligatorio."
    }

    if (!values.client_name.trim()) {
        errors.client_name = "El cliente es obligatorio."
    }

    if (!values.equipment_type.trim()) {
        errors.equipment_type = "El tipo de equipo es obligatorio."
    }

    if (!values.inspection_type.trim()) {
        errors.inspection_type = "El tipo de inspección es obligatorio."
    }

    if (!values.inspection_date.trim()) {
        errors.inspection_date = "La fecha de inspección es obligatoria."
    }

    return errors
}