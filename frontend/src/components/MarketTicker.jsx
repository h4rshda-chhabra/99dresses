import React from 'react';

const MarketTicker = () => {
    const marketEvents = [
        { type: 'SALE', text: 'Vintage Chanel Bag sold for 850 CR', time: '2m ago' },
        { type: 'BID', text: 'New bid on Gucci Loafers: 120 CR', time: '5m ago' },
        { type: 'LISTING', text: 'Just In: Dior Saddle Bag (Mint Condition)', time: '8m ago' },
        { type: 'TREND', text: 'Trending: Silk Scarves (+15% Demand)', time: '12m ago' },
        { type: 'SWAP', text: 'Successful Swap: Prada Tote ↔ LV Wallet', time: '15m ago' },
        { type: 'SALE', text: 'YSL Heels sold for 320 CR', time: '18m ago' },
    ];

    // Duplicate list for seamless infinite scroll
    const tickerItems = [...marketEvents, ...marketEvents, ...marketEvents];

    return (
        <div className="w-full bg-slate-900 border-y border-white/5 py-3 overflow-hidden relative z-20 pause-hover">
            <div className="flex animate-ticker gap-12 whitespace-nowrap pl-4">
                {tickerItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${item.type === 'SALE' ? 'bg-emerald-500/20 text-emerald-400' :
                            item.type === 'BID' ? 'bg-cherry/20 text-cherry' :
                                item.type === 'TREND' ? 'bg-amber-500/20 text-amber-400' :
                                    item.type === 'SWAP' ? 'bg-cosmos/20 text-cosmos' :
                                        'bg-slate-700 text-slate-300'
                            }`}>
                            {item.type}
                        </span>
                        <span className="text-xs font-bold text-slate-300 tracking-wide">
                            {item.text}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono">
                            {item.time}
                        </span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full ml-4"></span>
                    </div>
                ))}
            </div>
            {/* Gradient masks for smooth fading edges */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default MarketTicker;
