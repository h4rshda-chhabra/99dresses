import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const BrowseItems = () => {
    const { user } = useContext(AuthContext);

    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['ALL', 'DRESSES', 'TOPS', 'BOTTOMS', 'OUTERWEAR', 'ACCESSORIES'];

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/items');
                const data = await response.json();

                if (response.ok) {
                    // Hide items listed by current user
                    const activeItems = data.filter(
                        i => i.status !== 'SWAPPED' && i.ownerId !== user?._id
                    );
                    setItems(activeItems);
                    setFilteredItems(activeItems);
                }
            } catch (err) {
                console.error("Error fetching items:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchItems();
    }, [user]);

    useEffect(() => {
        let result = items;

        if (selectedCategory !== 'ALL') {
            result = result.filter(i => i.category === selectedCategory);
        }

        if (searchQuery) {
            result = result.filter(i =>
                i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(result);
    }, [selectedCategory, searchQuery, items]);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body pb-20">
            <div className="max-w-7xl mx-auto px-6 pt-16">
                <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 animate-slide-up">
                    <div className="flex-1">
                        <span className="text-cosmos font-black uppercase text-[10px] tracking-[0.3em] mb-4 block">Curated Marketplace</span>
                        <h1 className="font-display text-7xl font-black mb-4 tracking-tighter uppercase leading-none">The Gallery</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Exceptional unique pieces from premium collectors</p>
                    </div>
                    <div className="w-full md:w-auto flex items-center gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="SEARCH THE VAULT..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="glass border-white/5 rounded-2xl w-64 h-14 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase focus:border-cherry/50 focus:ring-0 outline-none transition-all placeholder:text-slate-600"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-black uppercase">SRCH</span>
                        </div>
                        <Link to="/add-item" className="btn-primary h-14 flex items-center px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-cherry/20 hover:scale-105 transition-all">
                            + DROP ITEM
                        </Link>
                    </div>
                </header>

                <div className="flex flex-wrap gap-3 mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedCategory === cat
                                ? 'bg-white text-black shadow-xl'
                                : 'glass text-slate-500 border-white/5 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass rounded-[3rem] h-96 animate-pulse opacity-20" />
                        ))}
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {filteredItems.map((item, idx) => (
                            <div key={item.id} className="glass rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden transition-all hover:scale-[1.02] card-hover group relative">
                                <div className="absolute top-6 left-6 z-20">
                                    <div className="glass border border-white/10 px-3 py-1.5 rounded-full shadow-2xl">
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                            <span className="w-1.5 h-1.5 bg-cherry rounded-full"></span>
                                            AUTHENTIC
                                        </span>
                                    </div>
                                </div>

                                <div className="h-80 bg-slate-900 relative overflow-hidden p-3">
                                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
                                        {item.images?.[0] ? (
                                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-800 text-[10px] font-black uppercase tracking-widest opacity-20">NO IMAGE</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <span className="text-slate-500 font-black text-[8px] tracking-[0.2em] uppercase">{item.category}</span>
                                    <h3 className="font-black text-white text-xl mb-4 uppercase tracking-tighter truncate leading-none">{item.title}</h3>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-3xl font-black text-white tracking-tighter">
                                            {item.currentBid ?? item.startingBid ?? 0}
                                        </span>
                                        <span className="text-[10px] font-black text-cosmos uppercase tracking-widest italic">
                                            CURRENT BID
                                        </span>
                                    </div>

                                    <Link to={`/items/${item.id}`} className="block text-center glass border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                                        ACQUIRE ITEM
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 glass rounded-[4rem] border-dashed border-white/5 animate-fade-in px-10">
                        <h2 className="font-display text-4xl font-black text-white mb-4 uppercase tracking-tighter">The Vault is Silent</h2>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-12 italic">No pieces matching your criteria were found</p>
                        <button
                            onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                            className="bg-white text-black px-12 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-200 transition-all">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseItems;
