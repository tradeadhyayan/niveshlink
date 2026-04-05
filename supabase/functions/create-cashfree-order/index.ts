import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID") || "";
const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY") || "";
const IS_PRODUCTION = Deno.env.get("CASHFREE_PRODUCTION") === "true";

const BASE_URL = IS_PRODUCTION
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { amount, customer_details, order_meta } = await req.json();

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

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
                "Accept": "application/json"
            },
            body: JSON.stringify(orderPayload) // use the full payload including URLs config
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree API Error:", data);
            throw new Error(`Cashfree error: ${data.message || 'Unknown error'}`);
        }

        return new Response(JSON.stringify({ ...data, is_production: IS_PRODUCTION }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
