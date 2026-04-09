import type { VercelRequest, VercelResponse } from '@vercel/node';

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
            return res.status(500).json({ error: "Payment gateway configuration missing." });
        }

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: "orderId is required" });
        }

        console.log(`[Vercel API] Checking status for order ${orderId}...`);

        const response = await fetch(`${BASE_URL}/${orderId}`, {
            method: "GET",
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
                "Accept": "application/json"
            }
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
            console.error("Cashfree API Status Error:", data);
            return res.status(response.status).json({ error: data.message || "Failed to fetch order status" });
        }

        // Return the relevant status data
        // For Cashfree v3 API, order_status can be 'PAID', 'ACTIVE', 'EXPIRED', etc.
        return res.status(200).json({
            order_id: data.order_id,
            order_status: data.order_status,
            order_amount: data.order_amount,
            cf_payment_id: data.cf_order_id, // In some versions it's cf_order_id
            payment_session_id: data.payment_session_id
        });

    } catch (error: any) {
        console.error("Vercel API Status Check Caught Error:", error.message);
        return res.status(500).json({ error: error.message || "Internal server error during status check" });
    }
}
