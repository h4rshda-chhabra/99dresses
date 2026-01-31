import React from 'react';

const MyBidsPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-body pb-20">
            <div className="max-w-7xl mx-auto px-6 pt-16">
                <header className="mb-16 animate-slide-up">
                    <span className="text-cosmos font-black uppercase text-[10px] tracking-[0.3em] mb-4 block">Personal Portfolio</span>
                    <h1 className="font-display text-7xl font-black mb-4 tracking-tighter uppercase leading-none">Your Acquisitions</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Tracking your active proposals and strategic swaps</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Active Bids Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="w-10 h-10 glass border-white/10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-white">MKT</span>
                            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">Market Proposals</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Placeholder for real data integration */}
                            <div className="glass border border-white/5 p-8 rounded-[2.5rem] card-hover relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cosmos opacity-5 blur-[50px]"></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-white text-xl uppercase tracking-tighter mb-1">Floral Summer Dress</h3>
                                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest leading-none">Auction ID: #4402</p>
                                    </div>
                                    <span className="bg-cosmos/10 text-cosmos text-[8px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                                        WINNING BID
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-4xl font-black text-white tracking-tighter">40</span>
                                    <span className="text-[10px] font-black text-cosmos uppercase tracking-widest italic">CREDITS</span>
                                </div>
                                <button className="w-full glass border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                                    VIEW ITEM STATUS
                                </button>
                            </div>

                            <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-30">
                                <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest leading-relaxed">Further bidding activity<br />will be logged in this secure vault</p>
                            </div>
                        </div>
                    </div>

                    {/* Swap Requests Section */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="w-10 h-10 glass border-white/10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-cosmos">SWP</span>
                            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-cosmos">Inventory Exchanges</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="glass border border-white/5 p-8 rounded-[2.5rem] card-hover relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cosmos opacity-5 blur-[50px]"></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-white text-xl uppercase tracking-tighter mb-1">Vintage Denim Jacket</h3>
                                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest leading-none">Requester: Jane Doe</p>
                                    </div>
                                    <span className="bg-cherry/10 text-white text-[8px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest">
                                        ACTION REQUIRED
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed italic tracking-tighter">"I'd love to swap my Silk Wrap for your classic denim."</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="bg-cosmos text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-cosmos/10">
                                        ACCEPT TRADE
                                    </button>
                                    <button className="glass border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] hover:bg-cherry/20 transition-all">
                                        DECLINE
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-30">
                                <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest leading-relaxed">Direct swaps are protected by<br />our premium exchange protocol</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBidsPage;
