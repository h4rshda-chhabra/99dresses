import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MarketTicker from '../components/MarketTicker';

const LandingPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/items');
                const data = await response.json();
                if (response.ok) {
                    // Filter out current user's items for the "Discover" feed if logged in
                    const displayItems = user
                        ? data.filter(item => item.ownerId !== user?._id && item.status !== 'SWAPPED')
                        : data.filter(item => item.status !== 'SWAPPED');
                    setItems(displayItems);
                }
            } catch (err) {
                console.error("Home fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [user]);

    const categories = ['All', 'Dress', 'Top', 'Skirt', 'Other'];
    const filteredItems = activeCategory === 'All'
        ? items
        : items.filter(i => i.category === activeCategory);

    // LOGGED OUT VIEW (The high-impact Hero)
    if (!user) {
        return (
            <div className="min-h-screen w-full bg-slate-950 overflow-auto">
                {/* Hero Section */}
                <div className="relative min-h-screen flex items-center justify-center px-6">
                    {/* Floating Elements from Canva Design */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cherry/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-hibiscus/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 text-center max-w-4xl animate-slide-up">
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-full border border-white/10 mb-8">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-sm text-slate-300 font-bold uppercase tracking-widest">99Dresses 2.0, Reimagined</span>
                        </div>

                        <h1 className="font-display text-3xl md:text-6xl font-black mb-6">
                            <span className="text-white">Swap. Bid.</span>
                            <br />
                            <span className="text-white">Shine.</span>
                        </h1>

                        <p className="text-2xl md:text-3xl text-slate-300 mb-12 font-light leading-relaxed">
                            The revolutionary hybrid marketplace for circular fashion.
                            <br />
                            <span className="font-black text-cosmos uppercase tracking-widest text-sm">Real value. Real fashion.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/register" className="btn-primary px-12 py-5 rounded-full text-xl font-black text-white animate-pulse-glow shadow-2xl">
                                Start Trading
                            </Link>
                            <Link to="/login" className="px-12 py-5 rounded-full text-xl font-black glass hover:bg-white/10 transition-all border-2 border-white/20">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="py-32 px-6 bg-gradient-to-b from-transparent to-slate-900/50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="font-display text-5xl font-white text-white text-center mb-4 gradient-text">How It Works</h2>
                        <p className="text-slate-400 text-center mb-16 text-xl font-bold uppercase tracking-widest">Two ways to trade. Infinite possibilities.</p>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Auction Mode */}
                            <div className="bg-slate-800/60 backdrop-blur-sm rounded-[3rem] p-12 card-hover border-2 border-cosmos/30">
                                <div className="text-sm font-black text-cosmos mb-8 uppercase tracking-widest italic">Auction Protocol</div>
                                <h3 className="font-display text-4xl font-black mb-6 text-cosmos">Bid with Credits</h3>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium">
                                    Use your credits to bid on items you love. Our auction model ensures market-driven pricing and fair deals for every piece in the vault.
                                </p>
                                <ul className="space-y-4 font-bold">
                                    <li className="flex items-center gap-4 text-white"><span className="text-cosmos text-sm font-black">[✓]</span> Competitive Auctions</li>
                                    <li className="flex items-center gap-4 text-white"><span className="text-cosmos text-sm font-black">[✓]</span> Dynamic Market Values</li>
                                    <li className="flex items-center gap-4 text-white"><span className="text-cosmos text-sm font-black">[✓]</span> Secure Credit Escrow</li>
                                </ul>
                            </div>

                            {/* Swap Mode */}
                            <div className="bg-slate-800/60 backdrop-blur-sm rounded-[3rem] p-12 card-hover border-2 border-cosmos/30">
                                <div className="text-sm font-black text-cosmos mb-8 uppercase tracking-widest italic">Barter System</div>
                                <h3 className="font-display text-4xl font-black mb-6 text-cosmos">Direct Swap</h3>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium">
                                    Offer treasures from your own closet in exchange for a piece you covet. True barter at its finest—no credits needed, just mutual style.
                                </p>
                                <ul className="space-y-4 font-bold">
                                    <li className="flex items-center gap-4 text-white"><span className="bg-cosmos/20 text-cosmos p-1 rounded-full text-xs">[✓]</span> Item-for-Item Barter</li>
                                    <li className="flex items-center gap-4 text-white"><span className="bg-cosmos/20 text-cosmos p-1 rounded-full text-xs">[✓]</span> Zero Transaction Cost</li>
                                    <li className="flex items-center gap-4 text-white"><span className="bg-cosmos/20 text-cosmos p-1 rounded-full text-xs">[✓]</span> Real-time Negotiation Chat</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LOGGED IN VIEW (DISCOVER FEED)
    return (
        <div className="min-h-screen bg-slate-950 font-body">
            {/* Cherry Red Header Background */}
            <div className="bg-cherry">
                {/* Header Content */}
                <div className="py-20 px-6 pb-28">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="animate-slide-up">
                            <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-4">Hello, <span className="text-white">{user.name.split(' ')[0]}</span>!</h1>
                            <p className="text-white/80 text-xl font-medium max-w-2xl">
                                The trendsetters have been busy. See what's new in the vault.
                            </p>
                        </div>
                        <div className="hidden md:flex gap-4">
                            <div className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-[2rem] text-center border border-white/20">
                                <div className="text-sm font-black text-white/70 uppercase tracking-widest mb-1">Balance</div>
                                <div className="text-3xl font-black text-white">{user.credits} <span className="text-sm opacity-50">CR</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Market Ticker */}
                <div className="pb-20">
                    <MarketTicker />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
                {/* Search & Categories */}
                <div className="bg-slate-800 p-4 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-4 items-center mb-16 border border-slate-700 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex-1 w-full bg-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 border border-white/5 focus-within:border-cherry/50 transition-all">
                        <input type="text" placeholder="Search brands, styles, or categories..." className="bg-transparent w-full outline-none text-white font-medium placeholder-slate-500" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-8 py-3 rounded-2xl font-black transition-all uppercase tracking-tighter text-sm ${activeCategory === cat
                                    ? 'bg-cherry text-white shadow-xl shadow-cherry/20'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-12">
                    <h2 className="font-display text-3xl font-black text-white flex items-center gap-4">
                        Discover Feed
                        <span className="h-0.5 w-24 bg-cherry"></span>
                    </h2>
                    <Link to="/browse" className="text-cosmos font-black uppercase tracking-widest text-sm hover:underline">View All &rarr;</Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse glass rounded-[2.5rem] h-96"></div>
                        ))}
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                        {filteredItems.map((item, idx) => (
                            <Link to={`/items/${item.id}`} key={item.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                                <div className="glass rounded-[2.5rem] overflow-hidden card-hover border-white/5 p-3 group">
                                    <div className="h-72 rounded-[2rem] bg-slate-900 relative overflow-hidden">
                                        {item.images && item.images[0] ? (
                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs font-black text-slate-700 uppercase tracking-widest opacity-20 group-hover:opacity-40 transition-opacity">NO IMAGE</div>
                                        )}
                                        {/* Fair Value Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-cosmos shadow-xl uppercase tracking-tighter">
                                                Fair Value: {item.price}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-black text-white text-xl truncate group-hover:text-white transition-colors uppercase tracking-tight">{item.title}</h3>
                                        </div>
                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-cosmos flex items-center justify-center text-[8px] font-black text-white shadow-lg uppercase tracking-widest">Vault</div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Seller #{item.ownerId.slice(-4)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[10px] font-black text-slate-500 uppercase">Current Bid</span>
                                                <span className="text-xl font-black text-white">{item.price}<span className="text-xs text-cosmos ml-1">CR</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 glass rounded-[4rem] border-white/5 px-6 mx-auto max-w-4xl mb-32">
                        <h3 className="font-display text-4xl font-black text-white mb-4 uppercase">The Vault is Quiet</h3>
                        <p className="text-slate-400 text-xl font-medium mb-12 max-w-lg mx-auto">
                            No active listings from other users yet. Why not set the trend yourself?
                        </p>
                        <Link to="/add-item" className="btn-primary px-12 py-5 rounded-full text-xl font-black text-white shadow-2xl">
                            List Your First Item
                        </Link>
                    </div>
                )}
            </div>
        </div >
    );
};

export default LandingPage;
