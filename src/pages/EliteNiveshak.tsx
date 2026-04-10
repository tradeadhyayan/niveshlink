import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, ArrowRight, BookOpen, 
    Target, Zap, Users, ShieldCheck, 
    Calendar, Clock, Globe, Award, Crown,
    TrendingUp, Microscope, BarChart3, Lock
} from 'lucide-react';
import { api } from '../lib/api';
import { useCashfree } from '../hooks/useCashfree';
import GlowBackground from '../components/GlowBackground';
import { Link } from 'react-router-dom';

const EliteNiveshak = () => {
    const { openCheckout } = useCashfree();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePurchase = async () => {
        setIsProcessing(true);
        try {
            const orderData = await api.webinar.createCashfreeOrder({
                amount: 20000,
                customer_details: {
                    customer_id: `elite_${Date.now()}`,
                    customer_name: 'Elite Niveshak Student',
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
                amount: 20000,
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                isProduction: orderData.is_production,
                onSuccess: () => {
                    console.log(`Successfully purchased Elite Niveshak`);
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
        <div className="min-h-screen bg-[#020202] text-white font-body selection:bg-amber-500/30 overflow-x-hidden relative">
            <GlowBackground />
            
            {/* Background Layers */}
            <div className="fixed inset-0 bg-grid opacity-5 pointer-events-none -z-10" />
            <div className="fixed inset-0 bg-page-gradient opacity-60 pointer-events-none -z-10" />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            <Crown className="text-black" size={20} strokeWidth={3}/>
                        </div>
                        <span className="text-2xl font-bold tracking-tight font-heading">Nivesh Link <span className="text-amber-500">Elite</span></span>
                    </Link>
                    <div className="flex gap-6 items-center">
                        <Link to="/courses" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">Courses</Link>
                        <button 
                            onClick={handlePurchase}
                            className="bg-amber-500 text-black px-6 py-2 rounded-full font-bold text-xs hover:bg-amber-400 transition-all active:scale-95 shadow-lg"
                        >
                            Get Elite Access
                        </button>
                    </div>
                </div>
            </nav>

            {/* 🔷 HERO SECTION */}
            <header className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
                            <Crown size={14} className="animate-pulse" /> Advanced Mastery
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-bold font-heading leading-[1.1] tracking-tight">
                            Elite Niveshak <br />
                            <span className="text-amber-500">Stock Market Program</span>
                        </h1>
                        
                        <p className="text-amber-100/60 text-xl font-medium leading-relaxed max-w-xl">
                            A comprehensive, institutional-grade program covering strategy, derivatives, and professional trade execution.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                <Calendar className="text-amber-500" size={24} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold leading-none mb-1">Schedule</p>
                                    <p className="font-bold text-sm">Live Weekends</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                <Clock className="text-amber-500" size={24} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold leading-none mb-1">Duration</p>
                                    <p className="font-bold text-sm">12-Session Mastery</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handlePurchase}
                                disabled={isProcessing}
                                className="w-full sm:w-auto bg-amber-500 text-black px-12 py-6 rounded-[2rem] font-bold text-2xl flex items-center justify-center gap-4 hover:bg-amber-400 transition-all shadow-[0_20px_80px_rgba(245,158,11,0.3)] hover:translate-y-[-4px] active:scale-95 group"
                            >
                                {isProcessing ? 'Processing' : 'Join Elite – ₹20,000'}
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden lg:flex justify-center relative scale-110"
                    >
                         <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full" />
                         <div className="glass-card w-[450px] aspect-[4/5] rounded-[4rem] p-1 items-center flex flex-col justify-center border-amber-500/20 group hover:border-amber-500/40 transition-all shadow-2xl overflow-hidden">
                              <div className="text-center space-y-8 p-12 relative z-10">
                                  <TrophyIcon className="mx-auto text-amber-500/30 group-hover:scale-110 transition-transform duration-700" />
                                  <div className="space-y-4">
                                      <h3 className="text-4xl font-black font-heading italic">PREMIUM</h3>
                                      <p className="text-white/20 font-black tracking-[0.5em] uppercase text-xs">Knowledge Power</p>
                                  </div>
                              </div>
                              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 blur-[40px] rounded-full" />
                         </div>
                    </motion.div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 space-y-48 pb-48">
                
                {/* 🎯 CORE HIGHLIGHTS */}
                <section className="relative">
                    <div className="glass-card p-12 md:p-24 border-white/5 rounded-[4rem] shadow-2xl overflow-hidden group">
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/5 blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                        
                        <div className="max-w-5xl mx-auto space-y-20">
                            <div className="text-center md:text-left space-y-8">
                                <h2 className="text-4xl md:text-7xl font-bold font-heading -tracking-widest">The Edge</h2>
                                <p className="text-amber-50/60 text-xl leading-relaxed max-w-3xl">
                                    Elite Niveshak is designed for individuals who understand basic concepts and want to move towards professional mastery with institutional strategies.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-12">
                                <HighLightItem icon={<TrendingUp/>} title="Deep Understanding" desc="Go beyond surface level to understand the actual mechanics of price movement." />
                                <HighLightItem icon={<Microscope/>} title="Strategy Focused" desc="Build a rule-based execution system that removes emotional bias." />
                                <HighLightItem icon={<Lock/>} title="Independence" desc="Stop relying on external calls. Learn to scan and find trades yourself." />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 📚 COMPLETE CURRICULUM */}
                <section className="space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-[5rem] font-bold font-heading italic tracking-tighter">Modular <span className="text-amber-500">Curriculum</span></h2>
                        <p className="text-amber-500/50 font-black uppercase tracking-[0.4em] text-[10px]">A comprehensive professional blueprint</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <CurriculumModule 
                            title="Basic Finance & Structure"
                            items={["Primary & secondary markets", "IPO process", "Mutual funds", "Market terminologies"]}
                        />
                        <CurriculumModule 
                            title="Economics & Impact"
                            items={["Macroeconomics fundamentals", "Inflation & interest rates", "Fiscal & monetary policy", "Economic cycles"]}
                        />
                        <CurriculumModule 
                            title="Industry & Company"
                            items={["Sector rotation", "Quantitative metrics", "Qualitative moats", "Ratio & valuation analysis"]}
                        />
                        <CurriculumModule 
                            title="Strategy Formation"
                            items={["Niveshak Link Logic", "High probability zones", "Trend identification", "Entry & exit rules"]}
                        />
                        <CurriculumModule 
                            title="Advanced Technicals"
                            items={["Candlestick mastery", "Indicators & oscillators", "Pro setups", "Journaling habits"]}
                        />
                        <CurriculumModule 
                            title="Derivatives & Options"
                            items={["Options & Greeks", "Open interest analysis", "Delta neutral introduction", "Hedging basics"]}
                        />
                        <CurriculumModule 
                            title="Commodity & Screeners"
                            items={["Commodity classification", "Inter-market impact", "Stock screener setup", "Personal filters"]}
                        />
                        <CurriculumModule 
                            title="Advanced Risk"
                            items={["Risk profiling", "Capital protection rules", "Using options for safety", "Portfolio sizing"]}
                        />
                        <CurriculumModule 
                            title="Professional Planning"
                            items={["Trading goal setting", "Personal trade plan", "Doubt clearing", "Community discussion"]}
                        />
                    </div>
                </section>

                {/* 💰 PRICING & FINAL CTA */}
                <section className="text-center space-y-16">
                    <div className="space-y-4">
                        <div className="text-7xl md:text-[8rem] font-bold font-heading tracking-tighter">₹20,000</div>
                        <p className="text-amber-500 font-black uppercase tracking-[0.5em] text-xs">FULL ELITE MEMBERSHIP FEE</p>
                    </div>

                    <div className="glass-card rounded-[4rem] p-12 md:p-24 max-w-4xl mx-auto space-y-12 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                         <div className="relative z-10 space-y-4">
                            <h3 className="text-4xl font-bold font-heading">Secure Your Legacy.</h3>
                            <p className="text-white/40 font-bold italic">Limited slots per cohort to ensure direct interaction.</p>
                         </div>
                         <button 
                            onClick={handlePurchase}
                            disabled={isProcessing}
                            className="relative z-10 bg-amber-500 text-black px-16 py-8 rounded-[2rem] font-bold text-3xl hover:bg-amber-400 transition-all shadow-[0_30px_100px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 group"
                         >
                            {isProcessing ? 'Processing' : 'Enroll in Elite Niveshak'}
                         </button>
                    </div>
                </section>

            </main>

            <footer className="py-20 text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.5em]">
                Elite Niveshak • Professional Grade Trading Education
            </footer>
        </div>
    );
};

const HighLightItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="space-y-6 group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.05] transition-all">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="space-y-3">
            <h4 className="font-bold text-2xl leading-tight">{title}</h4>
            <p className="text-white/40 text-base leading-relaxed">{desc}</p>
        </div>
    </div>
);

const CurriculumModule = ({ title, items }: { title: string, items: string[] }) => (
    <div className="glass-card p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group hover:bg-white/[0.05]">
        <h4 className="text-xl font-bold mb-8 group-hover:text-amber-500 transition-colors leading-tight">{title}</h4>
        <ul className="space-y-4">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-sm text-white/40 font-bold leading-relaxed">
                    <Check size={14} className="text-amber-500/40 mt-1 shrink-0" />
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

const TrophyIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
);

const Check = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

export default EliteNiveshak;
