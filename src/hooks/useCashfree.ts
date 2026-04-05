import { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';

export function useCashfree() {
    const [loading, setLoading] = useState(false);

    const openCheckout = async (options: { 
        amount: number, 
        orderId: string, 
        paymentSessionId: string,
        isProduction?: boolean, // Added dynamic mode support
        onSuccess?: () => void,
        onFailure?: (err: any) => void 
    }) => {
        setLoading(true);
        try {
            const mode = options.isProduction ? "production" : "sandbox";
            console.log(`[Cashfree] Initializing in ${mode} mode...`);

            const cashfree = await load({
                mode: mode as "production" | "sandbox"
            });

            const checkoutOptions = {
                paymentSessionId: options.paymentSessionId,
                returnUrl: `${window.location.origin}/payment-status?order_id=${options.orderId}`,
            };

            const result = await cashfree.checkout(checkoutOptions);

            if (result.error) {
                if (options.onFailure) options.onFailure(result.error);
                return;
            }

            if (result.redirect) {
                // Redirecting...
            } else if (options.onSuccess) {
                options.onSuccess();
            }
        } catch (error) {
            console.error("Cashfree error:", error);
            if (options.onFailure) options.onFailure(error);
        } finally {
            setLoading(false);
        }
    };

    return { openCheckout, loading };
}
