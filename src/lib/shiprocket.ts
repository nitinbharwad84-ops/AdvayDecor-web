/**
 * Shiprocket API Service Library
 * 
 * Handles authentication, token caching, and all Shiprocket API interactions.
 * Called only from server-side API routes (never from the client).
 */

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// In-memory token cache (survives across requests in the same server instance)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// ─────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────

/**
 * Get a valid Shiprocket auth token.
 * Caches the token in-memory for 24 hours (Shiprocket tokens last 10 days).
 */
export async function getShiprocketToken(): Promise<string> {
    const now = Date.now();

    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables are required');
    }

    const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Shiprocket auth failed:', res.status, errorText);
        throw new Error(`Shiprocket authentication failed: ${res.status}`);
    }

    const data = await res.json();
    cachedToken = data.token;
    // Cache for 24 hours (well within the 10-day token validity)
    tokenExpiry = now + 24 * 60 * 60 * 1000;

    return data.token;
}

/**
 * Make an authenticated request to the Shiprocket API.
 */
async function shiprocketFetch(
    endpoint: string,
    options: { method?: string; body?: any; params?: Record<string, string> } = {}
): Promise<any> {
    const token = await getShiprocketToken();
    const { method = 'GET', body, params } = options;

    let url = `${SHIPROCKET_BASE_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Shiprocket API error [${method} ${endpoint}]:`, res.status, errorText);
        throw new Error(`Shiprocket API error: ${res.status} — ${errorText}`);
    }

    return res.json();
}


// ─────────────────────────────────────────────
// Pincode Serviceability
// ─────────────────────────────────────────────

export interface ServiceabilityResult {
    available: boolean;
    couriers: CourierOption[];
    cheapest?: CourierOption;
    fastest?: CourierOption;
}

export interface CourierOption {
    courier_company_id: number;
    courier_name: string;
    rate: number;
    cod_charges: number;
    estimated_delivery_days: number;
    estimated_delivery_date: string;
    etd: string; // raw Shiprocket ETD string
}

/**
 * Check if delivery is serviceable between two pincodes.
 */
export async function checkServiceability(
    pickupPincode: string,
    deliveryPincode: string,
    weight: number = 0.5,
    cod: boolean = false
): Promise<ServiceabilityResult> {
    try {
        const data = await shiprocketFetch('/courier/serviceability/', {
            params: {
                pickup_postcode: pickupPincode,
                delivery_postcode: deliveryPincode,
                weight: weight.toString(),
                cod: cod ? '1' : '0',
            },
        });

        if (!data?.data?.available_courier_companies?.length) {
            return { available: false, couriers: [] };
        }

        const couriers: CourierOption[] = data.data.available_courier_companies.map((c: any) => ({
            courier_company_id: c.courier_company_id,
            courier_name: c.courier_name,
            rate: c.rate || c.freight_charge || 0,
            cod_charges: c.cod_charges || 0,
            estimated_delivery_days: c.estimated_delivery_days || 0,
            estimated_delivery_date: c.etd || '',
            etd: c.etd || '',
        }));

        // Sort by rate ascending for cheapest
        const sortedByRate = [...couriers].sort((a, b) => a.rate - b.rate);
        // Sort by delivery days for fastest
        const sortedByDays = [...couriers].sort((a, b) => a.estimated_delivery_days - b.estimated_delivery_days);

        return {
            available: true,
            couriers,
            cheapest: sortedByRate[0],
            fastest: sortedByDays[0],
        };
    } catch (error) {
        console.error('Serviceability check failed:', error);
        return { available: false, couriers: [] };
    }
}


// ─────────────────────────────────────────────
// Shipping Rate Calculation
// ─────────────────────────────────────────────

export interface RateCalculationInput {
    pickupPincode: string;
    deliveryPincode: string;
    weight: number; // in kg
    length: number; // in cm
    breadth: number; // in cm
    height: number; // in cm
    cod: boolean;
    declaredValue?: number;
}

export async function calculateShippingRates(input: RateCalculationInput): Promise<ServiceabilityResult> {
    try {
        const data = await shiprocketFetch('/courier/serviceability/', {
            params: {
                pickup_postcode: input.pickupPincode,
                delivery_postcode: input.deliveryPincode,
                weight: input.weight.toString(),
                length: input.length.toString(),
                breadth: input.breadth.toString(),
                height: input.height.toString(),
                cod: input.cod ? '1' : '0',
                ...(input.declaredValue ? { declared_value: input.declaredValue.toString() } : {}),
            },
        });

        if (!data?.data?.available_courier_companies?.length) {
            return { available: false, couriers: [] };
        }

        const couriers: CourierOption[] = data.data.available_courier_companies.map((c: any) => ({
            courier_company_id: c.courier_company_id,
            courier_name: c.courier_name,
            rate: c.rate || c.freight_charge || 0,
            cod_charges: c.cod_charges || 0,
            estimated_delivery_days: c.estimated_delivery_days || 0,
            estimated_delivery_date: c.etd || '',
            etd: c.etd || '',
        }));

        const sortedByRate = [...couriers].sort((a, b) => a.rate - b.rate);
        const sortedByDays = [...couriers].sort((a, b) => a.estimated_delivery_days - b.estimated_delivery_days);

        return {
            available: true,
            couriers,
            cheapest: sortedByRate[0],
            fastest: sortedByDays[0],
        };
    } catch (error) {
        console.error('Rate calculation failed:', error);
        return { available: false, couriers: [] };
    }
}


// ─────────────────────────────────────────────
// Order Creation
// ─────────────────────────────────────────────

export interface ShiprocketOrderInput {
    order_id: string;
    order_date: string; // YYYY-MM-DD HH:mm
    pickup_location?: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    shipping_customer_name?: string;
    shipping_address?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_pincode?: string;
    shipping_state?: string;
    shipping_country?: string;
    shipping_phone?: string;
    order_items: ShiprocketOrderItem[];
    payment_method: 'Prepaid' | 'COD';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}

export interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: string;
}

export interface ShiprocketOrderResponse {
    order_id: number;
    shipment_id: number;
    status: string;
    status_code: number;
    onboarding_completed_now?: number;
    awb_code?: string;
    courier_company_id?: number;
    courier_name?: string;
}

export async function createShiprocketOrder(
    input: ShiprocketOrderInput
): Promise<ShiprocketOrderResponse> {
    const data = await shiprocketFetch('/orders/create/adhoc', {
        method: 'POST',
        body: input,
    });

    return {
        order_id: data.order_id,
        shipment_id: data.shipment_id,
        status: data.status || '',
        status_code: data.status_code || 0,
        onboarding_completed_now: data.onboarding_completed_now,
        awb_code: data.awb_code || null,
        courier_company_id: data.courier_company_id || null,
        courier_name: data.courier_name || null,
    };
}


// ─────────────────────────────────────────────
// AWB Assignment
// ─────────────────────────────────────────────

export interface AWBAssignmentResponse {
    awb_assign_status: number;
    response: {
        data: {
            awb_code: string;
            courier_company_id: number;
            courier_name: string;
            assigned_date_time: string;
        };
    };
}

export async function assignAWB(
    shipmentId: string | number,
    courierId?: number
): Promise<AWBAssignmentResponse> {
    const body: any = { shipment_id: shipmentId };
    if (courierId) {
        body.courier_id = courierId;
    }

    return shiprocketFetch('/courier/assign/awb', {
        method: 'POST',
        body,
    });
}


// ─────────────────────────────────────────────
// Shipment Tracking
// ─────────────────────────────────────────────

export interface TrackingActivity {
    date: string;
    status: string;
    activity: string;
    location: string;
    sr_status: string;
    sr_status_label: string;
}

export interface TrackingResponse {
    tracking_data: {
        track_status: number;
        shipment_status: number;
        shipment_track: {
            id: number;
            awb_code: string;
            courier_company_id: number;
            shipment_id: number;
            order_id: number;
            pickup_date: string | null;
            delivered_date: string | null;
            weight: string;
            packages: number;
            current_status: string;
            delivered_to: string;
            etd: string;
            courier_agent_details: any;
        }[];
        shipment_track_activities: TrackingActivity[];
        track_url: string;
        etd: string;
        qc_response?: any;
    };
}

export async function trackShipment(awbCode: string): Promise<TrackingResponse | null> {
    try {
        const data = await shiprocketFetch('/courier/track/awb/' + awbCode);
        return data;
    } catch (error) {
        console.error('Tracking failed for AWB:', awbCode, error);
        return null;
    }
}

export async function trackByShipmentId(shipmentId: string | number): Promise<TrackingResponse | null> {
    try {
        const data = await shiprocketFetch('/courier/track/shipment/' + shipmentId);
        return data;
    } catch (error) {
        console.error('Tracking failed for shipment:', shipmentId, error);
        return null;
    }
}


// ─────────────────────────────────────────────
// Order Cancellation
// ─────────────────────────────────────────────

export async function cancelShiprocketOrder(orderIds: number[]): Promise<any> {
    return shiprocketFetch('/orders/cancel', {
        method: 'POST',
        body: { ids: orderIds },
    });
}

export async function cancelShipment(awbCodes: string[]): Promise<any> {
    return shiprocketFetch('/orders/cancel/shipment/awbs', {
        method: 'POST',
        body: { awbs: awbCodes },
    });
}


// ─────────────────────────────────────────────
// Return Order
// ─────────────────────────────────────────────

export async function createReturnOrder(input: {
    order_id: string;
    order_date: string;
    pickup_customer_name: string;
    pickup_address: string;
    pickup_city: string;
    pickup_state: string;
    pickup_pincode: string;
    pickup_phone: string;
    order_items: ShiprocketOrderItem[];
    payment_method: 'Prepaid' | 'COD';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}): Promise<any> {
    return shiprocketFetch('/orders/create/return', {
        method: 'POST',
        body: input,
    });
}
