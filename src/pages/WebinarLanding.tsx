import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, CheckCircle2, Star, ShieldCheck, 
    MessageSquare, ArrowRight, Share2, Award, 
    Gift, Zap, Users, ChevronRight, Menu, X, Play,
    TrendingUp, LayoutGrid, Lock, ChevronDown, BookOpen, Microscope, Sparkles, HelpCircle, Plus, Minus,
    Globe, BarChart3, Target, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, supabase } from '../lib/api';
import { useCashfree } from '../hooks/useCashfree';
import { Link } from 'react-router-dom';
import GlowBackground from '../components/GlowBackground';

export default function WebinarLanding() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', whatsapp: '', email: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const { openCheckout } = useCashfree();

    const BRAND_NAME = "Nivesh Link";
    const WEBINAR_PRICE = 49;
    const WEBINAR_DATE_DISPLAY = "April 18, 2026";
    const WEBINAR_TIME_DISPLAY = "11:00 AM";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const targetDate = new Date("2026-04-18T11:00:00").getTime();

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    const handleRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!formData.name || !formData.whatsapp) {
            document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        setIsProcessing(true);

        try {
            // Use the new API helper to create a Cashfree order
            const orderData = await api.webinar.createCashfreeOrder({
                amount: WEBINAR_PRICE,
                customer_details: {
                    customer_id: `cust_${Date.now()}_${formData.whatsapp}`,
                    customer_name: formData.name,
                    customer_phone: formData.whatsapp,
                    customer_email: formData.email || `${formData.whatsapp}@niveshlink.temp}`,
                },
                order_meta: {
                    return_url: `${window.location.origin}/payment-status?order_id={order_id}`,
                },
            });
            // The helper throws on error, so we can proceed with orderData

            if (!orderData?.payment_session_id) {
                throw new Error("No payment session received. Please check backend logs.");
            }

            await openCheckout({
                amount: WEBINAR_PRICE,
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                isProduction: orderData.is_production,
                onSuccess: () => {
                    // Redirect is handled by return_url
                },
                onFailure: (err: any) => {
                    console.error("OpenCheckout Error:", err);
                    alert(`Payment failed at checkout: ${err.message || JSON.stringify(err)}`);
                }
            });

        } catch (err: any) {
            console.error('Final Registration Error:', err);
            alert(err.message || 'Something went wrong. Support: 9372333879');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white font-body selection:bg-emerald-500/30 overflow-x-hidden relative">
            
            <GlowBackground />
            
            {/* Background Layers */}
            <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none -z-10" />

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'bg-black/40 backdrop-blur-3xl border-b border-white/5 py-3' : 'bg-transparent py-8'}`}>
                <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <TrendingUp className="text-black" size={20} strokeWidth={3}/>
                        </div>
                        <span className="text-2xl font-bold tracking-tight font-heading">{BRAND_NAME}</span>
                    </div>

                    <div className="hidden md:flex gap-10 items-center text-sm font-semibold text-white/50">
                        <a href="#about" className="hover:text-emerald-400 transition-colors">Origins</a>
                        <a href="#curriculum" className="hover:text-blue-400 transition-colors">Blueprint</a>
                        <Link to="/courses/smart-niveshak" className="hover:text-blue-400 transition-colors">Courses</Link>
                        <a href="#bonuses" className="hover:text-amber-400 transition-colors">Bonuses</a>
                        <a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a>
                        <button 
                            onClick={() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-emerald-400 transition-all active:scale-95"
                        >
                            Register Now
                        </button>
                    </div>

                    {/* Mobile Register Button */}
                    <button 
                        onClick={() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="md:hidden bg-emerald-500 text-black px-5 py-2 rounded-full font-bold text-xs active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        Register
                    </button>
                </div>
            </nav>

            <main className="pt-32 md:pt-48 max-w-7xl mx-auto px-6">
                
                {/* Hero Section */}
                <section className="text-center mb-64 relative">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-pill inline-flex items-center gap-3 px-6 py-2 rounded-full text-xs font-bold mb-10 text-emerald-500"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,1)]" /> 
                        Registration Closing Soon
                    </motion.div>

                    {/* ⏳ Digital Countdown Timer */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center gap-4 md:gap-8 mb-16"
                    >
                        <TimeBox value={timeLeft.days} label="Days" color="emerald" />
                        <TimeBox value={timeLeft.hours} label="Hours" color="blue" />
                        <TimeBox value={timeLeft.minutes} label="Mins" color="purple" />
                        <TimeBox value={timeLeft.seconds} label="Secs" color="rose" />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-[5.5rem] font-bold font-heading tracking-tight leading-[1.1] mb-10 max-w-5xl mx-auto px-4 md:px-0 mt-8 md:mt-0"
                    >
                        The Ultimate <br />
                        <span className="text-gradient-emerald-blue text-5xl md:text-[6rem]">Stock Market Blueprint</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-readable text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-16 px-4 md:px-0"
                    >
                        Stop gambling. Start trading. A 90-minute roadmap <br className="hidden md:block" />
                        to turn market confusion into <span className="text-white">consistent confidence</span>.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center gap-12"
                    >
                        <button 
                            onClick={() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[#10b981] text-black px-10 md:px-16 py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-2xl md:text-3xl flex flex-col items-center gap-1 hover:bg-[#34d399] transition-all shadow-[0_20px_80px_rgba(16,185,129,0.4)] hover:translate-y-[-8px] active:scale-95 group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4">
                                Join Masterclass for ₹{WEBINAR_PRICE}
                                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-60 font-bold">Limited Slots Available • One-Time Offer</span>
                        </button>

                         <div className="flex items-center gap-6 glass-pill px-8 py-4 rounded-3xl">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020202] bg-emerald-500/20 flex items-center justify-center">
                                        <Users size={16} className="text-emerald-500" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-[#020202] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white/50">
                                    +99
                                </div>
                            </div>
                            <p className="text-xs font-bold text-subtitle">Join 850+ trained traders</p>
                        </div>
                    </motion.div>
                </section>

                {/* 🔥 The Transformation: From Confusion to Clarity */}
                <section id="transformation" className="mb-64">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading">The Trading Evolution</h2>
                        <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">From Amateur to Institutional Logic</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Before: The Struggle */}
                        <div className="glass-card rounded-[3.5rem] p-12 border-rose-500/10 bg-rose-500/5 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] pointer-events-none" />
                            <div className="flex items-center gap-4 text-rose-500 font-black uppercase tracking-widest text-xs">
                                <X size={16} /> The Confusion Phase
                            </div>
                            <h3 className="text-3xl font-bold font-heading">Gambling with Knowledge</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 text-readable font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                                    Jumping from one YouTube "magic" strategy to another.
                                </li>
                                <li className="flex items-start gap-4 text-readable font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                                    No clear entry or exit logic—trading on "hope".
                                </li>
                                <li className="flex items-start gap-4 text-readable font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                                    Emotional rollercoasters with every price movement.
                                </li>
                            </ul>
                        </div>

                        {/* After: The Clarity */}
                        <div className="glass-card rounded-[3.5rem] p-12 border-emerald-500/10 bg-emerald-500/5 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none" />
                            <div className="flex items-center gap-4 text-emerald-500 font-black uppercase tracking-widest text-xs">
                                <CheckCircle2 size={16} /> The Professional Phase
                            </div>
                            <h3 className="text-3xl font-bold font-heading">Trading with Blueprint</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 text-readable font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    Executing a structured, logic-based roadmap.
                                </li>
                                <li className="flex items-start gap-4 text-readable font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    Capital protection first. Profit is a byproduct of logic.
                                </li>
                                <li className="flex items-start gap-4 text-readable font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    Emotional independence and professional discipline.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Accuracy Content - Tired of YouTube */}
                <section id="about" className="grid lg:grid-cols-2 gap-24 items-center mb-64">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight">
                                Tired of random YouTube <br />
                                videos that create <br />
                                <span className="text-emerald-400 font-black italic">more doubt?</span>
                            </h2>
                        </div>
                        
                        <div className="space-y-8">
                            <p className="text-readable text-xl leading-relaxed font-medium">
                                Most beginners lose money because they **lack a structured approach**. They jump from strategy to strategy, never mastering one. 
                            </p>
                            
                            <div className="bg-emerald-500/10 border-l-4 border-emerald-500/30 p-8 rounded-r-2xl">
                                <p className="text-emerald-500 text-lg font-bold">
                                    This 90-minute session is your first step towards institutional logic. No jargon—just a practical roadmap.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div id="register-section" className="relative">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none" />
                        
                        <div className="glass-card rounded-[3.5rem] overflow-hidden flex flex-col xl:flex-row shadow-2xl border-white/10">
                            {/* Slot Info Side */}
                            <div className="xl:w-2/5 p-10 md:p-14 bg-white/5 border-r border-white/5">
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.2em]">Official Slot Booking</p>
                                        <h3 className="text-4xl font-bold font-heading">Secure Your <br />Expert Access</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="slot-option selected">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="text-emerald-500" size={18} />
                                                    <span className="font-bold text-lg">{WEBINAR_DATE_DISPLAY}</span>
                                                </div>
                                                <CheckCircle2 className="text-emerald-500" size={18} />
                                            </div>
                                            <div className="flex items-center gap-3 text-subtitle text-sm">
                                                <Clock size={16} />
                                                <span>{WEBINAR_TIME_DISPLAY} (Live Session)</span>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-subtitle">Webinar Fee</span>
                                                <span className="font-bold">₹{WEBINAR_PRICE}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-subtitle">Booking Status</span>
                                                <span className="text-emerald-500 font-bold">Fast Filling 🔥</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-dimmed text-xs font-bold uppercase tracking-widest">
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                        <span>Certified Training Program</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Form Side */}
                            <div className="flex-1 p-8 md:p-10 space-y-8">
                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-subtitle uppercase tracking-widest ml-1">Your Full Name</label>
                                        <div className="relative group">
                                            <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input 
                                                className="w-full bg-black/40 border border-white/10 text-white pl-14 pr-6 py-4 rounded-xl focus:border-emerald-500 outline-none transition-all placeholder:text-white/10 text-base"
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-subtitle uppercase tracking-widest ml-1">WhatsApp Number</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input 
                                                className="w-full bg-black/40 border border-white/10 text-white pl-14 pr-6 py-4 rounded-xl focus:border-emerald-500 outline-none transition-all placeholder:text-white/10 text-base"
                                                placeholder="For session link"
                                                value={formData.whatsapp}
                                                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleRegister}
                                        disabled={isProcessing}
                                        className="w-full bg-emerald-500 text-black py-5 rounded-xl font-black text-lg hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(16,185,129,0.3)]"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Zap className="animate-spin" size={20} />
                                                Setting things up...
                                            </>
                                        ) : (
                                            <>
                                                Secure My Seat Now
                                                <ArrowRight size={22} />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex flex-wrap justify-center gap-6 pt-8 border-t border-white/5 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">SSL Secure</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Lock size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Data Encrypted</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🌈 8 Pillars Mastery */}
                <section id="curriculum" className="mb-64">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">The 8 Pillars of Mastery</h2>
                        <p className="text-subtitle text-lg">A logic-based system designed for absolute beginners.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <SimpleCard id="01" icon={<Zap/>} title="Reality Check" desc="Why most traders fail, hidden traps, and behavioural mistakes that blow up accounts." />
                        <SimpleCard id="02" icon={<Globe/>} title="Market Ecosystem" desc="How SEBI, Brokers, FIIs, and DIIs operate, and how big players drive movement." />
                        <SimpleCard id="03" icon={<LayoutGrid/>} title="Instruments" desc="Types of Financial instruments and types of instruments vehicles" />
                        <SimpleCard id="04" icon={<Microscope/>} title="Fundamentals" desc="Learn 5 simple steps to find strong companies to invest in." />
                        <SimpleCard id="05" icon={<BarChart3/>} title="Technical Basics" desc="Different types of charts, candlesticks pattern, Dow Theory, Indicators" />
                        <SimpleCard id="06" icon={<Target/>} title="Breakout Strategy" desc="The clean price-action strategy we use every day to enter trades." />
                        <SimpleCard id="07" icon={<ShieldCheck/>} title="Risk Management" desc="The 1% Rule, Position Sizing and Capital Protection framework." />
                        <SimpleCard id="08" icon={<BookOpen/>} title="Trading Journal" desc="How to track your performance and become your own mentor." />
                    </div>
                </section>

                {/* 🗺️ Student Learning Path (Expectation Setting) */}
                <section id="path" className="mb-64">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading">Your Roadmap to Independence</h2>
                        <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">What to expect during your journey</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <PathStep 
                            num="01" 
                            title="The 90-Min Masterclass" 
                            desc="We break your old myths and install the basic 'Institutional Logic' foundation." 
                            tag="Live Orientation"
                        />
                        <PathStep 
                            num="02" 
                            title="Practical Assignments" 
                            desc="You don't just watch. You apply. Weekly tasks to find your first logic-based trade setup." 
                            tag="Skill Building"
                        />
                        <PathStep 
                            num="03" 
                            title="Independent Mastery" 
                            desc="Graduate from 'copy-pasting tips' to making your own confident market decisions." 
                            tag="The Goal"
                        />
                    </div>
                </section>

                {/* 🌈 8 Pillars Mastery */}
                <section id="curriculum" className="mb-64">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">The 8 Pillars of Mastery</h2>
                        <p className="text-subtitle text-lg">A logic-based system designed for absolute beginners.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <SimpleCard id="01" icon={<Zap/>} title="Reality Check" desc="Why most traders fail, hidden traps, and behavioural mistakes that blow up accounts." />
                        <SimpleCard id="02" icon={<Globe/>} title="Market Ecosystem" desc="How SEBI, Brokers, FIIs, and DIIs operate, and how big players drive movement." />
                        <SimpleCard id="03" icon={<LayoutGrid/>} title="Instruments" desc="Types of Financial instruments and types of instruments vehicles" />
                        <SimpleCard id="04" icon={<Microscope/>} title="Fundamentals" desc="Learn 5 simple steps to find strong companies to invest in." />
                        <SimpleCard id="05" icon={<BarChart3/>} title="Technical Basics" desc="Different types of charts, candlesticks pattern, Dow Theory, Indicators" />
                        <SimpleCard id="06" icon={<Target/>} title="Breakout Strategy" desc="The clean price-action strategy we use every day to enter trades." />
                        <SimpleCard id="07" icon={<ShieldCheck/>} title="Risk Management" desc="The 1% Rule, Position Sizing and Capital Protection framework." />
                        <SimpleCard id="08" icon={<BookOpen/>} title="Trading Journal" desc="How to track your performance and become your own mentor." />
                    </div>
                </section>

                {/* 🛡️ The Nivesh Link Method (Trust Building) */}
                <section id="methodology" className="mb-64">
                    <div className="glass-card rounded-[4rem] p-12 md:p-20 border-blue-500/10 bg-blue-500/[0.02]">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-10">
                                <h2 className="text-4xl md:text-6xl font-bold font-heading leading-tight">
                                    The <span className="text-blue-400">70/30</span> <br />
                                    Learning Rule
                                </h2>
                                <p className="text-readable text-xl leading-relaxed font-medium">
                                    Most platforms teach 100% theory. We flipped it. Our approach is designed for the modern retail trader who wants results, not a PhD in finance.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-black">30%</div>
                                        <div>
                                            <p className="font-bold text-lg">Core Logic & Framework</p>
                                            <p className="text-white/30 text-sm">The essential 'Why' behind every market move.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">70%</div>
                                        <div>
                                            <p className="font-bold text-lg">Live Market Application</p>
                                            <p className="text-white/30 text-sm">Testing the logic in the current market environment.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                                <div className="glass-card p-10 rounded-[3rem] space-y-8 relative z-10 text-center">
                                    <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Why This Works</h4>
                                    <p className="text-2xl font-bold font-heading italic leading-relaxed">"Knowledge without application is just noise. We focus on building your muscle memory for the markets."</p>
                                    <div className="flex justify-center gap-4">
                                        {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-blue-500/30" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🎓 Recognition of Progress (Humble Certificate) */}
                <section id="certification" className="mb-64">
                    <div className="glass-card rounded-[4rem] p-12 md:p-20 relative overflow-hidden group border-white/5 bg-white/[0.01]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none" />
                        
                        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
                            <div className="lg:w-1/2 space-y-10">
                                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 text-white/50 text-xs font-bold border border-white/10 uppercase tracking-widest">
                                    <Award size={14} /> Learning Milestone
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight">
                                    A Small Token of <br />
                                    <span className="text-emerald-500">Your Progress</span>
                                </h2>
                                <p className="text-readable text-xl leading-relaxed font-medium">
                                    This isn't about bragging rights. It's a personal reminder of the day you decided to stop gambling and start learning. Every participant receives a simple Certificate of Attendance.
                                </p>
                                <div className="space-y-4 text-white/30 font-bold text-sm">
                                    <div className="flex items-center gap-4 italic font-medium">
                                        <CheckCircle2 size={16} className="text-emerald-500/40" />
                                        Simple digital document for your records.
                                    </div>
                                    <div className="flex items-center gap-4 italic font-medium">
                                        <CheckCircle2 size={16} className="text-emerald-500/40" />
                                        A marker of your commitment to financial literacy.
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:w-1/2 relative flex justify-center">
                                <div className="relative z-10 w-full max-w-sm aspect-[1.4/1] bg-stone-100 rounded-lg shadow-2xl p-10 flex flex-col items-center justify-between text-zinc-900 border-[12px] border-zinc-200">
                                    <div className="text-center space-y-2">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                            <TrendingUp className="text-white" size={16} strokeWidth={3}/>
                                        </div>
                                        <h4 className="text-sm font-black tracking-[0.3em] text-zinc-400">CERTIFICATE OF ATTENDANCE</h4>
                                        <h5 className="text-xs font-medium italic text-zinc-500 pb-4">This is to acknowledge the participation of</h5>
                                        <div className="w-32 h-px bg-zinc-300 mx-auto" />
                                        <p className="text-xl font-bold font-heading pt-4 text-zinc-800">[Your Name]</p>
                                        <div className="w-48 h-px bg-zinc-300 mx-auto" />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 max-w-[200px] text-center italic">"For completing the Nivesh Link orientation on market logic and risk psychology."</p>
                                    <div className="flex justify-between w-full pt-6 text-[8px] font-bold text-zinc-300">
                                        <span className="border-t border-zinc-200 pt-2 px-4 uppercase tracking-widest text-zinc-400">Nivesh Link Team</span>
                                        <span className="border-t border-zinc-200 pt-2 px-4 uppercase tracking-widest text-zinc-400">{WEBINAR_DATE_DISPLAY}</span>
                                    </div>
                                </div>
                                <div className="absolute -inset-4 bg-emerald-500/10 blur-[60px] -z-10 rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🎁 NEW: Exclusive Bonuses */}
                <section id="bonuses" className="mb-64">
                    <div className="glass-card rounded-[4rem] p-12 md:p-20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none group-hover:scale-125 transition-transform" />
                        
                        <div className="flex flex-col lg:flex-row items-center gap-20">
                            <div className="lg:w-1/2 space-y-10">
                                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold">
                                    <Gift size={18} /> Exclusive Bonus Package
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight">
                                    Get Extras Worth <br />
                                    <span className="text-gradient-amber-rose">₹5,000</span> for FREE!
                                </h2>
                                <p className="text-readable text-xl leading-relaxed font-medium">
                                    Register before the session and unlock our elite membership toolkit to accelerate your learning.
                                </p>
                            </div>
                            
                            <div className="lg:w-1/2 grid gap-6 w-full">
                                <BonusItem title="The Trading Blueprint E-Book" value="₹999" desc="A comprehensive guide to market psychology and institutional patterns." color="emerald" />
                                <BonusItem title="Elite Professional Journaling Tool" value="₹2,500" desc="Our exclusive logging system to master your psychology and track every move." color="amber" />
                                <BonusItem title="30% OFF: Live Mentorship Cohort" value="₹1,500" desc="Direct access to our next advanced mentorship series at a member-only price." color="rose" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who It Is For */}
                <section id="who-it-is-for" className="mb-64">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">Who This Webinar Is For</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <WhyItem icon={<CheckCircle2/>} text="Absolute Beginners" />
                        <WhyItem icon={<CheckCircle2/>} text="College Students" />
                        <WhyItem icon={<CheckCircle2/>} text="Working Professionals" />
                        <WhyItem icon={<CheckCircle2/>} text="New Retail Traders" />
                    </div>
                </section>

                {/* 🎯 The Path to Professional Independence (Comparison) */}
                <section id="comparison" className="mb-64">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading">Choose Your Path</h2>
                        <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">From Foundation to Professional Mastery</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Smart Niveshak */}
                        <div className="glass-card rounded-[4rem] p-12 border border-white/5 space-y-12 hover:border-emerald-500/20 transition-all flex flex-col">
                            <div className="space-y-6">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                    <Zap size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold font-heading">Smart Niveshak</h3>
                                    <p className="text-emerald-500/60 font-black uppercase tracking-widest text-[10px] mt-2">The Absolute Foundation</p>
                                </div>
                                <p className="text-readable text-lg font-medium opacity-60">
                                    Perfect for those starting from zero. We build your core logic and market discipline over 4 weeks.
                                </p>
                            </div>

                            <div className="space-y-4 flex-1">
                                <p className="font-bold text-sm uppercase tracking-widest text-white/20 mb-6">Core Outcome</p>
                                <div className="flex items-center gap-4 text-readable font-medium">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <span>Market Logic & Instruments</span>
                                </div>
                                <div className="flex items-center gap-4 text-readable font-medium">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <span>Technical & Fundamental Basics</span>
                                </div>
                                <div className="flex items-center gap-4 text-readable font-medium">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <span>Capital Protection Framework</span>
                                </div>
                            </div>

                            <Link to="/courses/smart-niveshak" className="bg-emerald-500 text-black py-5 rounded-2xl font-black text-center hover:bg-emerald-400 transition-all shadow-[0_15px_40px_rgba(16,185,129,0.2)]">
                                Learn More (₹6,000)
                            </Link>
                        </div>

                        {/* Elite Niveshak */}
                        <div className="glass-card rounded-[4rem] p-12 border border-amber-500/20 bg-amber-500/[0.02] space-y-12 hover:border-amber-500/40 transition-all flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[80px] pointer-events-none" />
                            <div className="space-y-6">
                                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                                    <Crown size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold font-heading">Elite Niveshak</h3>
                                    <p className="text-amber-500/60 font-black uppercase tracking-widest text-[10px] mt-2">Professional Mastery</p>
                                </div>
                                <p className="text-readable text-lg font-medium opacity-60">
                                    For those who want independence. 12 weeks of advanced institutional logic, options, and live trading.
                                </p>
                            </div>

                            <div className="space-y-4 flex-1">
                                <p className="font-bold text-sm uppercase tracking-widest text-white/20 mb-6">Mastery Outcome</p>
                                <div className="flex items-center gap-4 text-readable font-medium">
                                    <Star size={18} className="text-amber-500" />
                                    <span>Institutional Breakout Logic</span>
                                </div>
                                <div className="flex items-center gap-4 text-readable font-medium">
                                    <Star size={18} className="text-amber-500" />
                                    <span>Advanced Options Strategies</span>
                                </div>
                                <div className="flex items-center gap-4 text-readable font-medium">
                                    <Star size={18} className="text-amber-500" />
                                    <span>Live Execution & Portfolio Building</span>
                                </div>
                            </div>

                            <Link to="/courses/elite-niveshak" className="bg-amber-500 text-black py-5 rounded-2xl font-black text-center hover:bg-amber-400 transition-all shadow-[0_15px_40px_rgba(245,158,11,0.2)]">
                                Join Mastery (₹20,000)
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 💬 Testimonials Section */}
                <section id="testimonials" className="mb-64">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading">What Our Students Say</h2>
                        <p className="text-white/30">Real feedback from real traders.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { quote: "I was skeptical at first, but the logic-based teaching changed everything for me. Highly recommended!", name: "Rahul S." },
                            { quote: "The breakout strategy is a game changer. I've finally found consistency in my trades.", name: "Priya M." },
                            { quote: "Best 90 minutes spent on my financial education. Clear, concise, and professional.", name: "Amit K." }
                        ].map((t, i) => (
                            <div key={i} className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 hover:border-emerald-500/20 transition-all flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} className="fill-emerald-500 text-emerald-500" />)}
                                    </div>
                                    <p className="text-readable text-lg font-medium italic leading-relaxed">"{t.quote}"</p>
                                </div>
                                <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">
                                        {t.name[0]}
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ❓ FAQ Section */}
                <section id="faq" className="mb-64 max-w-4xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl font-bold font-heading">Common Questions</h2>
                        <p className="text-white/30">Everything you need to know before joining.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Is this suitable for absolute beginners?", a: "Yes! We start from the very basics (zero knowledge) and move towards institutional logic in just 90 minutes." },
                            { q: "Will I get a recording of the session?", a: "Definitely. All registered participants receive the session recording and bonus materials via email/WhatsApp." },
                            { q: "Do I need a laptop to join the webinar?", a: "No, you can join using your mobile phone. We recommend a quiet place and a notebook for the best experience." },
                            { q: "Is there any support available after the webinar?", a: "Yes, you'll get access to our support community where you can ask questions directly to the mentor." }
                        ].map((item, i) => (
                            <div key={i} className="glass-card rounded-3xl overflow-hidden active:scale-[0.99] transition-transform">
                                <button 
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-bold text-lg pr-8">{item.q}</span>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                        {openFaq === i ? <Minus size={16}/> : <Plus size={16}/>}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-8 pb-8 text-readable leading-relaxed font-medium"
                                        >
                                            {item.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>


                {/* Why Different */}
                <section className="mb-64">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">Why This Is Different</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <DiffCard icon={<LayoutGrid/>} title="Structured & Logical" desc="No random tips. You get a complete, end-to-end system from Day 1." />
                        <DiffCard icon={<Sparkles/>} title="Result Oriented" desc="100% focus on practical profits and protecting your hard-earned capital." />
                        <DiffCard icon={<TrendingUp/>} title="Real Experience" desc="Based on 5+ years of actual market trading and confirmed institutional logic." />
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 pt-24 pb-48">
                    <div className="grid md:grid-cols-3 gap-24 mb-24">
                        <div className="space-y-8 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="text-black" size={20} strokeWidth={3}/>
                                </div>
                                <span className="text-3xl font-bold font-heading tracking-tight">{BRAND_NAME}</span>
                            </div>
                            <p className="text-subtitle text-sm leading-relaxed max-w-xs mx-auto md:mx-0">Empowering everyday people with professional-grade trading wisdom.</p>
                        </div>
                        
                        <div className="space-y-8 text-center md:text-left">
                            <h4 className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Priority Help</h4>
                            <div className="space-y-4 text-readable font-semibold">
                                <p className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors cursor-default">
                                    <Phone size={16} className="text-emerald-500/50" /> 9372333879
                                </p>
                                <p className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors cursor-default lowercase">
                                    <Mail size={16} className="text-emerald-500/50" /> niveshlink.edu@gmail.com
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8 text-center md:text-left">
                            <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Educational Programs</h4>
                            <div className="flex flex-col gap-4 text-sm text-white/30 font-bold">
                                <Link to="/courses/smart-niveshak" className="hover:text-white transition-colors">Smart Niveshak (Foundation)</Link>
                                <Link to="/courses/elite-niveshak" className="hover:text-white transition-colors">Elite Niveshak (Mastery)</Link>
                                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center pt-16 border-t border-white/5">
                        <p className="text-[11px] font-bold text-white/10 uppercase tracking-widest">© {new Date().getFullYear()} Nivesh Link intelligence Wing</p>
                    </div>
                </footer>

            </main>
        </div>
    );
}

function SimpleCard({ id, icon, title, desc }: any) {
    return (
        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 group hover:translate-y-[-8px] transition-all cursor-default text-center md:text-left">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 transition-transform mx-auto md:mx-0">
                {icon}
            </div>
            <div className="text-xs font-bold text-white/10 mb-2 tracking-widest">{id}</div>
            <h4 className="text-2xl font-bold font-heading mb-4 leading-tight">{title}</h4>
            <p className="text-subtitle text-base leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function DiffCard({ icon, title, desc }: any) {
    return (
        <div className="glass-card rounded-[2.5rem] p-10 space-y-6 hover:border-white/20 transition-all h-full">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                {icon}
            </div>
            <h4 className="text-2xl font-bold font-heading text-white">{title}</h4>
            <p className="text-subtitle leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function WhyItem({ icon, text }: any) {
    return (
        <div className="flex items-center gap-4 text-white/70 font-bold bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all h-full">
            <div className="text-emerald-500 shrink-0">{icon}</div>
            <span className="text-lg leading-tight">{text}</span>
        </div>
    );
}

function BonusItem({ title, value, desc, color = "emerald" }: any) {
    const colorClasses: any = {
        emerald: "bg-emerald-500/5 border-emerald-500/30 text-emerald-500",
        amber: "bg-amber-500/5 border-amber-500/30 text-amber-500",
        rose: "bg-rose-500/5 border-rose-500/30 text-rose-500"
    };
    
    return (
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.08] transition-all group">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className={`text-${color}-500`} size={18} />
                    <h4 className="font-bold text-lg md:text-xl">{title}</h4>
                </div>
                <p className="text-subtitle font-medium text-xs md:text-sm pl-7">{desc}</p>
            </div>
            <div className={`px-6 py-2 rounded-full border ${colorClasses[color]} font-black text-sm shrink-0 self-start md:self-center group-hover:scale-105 transition-transform`}>
                FREE {value}
            </div>
        </div>
    );
}

function Phone({ size = 16, className = "" }: any) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}

function Mail({ size = 16, className = "" }: any) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}

function PathStep({ num, title, desc, tag }: any) {
    return (
        <div className="glass-card rounded-[2.5rem] p-10 space-y-6 relative overflow-hidden group border-white/5 bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] pointer-events-none" />
            <div className="flex items-center justify-between">
                <div className="text-4xl font-black text-white/10 font-heading">{num}</div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                    {tag}
                </div>
            </div>
            <h4 className="text-2xl font-bold font-heading">{title}</h4>
            <p className="text-subtitle font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function TimeBox({ value, label, color }: any) {
    const colors: any = {
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    };

    return (
        <div className={`flex flex-col items-center justify-center w-16 md:w-24 h-16 md:h-24 rounded-2xl md:rounded-3xl border ${colors[color]} glass-pill`}>
            <span className="text-xl md:text-3xl font-black">{value.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-60 mt-1">{label}</span>
        </div>
    );
}
