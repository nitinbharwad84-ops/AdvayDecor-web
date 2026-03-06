/**
 * Shiprocket API Helper
 * ---------------------
 * Centralised helper for Shiprocket REST API v1.
 * Handles authentication (JWT token caching), rate calculation,
 * pincode serviceability, order creation, and tracking.
 *
 * Requires env vars:
 *   SHIPROCKET_EMAIL
 *   SHIPROCKET_PASSWORD
 */

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

// In-memory token cache (valid for ~10 days in Shiprocket, we refresh every 8h)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// ----- Auth -----

async function getToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set in .env');
    }

    const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Shiprocket auth failed: ${err}`);
    }

    const data = await res.json();
    cachedToken = data.token;
    // Refresh after 8 hours
    tokenExpiry = Date.now() + 8 * 60 * 60 * 1000;
    return cachedToken!;
}

async function shiprocketFetch(path: string, options: RequestInit = {}) {
    const token = await getToken();
    const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    return res;
}

// ----- Pincode Serviceability -----

export interface ServiceabilityResult {
    available: boolean;
    courier_company_id?: number;
    courier_name?: string;
    estimated_delivery_days?: number;
    rate?: number;
    etd?: string; // e.g., "Mar 12, 2026"
}

export async function checkPincodeServiceability(
    pickupPostcode: string,
    deliveryPostcode: string,
    weight: number, // kg
    cod: boolean = false,
): Promise<ServiceabilityResult> {
    const params = new URLSearchParams({
        pickup_postcode: pickupPostcode,
        delivery_postcode: deliveryPostcode,
        weight: weight.toString(),
        cod: cod ? '1' : '0',
    });

    const res = await shiprocketFetch(`/courier/serviceability/?${params.toString()}`);
    const data = await res.json();

    if (!res.ok || !data?.data?.available_courier_companies?.length) {
        return { available: false };
    }

    const couriers = data.data.available_courier_companies;

    // Return best option
    const best = couriers[0];
    return {
        available: true,
        courier_company_id: best.courier_company_id,
        courier_name: best.courier_name,
        estimated_delivery_days: best.estimated_delivery_days,
        rate: best.rate,
        etd: best.etd,
    };
}

// ----- Shipping Rates -----

export interface ShippingRate {
    courier_company_id: number;
    courier_name: string;
    rate: number;
    estimated_delivery_days: number;
    etd: string;
}

export async function getShippingRates(
    pickupPostcode: string,
    deliveryPostcode: string,
    weight: number,
    cod: boolean = false,
): Promise<ShippingRate[]> {
    const params = new URLSearchParams({
        pickup_postcode: pickupPostcode,
        delivery_postcode: deliveryPostcode,
        weight: weight.toString(),
        cod: cod ? '1' : '0',
    });

    const res = await shiprocketFetch(`/courier/serviceability/?${params.toString()}`);
    const data = await res.json();

    if (!res.ok || !data?.data?.available_courier_companies?.length) {
        return [];
    }

    return data.data.available_courier_companies.map((c: any) => ({
        courier_company_id: c.courier_company_id,
        courier_name: c.courier_name,
        rate: c.rate,
        estimated_delivery_days: c.estimated_delivery_days,
        etd: c.etd,
    }));
}

// ----- Create Order on Shiprocket -----

export interface ShiprocketOrderPayload {
    order_id: string;
    order_date: string; // YYYY-MM-DD HH:mm
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    order_items: {
        name: string;
        sku: string;
        units: number;
        selling_price: number;
        hsn?: string;
    }[];
    payment_method: 'Prepaid' | 'COD';
    sub_total: number;
    weight: number; // kg
    length: number; // cm
    breadth: number; // cm
    height: number; // cm
}

export interface ShiprocketOrderResult {
    success: boolean;
    order_id?: number;
    shipment_id?: number;
    error?: string;
}

export async function createShiprocketOrder(
    payload: ShiprocketOrderPayload
): Promise<ShiprocketOrderResult> {
    const res = await shiprocketFetch('/orders/create/adhoc', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data?.order_id) {
        return {
            success: false,
            error: data?.message || data?.errors || 'Failed to create Shiprocket order',
        };
    }

    return {
        success: true,
        order_id: data.order_id,
        shipment_id: data.shipment_id,
    };
}

// ----- Generate AWB (Assign Courier) -----

export async function generateAWB(shipmentId: number, courierCompanyId?: number) {
    const body: Record<string, any> = { shipment_id: shipmentId };
    if (courierCompanyId) body.courier_id = courierCompanyId;

    const res = await shiprocketFetch('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify(body),
    });

    return res.json();
}

// ----- Generate Label -----

export async function generateLabel(shipmentIds: number[]) {
    const res = await shiprocketFetch('/courier/generate/label', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentIds }),
    });

    return res.json();
}

// ----- Request Pickup -----

export async function requestPickup(shipmentIds: number[]) {
    const res = await shiprocketFetch('/courier/generate/pickup', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentIds }),
    });

    return res.json();
}

// ----- Get Tracking Data -----

export interface TrackingData {
    tracking_data: {
        track_status: number;
        shipment_status: number;
        shipment_track: {
            current_status: string;
            delivered_date?: string;
            pickup_date?: string;
            etd?: string;
        }[];
        shipment_track_activities: {
            date: string;
            status: string;
            activity: string;
            location: string;
        }[];
    };
}

export async function getTracking(shipmentId: string): Promise<TrackingData | null> {
    const res = await shiprocketFetch(`/courier/track/shipment/${shipmentId}`);

    if (!res.ok) return null;

    return res.json();
}

// ----- Cancel Order -----

export async function cancelShiprocketOrder(orderIds: number[]) {
    const res = await shiprocketFetch('/orders/cancel', {
        method: 'POST',
        body: JSON.stringify({ ids: orderIds }),
    });

    return res.json();
}

// ----- Return Order -----

export async function createReturnOrder(
    orderId: number,
    orderItems: { sku: string; units: number }[]
) {
    const res = await shiprocketFetch('/orders/create/return', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId, order_items: orderItems }),
    });

    return res.json();
}

// ----- Utility: Calculate volumetric weight -----
export function calculateVolumetricWeight(
    length: number,
    width: number,
    height: number
): number {
    return (length * width * height) / 5000;
}

export function getChargeableWeight(
    actualWeight: number,
    length: number,
    width: number,
    height: number
): number {
    const volumetric = calculateVolumetricWeight(length, width, height);
    return Math.max(actualWeight, volumetric);
}
