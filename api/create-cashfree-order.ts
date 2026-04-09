import type { VercelRequest, VercelResponse } from '@vercel/node';

// Interfaces for request payload
interface CustomerDetails {
  customer_id?: string;
  customer_phone?: string;
  customer_name?: string;
  customer_email?: string;
}

interface OrderMeta {
  return_url?: string;
  [key: string]: any;
}

interface CashfreeOrderRequest {
  amount: number;
  customer_details: CustomerDetails;
  order_meta?: OrderMeta;
}

// Interface for Cashfree response (partial)
interface CashfreeOrderResponse {
  order_id: string;
  payment_link: string;
  order_status: string;
  [key: string]: any;
}

const CASHFREE_APP_ID = (process.env.CASHFREE_APP_ID || "").trim();
const CASHFREE_SECRET_KEY = (process.env.CASHFREE_SECRET_KEY || "").trim();
const IS_PRODUCTION = (process.env.CASHFREE_PRODUCTION || "").trim() === "true";

const BASE_URL = IS_PRODUCTION
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
            console.error("Missing Cashfree Credentials in Vercel Environment.");
            return res.status(500).json({ error: "Payment gateway configuration missing. Please check Vercel environment variables." });
        }

        const { amount, customer_details, order_meta } = req.body;

        // Basic validation
        if (!amount || !customer_details) {
          return res.status(400).json({ error: "Missing required fields: amount or customer_details" });
        }
        // Ensure customer_id exists; generate fallback if missing
        if (!customer_details.customer_id) {
          customer_details.customer_id = `cust_${Date.now()}`;
        }

        const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const orderPayload = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: customer_details.customer_id || `cust_${Date.now()}`,
                customer_phone: customer_details.customer_phone,
                customer_name: customer_details.customer_name,
                customer_email: customer_details.customer_email || "no-email@niveshlink.com"
            },
            order_meta: order_meta || {
                return_url: "https://niveshlink.vercel.app/payment-status?order_id={order_id}"
            }
        };

        console.log(`[Vercel API] Creating order ${orderId} for ${amount} INR...`);

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
                "Accept": "application/json"
            },
            body: JSON.stringify(orderPayload)
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Non-JSON response from Cashfree:", responseText);
            return res.status(502).json({ error: "Invalid response format from payment gateway." });
        }

        if (!response.ok) {
            console.error("Cashfree API Error:", data);
            return res.status(response.status).json({ error: data.message || "Cashfree payment initiation failed" });
        }

        // Include payment_session_id for frontend compatibility
        const responsePayload = {
            ...data,
            is_production: IS_PRODUCTION,
            payment_session_id: data.payment_link || data.payment_session_id || null,
        };
        return res.status(200).json(responsePayload);

    } catch (error: any) {
        console.error("Vercel API Caught Error:", error.message);
        return res.status(500).json({ error: error.message || "Internal server error during order creation" });
    }
}
