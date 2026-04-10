import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, ArrowRight, BookOpen, 
    Target, Zap, Users, ShieldCheck, 
    Calendar, Clock, Globe, Award 
} from 'lucide-react';
import { api } from '../lib/api';
import { useCashfree } from '../hooks/useCashfree';
import GlowBackground from '../components/GlowBackground';
import { Link } from 'react-router-dom';

const SmartNiveshak = () => {
    const { openCheckout } = useCashfree();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePurchase = async () => {
        setIsProcessing(true);
        try {
            const orderData = await api.webinar.createCashfreeOrder({
                amount: 6000,
                customer_details: {
                    customer_id: `smart_${Date.now()}`,
                    customer_name: 'Smart Niveshak Student',
                    customer_phone: '9999999999',
                    customer_email: 'student@niveshlink.temp',
                },
                order_meta: {
                    return_url: `${window.location.origin}/payment-status?order_id={order_id}`,
                },
            });

            if (!orderData?.payment_session_id) {
                throw new Error("Payment session failed");
            }

            await openCheckout({
                amount: 6000,
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                isProduction: orderData.is_production,
                onSuccess: () => {
                    console.log(`Successfully purchased Smart Niveshak`);
                },
                onFailure: (err) => {
                    alert(`Purchase failed: ${err.message}`);
                }
            });
        } catch (err) {
            console.error('Purchase error:', err);
            alert('Something went wrong during checkout.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white font-body selection:bg-emerald-500/30 overflow-x-hidden relative">
            <GlowBackground />
            
            {/* Background Layers */}
            <div className="fixed inset-0 bg-grid opacity-5 pointer-events-none -z-10" />
            <div className="fixed inset-0 bg-page-gradient opacity-60 pointer-events-none -z-10" />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <Globe className="text-black" size={20} strokeWidth={3}/>
                        </div>
                        <span className="text-2xl font-bold tracking-tight font-heading">Nivesh Link</span>
                    </Link>
                    <div className="flex gap-6 items-center">
                        <Link to="/courses" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">All Courses</Link>
                        <button 
                            onClick={handlePurchase}
                            className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs hover:bg-emerald-400 transition-all active:scale-95 shadow-lg"
                        >
                            Enroll Now
                        </button>
                    </div>
                </div>
            </nav>

            {/* 🔷 HERO SECTION */}
            <header className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                            <Award size={14} /> Official Program
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-bold font-heading leading-[1.1] tracking-tight">
                            Smart Niveshak <br />
                            <span className="text-emerald-400">Stock Market Program</span>
                        </h1>
                        
                        <p className="text-emerald-100/60 text-xl font-medium leading-relaxed max-w-xl">
                            A complete beginner-friendly program to understand stock market, trading basics, and investment principles from scratch.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                <Calendar className="text-emerald-500" size={24} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold leading-none mb-1">Schedule</p>
                                    <p className="font-bold text-sm">Live Weekends</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                <Clock className="text-emerald-500" size={24} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold leading-none mb-1">Duration</p>
                                    <p className="font-bold text-sm">12 Sessions (1 Hr)</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handlePurchase}
                                disabled={isProcessing}
                                className="w-full sm:w-auto bg-[#10b981] text-white px-12 py-6 rounded-[2rem] font-bold text-2xl flex items-center justify-center gap-4 hover:bg-emerald-400 transition-all shadow-[0_20px_60px_rgba(16,185,129,0.2)] hover:translate-y-[-4px] active:scale-95 group"
                            >
                                {isProcessing ? 'Processing...' : 'Enroll Now – ₹6,000'}
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden md:flex justify-center scale-110"
                    >
                        <div className="relative w-[400px] aspect-square glass-card rounded-[4rem] p-1 flex flex-col items-center justify-center border-emerald-500/20 group hover:border-emerald-500/40 transition-all shadow-2xl overflow-hidden">
                             <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full" />
                             <div className="text-center space-y-8 p-12 relative z-10">
                                <BookOpen className="mx-auto text-emerald-500/30 group-hover:scale-110 transition-transform duration-700" size={120} strokeWidth={1}/>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black font-heading italic">BEGINNER</h3>
                                    <p className="text-white/20 font-black tracking-[0.5em] uppercase text-xs">Foundation Program</p>
                                </div>
                             </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 space-y-48 pb-48">
                
                {/* 🎯 ABOUT THE PROGRAM */}
                <section className="relative">
                    <div className="glass-card p-12 md:p-24 border-white/5 rounded-[4rem] shadow-2xl overflow-hidden group">
                        <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                        
                        <div className="max-w-5xl mx-auto space-y-20">
                            <div className="text-center md:text-left space-y-8">
                                <h2 className="text-4xl md:text-7xl font-bold font-heading -tracking-widest">The Foundation</h2>
                                <p className="text-emerald-50/60 text-xl leading-relaxed max-w-3xl">
                                    Smart Niveshak is designed for individuals who are absolute beginners in the stock market. We build your knowledge brick-by-brick until you can trade with confidence.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-12">
                                <HighLightItem icon={<CheckCircle2/>} title="Zero Jargon" desc="No complex math or confusing words. We use simple, logic-based teaching." color="emerald" />
                                <HighLightItem icon={<Target/>} title="Practical First" desc="Learn by doing. We use real charts and real examples from the Indian market." color="emerald" />
                                <HighLightItem icon={<Zap/>} title="Quick Start" desc="Designed to get you from 'no idea' to 'first trade' with structured rules." color="emerald" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 📚 COURSE CURRICULUM */}
                <section className="space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-[5rem] font-bold font-heading italic tracking-tighter">Modular <span className="text-emerald-400">Curriculum</span></h2>
                        <p className="text-emerald-500/50 font-black uppercase tracking-[0.4em] text-[10px]">Step-by-step learning roadmap</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <CurriculumModule title="Market Introduction" items={["Asset classes overview", "The power of equity", "Market players", "Sensex & Nifty basics", "Corporate actions"]} />
                        <CurriculumModule title="Technical Basics" items={["Intro to TA", "Chart types simplified", "Basic indicators", "Price movement logic"]} />
                        <CurriculumModule title="Fundamental Basics" items={["Quality vs Quantity", "Management analysis", "Key ratios for beginners", "Growth potential"]} />
                        <CurriculumModule title="Derivatives Intro" items={["What are derivatives?", "Basic options logic", "Commodity市场 overview"]} />
                        <CurriculumModule title="Risk Mastery" items={["Risk profiling", "Entry rules for safety", "Position sizing", "Trading psychology"]} />
                        <CurriculumModule title="Wealth Management" items={["Wealth creation tips", "Asset allocation", "Power of compounding", "Long-term planning"]} />
                    </div>
                </section>

                {/* 👤 WHO SHOULD ENROLL? */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-card p-12 rounded-[4rem] border-white/5 space-y-10">
                         <h3 className="text-3xl font-bold font-heading flex items-center gap-4">
                            <Users size={32} className="text-emerald-500"/> Who Should Enroll?
                         </h3>
                         <div className="space-y-4">
                            {["Complete beginners", "Students & Professionals", "New Investors", "Self-learners seeking structure"].map((v, i) => (
                                <div key={i} className="flex items-center gap-4 text-white/60 font-bold p-5 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {v}
                                </div>
                            ))}
                         </div>
                    </div>
                    <div className="glass-card p-12 rounded-[4rem] border-white/5 flex flex-col justify-center text-center space-y-8">
                         <h3 className="text-3xl font-bold font-heading">What You Get</h3>
                         <div className="flex flex-wrap justify-center gap-4">
                            {["Live cohort training", "Doubt sessions", "Rule-based systems", "Community access", "Bonus materials"].map((v, i) => (
                                <span key={i} className="bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-widest">{v}</span>
                            ))}
                         </div>
                    </div>
                </div>

                {/* 💰 PRICING & FINAL CTA */}
                <section className="text-center py-20">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <div className="space-y-4">
                            <div className="text-6xl md:text-[8rem] font-bold font-heading tracking-tighter">₹6,000</div>
                            <p className="text-emerald-500 font-black uppercase tracking-[0.5em] text-xs">All-Inclusive Program Fee</p>
                        </div>
                        
                        <div className="glass-card rounded-[4rem] p-12 md:p-24 space-y-12 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                             <div className="relative z-10 space-y-4">
                                <h3 className="text-4xl font-bold font-heading">Start Your Journey Today.</h3>
                                <p className="text-white/40 font-bold italic">Building the future of trading, one student at a time.</p>
                             </div>
                             <button 
                                onClick={handlePurchase}
                                disabled={isProcessing}
                                className="relative z-10 bg-white text-black px-16 py-8 rounded-[2rem] font-bold text-3xl hover:bg-emerald-400 transition-all shadow-2xl hover:scale-105 active:scale-95 group"
                             >
                                {isProcessing ? 'Processing' : 'Join Smart Niveshak'}
                             </button>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="py-20 text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.5em] border-t border-white/5">
                Nivesh Link Education • Build With Purpose
            </footer>
        </div>
    );
};

const HighLightItem = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => (
    <div className="space-y-6 group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all">
        <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="space-y-3">
            <h4 className="font-bold text-2xl leading-tight">{title}</h4>
            <p className="text-white/40 text-base leading-relaxed">{desc}</p>
        </div>
    </div>
);

const CurriculumModule = ({ title, items }: { title: string, items: string[] }) => (
    <div className="glass-card p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/20 transition-all group hover:bg-white/[0.05]">
        <h4 className="text-xl font-bold mb-8 group-hover:text-emerald-400 transition-colors leading-tight">{title}</h4>
        <ul className="space-y-4">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-sm text-white/40 font-bold leading-relaxed">
                    <Check size={14} className="text-emerald-500/40 mt-1 shrink-0" />
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

const Check = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

export default SmartNiveshak;
