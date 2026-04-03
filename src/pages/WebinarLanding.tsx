import React, { useState } from 'react';
import {
    Clock, Video, CheckCircle2,
    ArrowRight, Globe, ShieldCheck,
    BarChart3, LayoutGrid, Coins, PlayCircle,
    TrendingUp, LineChart, Target, PieChart, Users
} from 'lucide-react';
import { api, supabase } from '../lib/api';
import { useCashfree } from '../hooks/useCashfree';

export default function WebinarLanding() {
    const [formData, setFormData] = useState({ name: '', whatsapp: '', email: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const { openCheckout } = useCashfree();

    // Configuration
    const BRAND_NAME = "Nivesh Link";
    const WEBINAR_PRICE = 499;
    const WEBINAR_DATE = "Dec 14, 2025";
    const WEBINAR_TIME = "11:00 AM";

    const handleRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        let target = document.getElementById('register');
        if (!formData.name || !formData.whatsapp || !formData.email) {
            target?.scrollIntoView({ behavior: 'smooth' });
            target?.querySelector('input')?.focus();
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Create order securely from the edge function
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-cashfree-order', {
                body: { 
                    amount: WEBINAR_PRICE,
                    customer_details: {
                        customer_name: formData.name,
                        customer_phone: formData.whatsapp,
                        customer_email: formData.email
                    }
                }
            });

            if (orderError) throw new Error("Could not initialize payment. Please try again.");
            if (!orderData || !orderData.payment_session_id) throw new Error(orderData?.message || "Missing payment session ID.");

            // Also optionally log the intent in webinar_registrations before proceeding 
            // Just so we don't lose them if they drop off
            try {
                await api.webinar.register({
                    name: formData.name,
                    whatsapp: formData.whatsapp,
                    email: formData.email,
                    lead_status: 'checkout_pending'
                });
            } catch (ignored) {} // fail silently so payment flow isn't blocked

            // 2. Open Cashfree Checkout
            await openCheckout({
                amount: WEBINAR_PRICE,
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                onFailure: (err) => {
                    console.error("Payment failed or cancelled:", err);
                    alert("Payment could not be completed. Please try again or contact support at 9372333879");
                }
            });

        } catch (err: any) {
            console.error('Registration error:', err);
            alert(err.message || 'Something went wrong. Please contact 9372333879');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 font-body selection:bg-emerald-500/30 overflow-x-hidden relative">
            
            {/* Ambient Background Grid */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            {/* Ambient Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-[100] border-b border-[#1f1f1f] bg-[#050505]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-black" size={20} strokeWidth={2.5}/>
                        </div>
                        <h3 className="text-xl font-bold text-white font-heading">{BRAND_NAME}</h3>
                    </div>
                    
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
                        <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
                    </nav>

                    <button 
                        onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform font-heading"
                    >
                        Register Now
                    </button>
                </div>
            </header>

            <main className="pt-40 pb-32 px-6 lg:px-12 max-w-7xl mx-auto space-y-40">
                
                {/* 1. HERO SECTION */}
                <section className="text-center slide-in-from-bottom border-b border-[#1f1f1f]/50 pb-40">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE MASTERCLASS
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold text-white font-heading tracking-tight max-w-5xl mx-auto leading-[1.15]">
                        The Ultimate <br className="hidden md:block" />
                        <span className="text-emerald-500">Stock Market Blueprint</span>
                    </h1>
                    
                    <p className="text-slate-400 text-lg md:text-xl font-body max-w-2xl mx-auto mt-8 leading-relaxed">
                        Stop gambling. Start trading. A 90-minute roadmap <br className="hidden md:block"/>
                        to turn market confusion into <span className="text-white font-bold">consistent confidence</span>.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12">
                        <button 
                            onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-emerald-500 text-white px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-emerald-400 transition-colors shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] group"
                        >
                            <span className="font-bold font-heading text-lg">Register for ₹{WEBINAR_PRICE}</span> 
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#050505] flex items-center justify-center text-xs font-bold text-slate-300">JD</div>
                                <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-[#050505] flex items-center justify-center text-xs font-bold text-slate-200">AS</div>
                                <div className="w-10 h-10 rounded-full bg-slate-600 border-2 border-[#050505] flex items-center justify-center text-xs font-bold text-white">+99</div>
                            </div>
                            <span className="text-sm font-medium text-slate-400">Traders joined last session</span>
                        </div>
                    </div>
                </section>

                {/* 2. WHY THIS WEBINAR & BOOKING CARD */}
                <section id="about" className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left Column */}
                    <div className="flex-1 space-y-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-heading leading-tight tracking-tight">
                            Tired of random YouTube videos that create <span className="text-emerald-500">more doubt</span> ?
                        </h2>
                        
                        <div className="space-y-6">
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Most beginners lose money not because the market is rigged, but because they lack a structured approach. They jump from strategy to strategy, never mastering one.
                            </p>
                            
                            <div className="border-l-4 border-emerald-500 pl-6 py-2">
                                <p className="text-slate-200 text-lg leading-relaxed">
                                    This 90-minute session cuts through the noise. No confusing jargon, no heavy theory—just a practical, step-by-step roadmap.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 border border-[#222] bg-[#0a0a0a] rounded-full px-5 py-2.5 text-sm font-medium text-slate-300">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Beginner Friendly
                            </div>
                            <div className="flex items-center gap-2 border border-[#222] bg-[#0a0a0a] rounded-full px-5 py-2.5 text-sm font-medium text-slate-300">
                                <CheckCircle2 size={16} className="text-emerald-500" /> Actionable Steps
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column: Booking Card layout mirror */}
                    <div className="w-full lg:w-[480px]">
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
                            {/* Accent Glow on Hover */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className="flex justify-between items-start mb-10 relative z-10 border-b border-[#222] pb-8">
                                <div>
                                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 font-heading">NEXT SESSION</p>
                                    <h3 className="text-3xl font-bold text-white font-heading">{WEBINAR_DATE}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 font-heading">SUNDAY</p>
                                    <h3 className="text-3xl font-bold text-white font-heading">{WEBINAR_TIME}</h3>
                                </div>
                            </div>
                            
                            <div className="space-y-6 mb-10 relative z-10">
                                <div className="flex items-center gap-4 text-slate-300">
                                    <Clock className="text-slate-500" size={20} />
                                    <span className="font-medium">90 Minutes + Q&A</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-300">
                                    <Video className="text-slate-500" size={20} />
                                    <span className="font-medium">Live on Zoom</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-300">
                                    <Globe className="text-slate-500" size={20} />
                                    <span className="font-medium">Hindi + English Mix</span>
                                </div>
                            </div>

                            <div id="register" className="space-y-4 relative z-10 p-6 bg-[#111] rounded-2xl border border-[#222]">
                                <h4 className="text-sm font-bold text-white mb-2 font-heading">Secure your spot</h4>
                                <input 
                                    className="w-full bg-[#050505] border border-[#222] text-white px-4 py-3 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                                <input 
                                    className="w-full bg-[#050505] border border-[#222] text-white px-4 py-3 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                                    placeholder="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                                <input 
                                    className="w-full bg-[#050505] border border-[#222] text-white px-4 py-3 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                                    placeholder="WhatsApp Number"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                />
                                <button 
                                    onClick={handleRegister}
                                    disabled={isProcessing}
                                    className="w-full bg-white text-black py-4 rounded-xl font-bold font-heading mt-2 hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? 'Processing Payment...' : `Book Your Spot for ₹${WEBINAR_PRICE}`}
                                </button>
                                <p className="text-center text-[10px] text-slate-500 pt-2">
                                    By booking, you agree to our terms. Secure payment via Cashfree.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. 8 PILLARS (WHAT THIS SESSION COVERS) */}
                <section id="curriculum" className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-heading tracking-tight">What This Session Covers</h2>
                        <p className="text-lg text-slate-400 max-w-xl mx-auto">We strip away the noise and focus on the 8 pillars of profitable trading.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <PillarCard icon={<Target/>} num="1" title="Reality Check" desc="Why most traders fail, hidden traps, and behavioural mistakes that blow up accounts." />
                        <PillarCard icon={<LayoutGrid/>} num="2" title="Market Ecosystem" desc="How SEBI, Brokers, FIIs, and DIIs operate, and how big players drive movement." />
                        <PillarCard icon={<Coins/>} num="3" title="Instruments" desc="Equity, F&O, Commodities, Debt. What they mean and which one builds real wealth." />
                        <PillarCard icon={<BarChart3/>} num="4" title="Fundamental 5" desc="Business quality, Management, Moat, Growth triggers, and Risks simplified." />
                        <PillarCard icon={<LineChart/>} num="5" title="Technical Basics" desc="Candlesticks, Trends, Support & Resistance, Price Action, and Volume." />
                        <PillarCard icon={<TrendingUp/>} num="6" title="Breakout Strategy" desc="A clean, simple price-action strategy for high-probability entries." />
                        <PillarCard icon={<ShieldCheck/>} num="7" title="Risk Management" desc="1% Rule, Position sizing, R:R framework, and capital protection." />
                        <PillarCard icon={<PieChart/>} num="8" title="Trading Journal" desc="What to track and how your journal becomes your best mentor." />
                    </div>
                </section>

                {/* 4. WHO & WHY */}
                <section id="benefits" className="grid lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-white font-heading tracking-tight">Who This Webinar Is For</h2>
                        <div className="space-y-4">
                            <FeaturePill icon={<PlayCircle/>} text="Absolute beginners" />
                            <FeaturePill icon={<Users/>} text="Students" />
                            <FeaturePill icon={<Clock/>} text="Working professionals" />
                            <FeaturePill icon={<TrendingUp/>} text="New traders" />
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-white font-heading tracking-tight">Why This Webinar Is Different</h2>
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-8 space-y-8">
                            <div className="flex gap-4">
                                <div className="mt-1"><LayoutGrid className="text-emerald-500" size={24}/></div>
                                <div>
                                    <h4 className="text-white font-bold font-heading text-lg mb-1">Structured & Logical</h4>
                                    <p className="text-slate-400 text-sm">No random tips. A complete system.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><Target className="text-emerald-500" size={24}/></div>
                                <div>
                                    <h4 className="text-white font-bold font-heading text-lg mb-1">Result Oriented</h4>
                                    <p className="text-slate-400 text-sm">Focus on profit and capital protection.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><Users className="text-emerald-500" size={24}/></div>
                                <div>
                                    <h4 className="text-white font-bold font-heading text-lg mb-1">Real Experience</h4>
                                    <p className="text-slate-400 text-sm">Based on years of actual market trading.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            
            <footer className="border-t border-[#1f1f1f] bg-[#050505] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-black" size={16} strokeWidth={2.5}/>
                        </div>
                        <h3 className="text-lg font-bold text-white font-heading">{BRAND_NAME}</h3>
                    </div>
                    <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Nivesh Link. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function PillarCard({ num, icon, title, desc }: any) {
    return (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="text-xl font-bold text-white mb-3 font-heading">{num}. {title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function FeaturePill({ icon, text }: any) {
    return (
        <div className="flex items-center gap-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
            <div className="text-emerald-500">
                {icon}
            </div>
            <span className="text-white font-bold text-base font-heading">{text}</span>
        </div>
    );
}
