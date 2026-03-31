import { useState } from 'react';
import { supabase } from '@/lib/api';
import { load } from '@cashfreepayments/cashfree-js';

export function useCashfree() {
    const [loading, setLoading] = useState(false);

    const openCheckout = async (options: { 
        amount: number, 
        orderId: string, 
        paymentSessionId: string,
        onSuccess?: () => void,
        onFailure?: (err: any) => void 
    }) => {
        setLoading(true);
        try {
            const cashfree = await load({
                mode: "sandbox" // Change to "production" for real payments
            });

            const checkoutOptions = {
                paymentSessionId: options.paymentSessionId,
                returnUrl: `${window.location.origin}/payment-status?order_id=${options.orderId}`,
            };

            const result = await cashfree.checkout(checkoutOptions);

            if (result.error) {
                console.error("Cashfree Error:", result.error);
                if (options.onFailure) options.onFailure(result.error);
                return;
            }

            if (result.redirect) {
                console.log("Redirecting to payment page...");
            } else if (options.onSuccess) {
                options.onSuccess();
            }
        } catch (error) {
            console.error("Cashfree Checkout Init Error:", error);
            if (options.onFailure) options.onFailure(error);
        } finally {
            setLoading(false);
        }
    };

    // Simplified mock version for local dev if backend isn't ready
    const openMockCheckout = async (planName: string, amount: number, onSuccess: () => void) => {
        setLoading(true);
        const proceed = confirm(`[SANDBOX] Proceed to pay ₹${amount} for ${planName}?`);
        if (proceed) {
            setTimeout(() => {
                setLoading(false);
                onSuccess();
            }, 1000);
        } else {
            setLoading(false);
        }
    };

    return { openCheckout, openMockCheckout, loading };
}
