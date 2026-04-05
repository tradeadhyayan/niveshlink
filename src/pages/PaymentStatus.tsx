import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCcw, MessageCircle, Mail, Phone, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/api';

export default function PaymentStatus() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [orderDetails, setOrderDetails] = useState<any>(null);

    const WHATSAPP_LINK = "https://chat.whatsapp.com/LBL0ZAATtM0FjkKHAKHSun?mode=gi_t";
    const SUPPORT_PHONE = "9372333879";
    const SUPPORT_EMAIL = "niveshlink.edu@gmail.com";

    useEffect(() => {
        if (orderId) {
            checkStatus();
        } else {
            setStatus('failed');
        }
    }, [orderId]);

    const checkStatus = async () => {
        try {
            // Verify with Cashfree via Edge Function
            const { data, error } = await supabase.functions.invoke('check-cashfree-order', {
                body: { orderId }
            });

            if (error) throw error;

            if (data.order_status === 'PAID') {
                setStatus('success');
                setOrderDetails(data);
                // Update Supabase
                await supabase
                    .from('webinar_registrations')
                    .update({ lead_status: 'enrolled', cf_payment_id: data.cf_payment_id })
                    .eq('order_id', orderId);
            } else {
                setStatus('failed');
            }
        } catch (err) {
            console.error('Status check error:', err);
            setStatus('failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 relative overflow-hidden">
            
            {/* Designer Background Layering */}
            <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none -z-10" />
            <div className="fixed inset-0 bg-emerald-glow opacity-30 pointer-events-none -z-10" />
            <div className="fixed inset-0 bg-blue-glow opacity-20 pointer-events-none -z-10" />

            <div className="max-w-md w-full relative z-10">
                {status === 'loading' && (
                    <div className="text-center space-y-12 animate-pulse">
                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] mx-auto flex items-center justify-center">
                            <RefreshCcw size={48} className="animate-spin text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold font-heading">Securing Order</h2>
                            <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Verifying with Nivesh Link Intelligence Systems</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-10 animate-in fade-in zoom-in duration-700">
                        <div className="text-center">
                            <div className="w-28 h-28 bg-[#10b981] text-black rounded-[2.5rem] mx-auto flex items-center justify-center mb-10 shadow-[0_25px_60px_rgba(16,185,129,0.4)]">
                                <CheckCircle2 size={56} strokeWidth={3} />
                            </div>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Authorization Successful</span>
                            <h2 className="text-5xl font-bold font-heading mb-6 tracking-tight">Access Granted.</h2>
                            <p className="text-white/40 text-lg leading-relaxed">Welcome to the inner circle. Your credentials are confirmed.</p>
                        </div>
                        
                        <div className="glass-card rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] pointer-events-none" />
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                                <span>Order Protocol</span>
                                <span className="text-emerald-500 font-mono">{orderId}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Enrollment Fee</span>
                                <span className="text-3xl font-bold font-heading text-gradient-emerald-blue">₹{orderDetails?.order_amount || '499'}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <a 
                                href={WHATSAPP_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] text-white py-6 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-[1.03] transition-all shadow-[0_20px_50px_rgba(37,211,102,0.3)] active:scale-95 group"
                            >
                                <MessageCircle size={24} /> Get Access Details
                                <ArrowUpRight size={18} className="text-white/50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                            <Link to="/" className="block text-center text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em] pt-8">
                                Return to Intelligence Portal
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="space-y-10 animate-in fade-in zoom-in duration-700">
                        <div className="text-center">
                            <div className="w-28 h-28 bg-rose-500 text-white rounded-[2.5rem] mx-auto flex items-center justify-center mb-10 shadow-[0_25px_60px_rgba(244,63,94,0.3)]">
                                <XCircle size={56} strokeWidth={3} />
                            </div>
                            <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Verification Interface Failed</span>
                            <h2 className="text-4xl font-bold font-heading mb-6 tracking-tight">Manual Action Required.</h2>
                            <p className="text-white/40 text-lg">Our automated system could not verify this transaction.</p>
                        </div>
                        
                        <div className="glass-card rounded-[2.5rem] p-10 space-y-8">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20">
                                <ShieldCheck size={14} /> Global Priority Support
                            </div>
                            <div className="space-y-6">
                                <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-5 text-emerald-500 font-bold hover:text-emerald-400 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors"><Phone size={20} /></div>
                                    <span className="text-xl tracking-tight">{SUPPORT_PHONE}</span>
                                </a>
                                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-5 text-blue-400 font-bold hover:text-blue-300 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-400/5 flex items-center justify-center group-hover:bg-blue-400/10 transition-colors"><Mail size={20} /></div>
                                    <span className="text-lg tracking-tight lowercase">{SUPPORT_EMAIL}</span>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full bg-white text-black py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-emerald-400 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
                            >
                                <RefreshCcw size={18} /> Resync Status
                            </button>
                            <Link to="/" className="block text-center text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em] pt-8">
                                Terminal Reset
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
