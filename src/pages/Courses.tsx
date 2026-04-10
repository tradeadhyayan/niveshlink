import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    TrendingUp, ShieldCheck, CheckCircle2, 
    ArrowRight, Crown, Zap, Target, Sparkles,
    Check, X, BadgeCheck, Trophy, Globe, Award
} from 'lucide-react';
import GlowBackground from '../components/GlowBackground';

export default function Courses() {
    const BRAND_NAME = "Nivesh Link";

    return (
        <div className="min-h-screen bg-[#020202] text-white font-body selection:bg-emerald-500/30 overflow-x-hidden relative">
            <GlowBackground />
            
            {/* Background Layers */}
            <div className="fixed inset-0 bg-grid opacity-5 pointer-events-none -z-10" />
            <div className="fixed top-[20%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="fixed bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Professional Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <TrendingUp className="text-black" size={20} strokeWidth={3}/>
                        </div>
                        <span className="text-xl md:text-2xl font-bold tracking-tight font-heading">{BRAND_NAME}</span>
                    </Link>
                    <Link to="/" className="bg-white/5 border border-white/10 px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest leading-none">Home</Link>
                </div>
            </nav>

            <main className="relative pt-32 md:pt-48 pb-32 max-w-7xl mx-auto px-4 md:px-6">
                
                {/* 🚀 Hero Section */}
                <section className="text-center mb-24 md:mb-40">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 md:space-y-10"
                    >
                        <div className="inline-flex items-center gap-3 px-4 md:px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={14} /> Structured Learning Paths
                        </div>
                        
                        <h1 className="text-4xl md:text-8xl font-bold font-heading leading-[1.1] tracking-tight max-w-4xl mx-auto">
                            Master the Market <br />
                            <span className="text-emerald-400">From Scratch</span>
                        </h1>
                        
                        <p className="text-emerald-100/60 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                            Take the next step in your financial journey with our structured, live weekend programs.
                        </p>
                    </motion.div>
                </section>

                {/* 🎯 Tier Selection Cards */}
                <section className="grid lg:grid-cols-2 gap-8 md:gap-10 mb-24 md:mb-48">
                    
                    {/* Smart Niveshak Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 md:p-16 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] relative group flex flex-col justify-between hover:border-emerald-500/20 transition-all"
                    >
                        <div className="space-y-8 md:space-y-10">
                            <div className="space-y-4">
                                <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 md:mb-6 font-bold">
                                    <Zap size={24} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold font-heading">Smart Niveshak</h2>
                                <p className="text-white/40 font-bold text-base md:text-lg italic">Perfect for Beginners</p>
                            </div>

                            <ul className="space-y-4 md:space-y-5">
                                <li className="flex items-center gap-3 md:gap-4 text-white/80 font-bold text-sm md:text-base">
                                    <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-emerald-500" />
                                    </div>
                                    <span>Live Weekend Cohort</span>
                                </li>
                                <li className="flex items-center gap-3 md:gap-4 text-white/80 font-bold text-sm md:text-base">
                                    <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-emerald-500" />
                                    </div>
                                    <span>Learn Basics from Scratch</span>
                                </li>
                                <li className="flex items-center gap-3 md:gap-4 text-white/80 font-bold text-sm md:text-base">
                                    <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-emerald-500" />
                                    </div>
                                    <span>Understand charts & indicators</span>
                                </li>
                            </ul>

                            <div className="pt-8 md:pt-10">
                                <div className="text-4xl md:text-5xl font-bold mb-8 md:mb-10 tracking-tight">₹6,000</div>
                                <Link 
                                    to="/courses/smart-niveshak" 
                                    className="block w-full text-center bg-white text-black py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl hover:bg-emerald-400 transition-all active:scale-95 group shadow-xl"
                                >
                                    Explore Program
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Elite Niveshak Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 md:p-16 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] relative group flex flex-col justify-between overflow-hidden hover:border-amber-500/20 transition-all"
                    >
                        <div className="absolute top-0 right-0 py-1.5 md:py-2 px-8 md:px-10 bg-amber-500 text-black font-black text-[8px] md:text-[10px] uppercase tracking-widest rotate-45 translate-x-10 translate-y-4 md:translate-y-6">Advanced</div>
                        
                        <div className="space-y-8 md:space-y-10">
                            <div className="space-y-4">
                                <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 md:mb-6 font-bold">
                                    <Crown size={24} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold font-heading">Elite Niveshak <br/><span className="text-amber-500 text-xl md:text-2xl uppercase tracking-widest">Program</span></h2>
                                <p className="text-white/40 font-bold text-base md:text-lg italic">For Professional Mastery</p>
                            </div>

                            <ul className="space-y-4 md:space-y-5">
                                <li className="flex items-center gap-3 md:gap-4 text-white/80 font-bold text-sm md:text-base">
                                    <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-amber-500" />
                                    </div>
                                    <span>Strategy & Institutional Logic</span>
                                </li>
                                <li className="flex items-center gap-3 md:gap-4 text-white/80 font-bold text-sm md:text-base">
                                    <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-amber-500" />
                                    </div>
                                    <span>Options & Hedging Mastery</span>
                                </li>
                                <li className="flex items-center gap-3 md:gap-4 text-white/80 font-bold text-sm md:text-base">
                                    <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Check size={12} className="text-amber-500" />
                                    </div>
                                    <span>Independent Trading System</span>
                                </li>
                            </ul>

                            <div className="pt-8 md:pt-10">
                                <div className="text-4xl md:text-5xl font-bold mb-8 md:mb-10 text-amber-500 tracking-tight">₹20,000</div>
                                <Link 
                                    to="/courses/elite-niveshak" 
                                    className="block w-full text-center bg-amber-500 text-black py-4 md:py-6 rounded-2xl font-bold text-lg md:text-xl hover:bg-amber-400 transition-all active:scale-95 group shadow-[0_20px_60px_rgba(245,158,11,0.3)]"
                                >
                                    Explore Mastery
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                </section>

                {/* ⚔️ Quick Comparison */}
                <section className="mb-24 md:mb-48 overflow-hidden">
                    <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold font-heading tracking-tight">Direct Comparison</h2>
                            <p className="text-white/20 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">Choose the best path for your growth</p>
                        </div>

                        <div className="glass-card rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5">
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-3 bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <div className="p-6 md:p-8">Feature</div>
                                        <div className="p-6 md:p-8 text-emerald-400">Smart</div>
                                        <div className="p-6 md:p-8 text-amber-500">Elite</div>
                                    </div>
                                    <ComparisonRow label="Curriculum" smart="Basics" elite="Advanced" />
                                    <ComparisonRow label="Technical Analysis" smart="Patterns" elite="Institutional" />
                                    <ComparisonRow label="Derivatives" smart="Intro" elite="Mastery" />
                                    <ComparisonRow label="Personal Plan" smart="No" elite="Yes" />
                                    <div className="grid grid-cols-3 p-8 md:p-10 bg-emerald-500/[0.02]">
                                        <div className="text-xs md:text-sm font-black uppercase text-white/20 self-center">Program Fee</div>
                                        <div className="text-2xl md:text-3xl font-bold text-emerald-400">₹6,000</div>
                                        <div className="text-2xl md:text-3xl font-bold text-amber-500">₹20,000</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Proof */}
                <section className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center glass-card p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/5">
                    <div className="space-y-2">
                        <div className="text-3xl md:text-5xl font-bold font-heading text-emerald-400">3,000+</div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Students</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-3xl md:text-5xl font-bold font-heading text-emerald-400">7+ Yrs</div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Experience</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <div className="text-3xl md:text-5xl font-bold font-heading text-emerald-400">LIVE</div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Training</p>
                    </div>
                </section>

            </main>

            <footer className="py-20 md:py-32 text-center opacity-30 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.5em] border-t border-white/5">
                {BRAND_NAME} Intelligence • Built for Results
            </footer>
        </div>
    );
}

const ComparisonRow = ({ label, smart, elite }: { label: string, smart: string, elite: string }) => (
    <div className="grid grid-cols-3 p-6 md:p-8 border-b border-white/5 text-sm md:text-base font-bold text-white/60 hover:bg-white/[0.02] transition-all">
        <div className="text-white/20">{label}</div>
        <div>{smart}</div>
        <div className="text-white">{elite}</div>
    </div>
);
