import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/api'; // Or your actual client
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function PaymentStatus() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'checking' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (!orderId) {
            setStatus('error');
            setErrorMessage('No Order ID found in the URL. Please ensure you completed the payment flow.');
            return;
        }
        
        verifyPayment(orderId);
    }, [orderId]);

    const verifyPayment = async (orderId: string) => {
        setStatus('checking');
        try {
            const { data: responseData, error } = await supabase.functions.invoke('verify-payment', {
                body: { order_id: orderId }
            });

            if (error) {
                throw new Error("Unable to contact verification server: " + error.message);
            }

            if (responseData?.error) {
                throw new Error(responseData.error);
            }

            const isPaid = responseData?.order_status === 'PAID';
            
            if (isPaid) {
                // Here you should ideally also update/insert the lead into DB
                // Since user info is often passed in meta during checkout or 
                // stored in a separate table prior to checkout.
                // Assuming Nivesh Link webhook handles the actual DB insertion
                // But if we must register them here, we can.
                // Assuming `customer_details` can be extracted using the edge function or 
                // the lead is inserted before checkout and we just update status to 'PAID'.
                // Since this is a simple page, we just show success.
                setStatus('success');
            } else {
                throw new Error(`Payment not completed. Status: ${responseData?.order_status || 'PENDING'}. Please try again.`);
            }

        } catch (err: any) {
            console.error("Payment verification failed:", err);
            setStatus('error');
            setErrorMessage(err.message || 'Payment failed or was cancelled.');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 font-body flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505] to-[#050505]">
            <div className="max-w-md w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-[2rem] p-10 shadow-2xl relative overflow-hidden text-center">
                
                {status === 'loading' || status === 'checking' ? (
                    <div className="animate-in fade-in duration-500">
                        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2 font-heading">Verifying Payment...</h2>
                        <p className="text-slate-400 text-sm">Please wait while we confirm your transaction securely with Cashfree.</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="animate-in zoom-in fade-in duration-500">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/50 blur-[1px]" />
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight font-heading">Booking Confirmed!</h1>
                        <p className="text-slate-400 mb-8 font-medium text-sm">
                            Your payment was successful. We will email you the session link and further instructions shortly.
                        </p>
                        <button 
                            onClick={() => window.location.href = 'https://chat.whatsapp.com/Fr5ieLzdLICI85SLwVCKQI'}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all shadow-xl"
                        >
                            Join WhatsApp Group <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 text-xs font-semibold text-slate-500 hover:text-white transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
                            <XCircle size={40} className="text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 font-heading">Payment Failed</h2>
                        <p className="text-rose-400 text-sm mb-6">{errorMessage}</p>
                        
                        <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-left mb-8">
                            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Need Help?</p>
                            <p className="text-sm font-medium text-slate-300">If the amount was deducted or you are facing issues, contact us at:</p>
                            <div className="mt-3 space-y-1">
                                <p className="text-sm"><span className="text-emerald-500 font-semibold text-xs uppercase mr-2">Phone</span> <span className="font-bold text-white tracking-wide">9372333879</span></p>
                                <p className="text-sm"><span className="text-emerald-500 font-semibold text-xs uppercase mr-2">Email</span> <span className="font-bold text-white tracking-wide">niveshlink.edu@gmail.com</span></p>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-all shadow-xl"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
