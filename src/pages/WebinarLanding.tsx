import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, CheckCircle2, Star, ShieldCheck, 
    MessageSquare, ArrowRight, Share2, Award, 
    Gift, Zap, Users, ChevronRight, Menu, X, Play,
    TrendingUp, LayoutGrid, Lock, ChevronDown, BookOpen, Microscope, Sparkles, HelpCircle, Plus, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, supabase } from '../lib/api';
import useCashfree from '../hooks/useCashfree';
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
    const WEBINAR_PRICE = 499;
    const WEBINAR_DATE_DISPLAY = "April 11, 2026";
    const WEBINAR_TIME_DISPLAY = "11:00 AM";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!formData.name || !formData.whatsapp) {
            document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        setIsProcessing(true);

        try {
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-cashfree-order', {
                body: { 
                    amount: WEBINAR_PRICE,
                    customer_details: {
                        customer_name: formData.name,
                        customer_phone: formData.whatsapp,
                        customer_email: formData.email || `${formData.whatsapp}@niveshlink.temp`
                    },
                    order_meta: {
                        return_url: `${window.location.origin}/payment-status?order_id={order_id}`
                    }
                }
            });

            if (orderError) throw new Error("Could not initialize payment. Please try again.");

            await openCheckout({
                amount: WEBINAR_PRICE,
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                isProduction: orderData.is_production,
                onSuccess: () => {
                    // Redirect is handled by return_url
                },
                onFailure: (err) => {
                    console.error("Payment failed:", err);
                    alert("Payment failed. Contact Support: 9372333879");
                }
            });

        } catch (err: any) {
            console.error('Registration error:', err);
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
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            <TrendingUp className="text-black" size={20} strokeWidth={3}/>
                        </div>
                        <span className="text-2xl font-bold tracking-tight font-heading">{BRAND_NAME}</span>
                    </div>

                    <div className="hidden md:flex gap-10 items-center text-sm font-semibold text-white/50">
                        <a href="#about" className="hover:text-emerald-400 transition-colors">Origins</a>
                        <a href="#curriculum" className="hover:text-blue-400 transition-colors">Blueprint</a>
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

            <main className="pt-48 max-w-7xl mx-auto px-6">
                
                {/* Hero Section */}
                <section className="text-center mb-64 relative">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-pill inline-flex items-center gap-3 px-6 py-2 rounded-full text-xs font-bold mb-10 text-emerald-500"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,1)]" /> 
                        Live Masterclass
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-[5rem] font-bold font-heading tracking-tight leading-[1.1] mb-10 max-w-5xl mx-auto px-4 md:px-0"
                    >
                        The Ultimate <br />
                        <span className="text-gradient-emerald-blue text-5xl md:text-[6rem]">Stock Market Blueprint</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/40 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-16 px-4 md:px-0"
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
                            className="bg-[#10b981] text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-bold text-xl md:text-2xl flex items-center gap-4 hover:bg-emerald-400 transition-all shadow-[0_20px_80px_rgba(16,185,129,0.3)] hover:translate-y-[-6px] active:scale-95 group relative overflow-hidden"
                        >
                            Register for ₹{WEBINAR_PRICE}
                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
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
                            <p className="text-xs font-bold text-white/40">Join 850+ trained traders</p>
                        </div>
                    </motion.div>
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
                            <p className="text-white/40 text-xl leading-relaxed">
                                Most beginners lose money not because the market is rigged, but because they **lack a structured approach**. They jump from strategy to strategy, never mastering one.
                            </p>
                            
                            <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-8 rounded-r-2xl">
                                <p className="text-emerald-500 text-lg font-bold">
                                    This 90-minute session cuts through the noise. No confusing jargon, no heavy theory—just a practical, step-by-step roadmap.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div id="register-section" className="glass-card rounded-[3rem] p-10 md:p-14 relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[80px] pointer-events-none group-hover:scale-150 transition-transform" />
                        
                        <div className="flex justify-between items-start mb-12 border-b border-white/5 pb-10">
                            <div>
                                <p className="text-white/20 text-xs font-bold uppercase tracking-wider mb-2">Confirmed Date</p>
                                <h3 className="text-3xl font-bold font-heading">{WEBINAR_DATE_DISPLAY}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-white/20 text-xs font-bold uppercase tracking-wider mb-2">Starts At</p>
                                <h3 className="text-3xl font-bold font-heading">{WEBINAR_TIME_DISPLAY}</h3>
                            </div>
                        </div>

                        <div className="space-y-4 bg-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
                            <div className="flex items-center justify-center gap-3 mb-6 bg-emerald-500/10 py-2 rounded-full">
                                <Lock size={14} className="text-emerald-500" />
                                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">100% Secure Checkout</p>
                            </div>
                            
                            <input 
                                className="w-full bg-black/40 border border-white/10 text-white px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20 font-medium text-base md:text-lg"
                                placeholder="Enter Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                            <input 
                                className="w-full bg-black/40 border border-white/10 text-white px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20 font-medium text-base md:text-lg"
                                placeholder="Enter WhatsApp Number"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                            />
                            <button 
                                onClick={handleRegister}
                                disabled={isProcessing}
                                className="w-full bg-[#10b981] text-white py-5 md:py-6 rounded-xl md:rounded-[1.5rem] font-bold text-lg md:text-xl hover:bg-emerald-400 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(16,185,129,0.3)]"
                            >
                                {isProcessing ? 'Connecting...' : 'Secure My Spot Now'}
                                <ChevronDown size={20} />
                            </button>
                            <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-widest mt-4">No risk. 100% Satisfaction Guaranteed.</p>
                        </div>
                    </div>
                </section>

                {/* 🌈 8 Pillars Mastery */}
                <section id="curriculum" className="mb-64">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">The 8 Pillars of Mastery</h2>
                        <p className="text-white/30 text-lg">A logic-based system designed for absolute beginners.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <SimpleCard id="01" icon={<Zap/>} title="Reality Check" desc="Why most traders lose and how to avoid the hidden traps of the market." />
                        <SimpleCard id="02" icon={<Globe/>} title="Market Ecosystem" desc="Understanding how big institutions move price and where you fit in." />
                        <SimpleCard id="03" icon={<LayoutGrid/>} title="Instruments" desc="F&O vs Equity: Choosing the right vehicle for your specific capital size." />
                        <SimpleCard id="04" icon={<Microscope/>} title="Fundamental 5" desc="The 5-step checklist to identify potential high-growth companies easily." />
                        <SimpleCard id="05" icon={<BarChart3/>} title="Technical Basics" desc="Learning only what works: Price action, support, and resistance simplified." />
                        <SimpleCard id="06" icon={<Target/>} title="Breakout Strategy" desc="The exact setup to enter high-confidence trades before price runs up." />
                        <SimpleCard id="07" icon={<ShieldCheck/>} title="Risk Management" desc="Protecting your capital. Never take a trade that can hurt your life." />
                        <SimpleCard id="08" icon={<BookOpen/>} title="Trading Journal" desc="The habit that builds wealth. How to track and learn from every trade." />
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
                                <p className="text-white/40 text-xl leading-relaxed font-medium">
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

                {/* ❓ NEW: FAQ Section */}
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
                                            className="px-8 pb-8 text-white/40 leading-relaxed font-medium"
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
                            <p className="text-white/20 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">Empowering everyday people with professional-grade trading wisdom.</p>
                        </div>
                        
                        <div className="space-y-8 text-center md:text-left">
                            <h4 className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Priority Help</h4>
                            <div className="space-y-4 text-white/40 font-semibold">
                                <p className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors cursor-default">
                                    <Phone size={16} className="text-emerald-500/50" /> 9372333879
                                </p>
                                <p className="flex items-center justify-center md:justify-start gap-3 hover:text-white transition-colors cursor-default lowercase">
                                    <Mail size={16} className="text-emerald-500/50" /> niveshlink.edu@gmail.com
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8 text-center md:text-left">
                            <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Official</h4>
                            <div className="flex flex-col gap-4 text-sm text-white/30 font-bold">
                                <a href="#" className="hover:text-white transition-colors">Safety Protocols</a>
                                <a href="#" className="hover:text-white transition-colors">Privacy Shield</a>
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
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 text-emerald-500 group-hover:scale-110 transition-transform mx-auto md:mx-0">
                {icon}
            </div>
            <div className="text-xs font-bold text-white/10 mb-2 uppercase tracking-widest">{id}</div>
            <h4 className="text-2xl font-bold font-heading mb-4 leading-tight">{title}</h4>
            <p className="text-white/30 text-base leading-relaxed font-medium">{desc}</p>
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
            <p className="text-white/30 leading-relaxed font-medium">{desc}</p>
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
                <p className="text-white/30 font-medium text-xs md:text-sm pl-7">{desc}</p>
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
