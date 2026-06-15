import { apiGet, apiPost, apiPatch } from "@/lib/api"

import type {
    InspectionRequest,
    InspectionRequestCreateInput,
} from "../types/inspection-request.types"

function asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback
}

function asNullableString(value: unknown): string | null {
    return typeof value === "string" ? value : null
}

function asNumber(value: unknown, fallback = 0): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
    return values.find((value) => value !== undefined && value !== null)
}

function mapInspectionRequest(raw: any): InspectionRequest {
    const inspectionIdValue = pickFirst(raw?.inspectionId, raw?.inspectionid)

    return {
        id: asNumber(raw?.id),
        companyName: asString(pickFirst(raw?.companyName, raw?.company_name)),
        contactName: asString(pickFirst(raw?.contactName, raw?.contact_name)),
        contactEmail: asNullableString(
            pickFirst(raw?.contactEmail, raw?.contact_email),
        ),
        contactPhone: asNullableString(
            pickFirst(raw?.contactPhone, raw?.contact_phone),
        ),
        requestedDate: asNullableString(
            pickFirst(raw?.requestedDate, raw?.requested_date),
        ),
        location: asString(raw?.location),
        serviceType: asNullableString(
            pickFirst(raw?.serviceType, raw?.service_type),
        ),
        equipmentType: asNullableString(
            pickFirst(raw?.equipmentType, raw?.equipment_type),
        ),
        notes: asNullableString(raw?.notes),
        status: asString(raw?.status, "pending"),
        inspectionId:
            typeof inspectionIdValue === "number" && Number.isFinite(inspectionIdValue)
                ? inspectionIdValue
                : null,
        createdAt: asString(pickFirst(raw?.createdAt, raw?.created_at)),
        updatedAt: asString(pickFirst(raw?.updatedAt, raw?.updated_at)),
    }
}

function toApiPayload(payload: InspectionRequestCreateInput) {
    return {
        company_name: payload.companyName.trim(),
        contact_name: payload.contactName.trim(),
        contact_email: payload.contactEmail?.trim() || null,
        contact_phone: payload.contactPhone?.trim() || null,
        requested_date: payload.requestedDate || null,
        location: payload.location.trim(),
        service_type: payload.serviceType?.trim() || null,
        equipment_type: payload.equipmentType?.trim() || null,
        notes: payload.notes?.trim() || null,
        status: payload.status ?? "pending",
    }
}

export async function createInspectionRequest(
    payload: InspectionRequestCreateInput,
): Promise<InspectionRequest> {
    const response = await apiPost<any>("/inspection-requests", toApiPayload(payload))
    return mapInspectionRequest(response)
}

export async function getInspectionRequests(): Promise<InspectionRequest[]> {
    const response = await apiGet<any>("/inspection-requests")
    return Array.isArray(response) ? response.map(mapInspectionRequest) : []
}

export async function convertInspectionRequest(
    inspectionRequestId: number,
    payload: { inspection_id: number; status?: string },
): Promise<InspectionRequest> {
    const response = await apiPatch<any>(
        `/inspection-requests/${inspectionRequestId}/convert`,
        {
            inspection_id: payload.inspection_id,
            status: payload.status ?? "converted",
        },
    )

    return mapInspectionRequest(response)
}