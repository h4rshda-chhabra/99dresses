import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [userItems, setUserItems] = useState([]);
    const [swapOffers, setSwapOffers] = useState([]);
    const [sentOffers, setSentOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [walletData, setWalletData] = useState({ credits: 0, history: [] });

    const fetchData = async () => {
        try {
            const [itemsRes, swapRes, sentRes, walletRes] = await Promise.all([
                fetch('http://localhost:5000/api/items'),
                fetch(`http://localhost:5000/api/swaps/incoming/${user?._id}`),
                fetch(`http://localhost:5000/api/swaps/sent/${user?._id}`),
                fetch(`http://localhost:5000/api/wallet/${user?._id}`)
            ]);

            if (itemsRes.ok) {
                const itemsData = await itemsRes.json();
                const filteredItems = itemsData.filter(item => item.ownerId === user?._id);
                setUserItems(filteredItems);
            }

            if (swapRes.ok) {
                const swapData = await swapRes.json();
                setSwapOffers(swapData);
            }
            if (sentRes.ok) {
                const sentData = await sentRes.json();
                setSentOffers(sentData);
            }
            if (walletRes.ok) {
                const wData = await walletRes.json();
                setWalletData(wData);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyCredits = async (amount) => {
        try {
            const response = await fetch('http://localhost:5000/api/wallet/buy-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, amount }),
            });

            if (response.ok) {
                alert(`Successfully purchased ${amount} credits!`);
                fetchData();
            }
        } catch (err) {
            console.error("Purchase error:", err);
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchData();
        }
    }, [user?._id]);

    const handleDeleteSwap = async (id) => {
        if (!window.confirm('Are you sure you want to remove this negotiation history?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/swaps/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Error deleting swap:", err);
        }
    };

    const handleSwapResponse = async (offerId, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this swap offer?`)) return;

        try {
            const response = await fetch('http://localhost:5000/api/swaps/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId, status }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchData();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error("Swap response error:", err);
            alert('Failed to process swap response');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Item deleted successfully');
                fetchData();
            } else {
                alert('Failed to delete item');
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert('Error deleting item');
        }
    };

    const NavItem = ({ id, icon, label, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all group ${activeTab === id
                ? 'btn-primary text-white shadow-xl'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
        >
            <div className="flex items-center gap-4">
                <span className={`text-[10px] font-black transition-transform group-hover:scale-110 ${activeTab === id ? 'text-white' : 'text-slate-400'}`}>ICO</span>
                <span className="uppercase tracking-widest text-xs">{label}</span>
            </div>
            {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === id ? 'bg-white text-cherry' : 'bg-cosmos/20 text-cosmos'}`}>
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-body">
            {/* Sidebar */}
            <aside className="w-full md:w-80 glass border-r border-white/5 p-6 flex flex-col pt-12">
                <div className="mb-12 px-4 animate-fade-in">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 btn-primary rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-2xl">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">{user?.name}</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Premium Member</p>
                        </div>
                    </div>

                    <div className="glass p-4 rounded-2xl border-white/5 bg-white/5">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Credits</div>
                        <div className="text-3xl font-black text-white flex items-center gap-2">
                            {walletData.credits} <span className="text-xs text-cosmos">CR</span>
                        </div>
                    </div>
                </div>

                <nav className="space-y-3 flex-1 px-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <NavItem id="overview" icon="STA" label="Overview" />
                    <NavItem id="my-items" icon="VLT" label="My Vault" count={userItems.length} />
                    <NavItem id="swaps" icon="HUB" label="Swap Hub" count={swapOffers.length + sentOffers.length} />
                    <NavItem id="wallet" icon="WLT" label="Wallet" />
                </nav>

                <div className="mt-auto p-6 bg-cosmos/10 rounded-3xl border border-white/5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-[10px] font-black text-cosmos uppercase tracking-widest mb-2">Refer a Friend</p>
                    <p className="text-sm text-slate-300 mb-6 font-medium leading-relaxed">Boost your closet. Invite a friend and get 50 credits each.</p>
                    <button className="w-full glass py-3 rounded-2xl font-black text-xs text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                        Get Invite Link
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
                <header className="flex justify-between items-center mb-12 animate-slide-up">
                    <h1 className="font-display text-4xl font-black text-white capitalize flex items-center gap-4">
                        {activeTab.replace('-', ' ')}
                        <span className="h-0.5 w-12 bg-cherry rounded-full"></span>
                    </h1>
                    <Link to="/add-item" className="btn-primary text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-cherry/20 hover:scale-105 transition-all uppercase tracking-widest text-xs">
                        + New Listing
                    </Link>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {/* Stats Card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="p-10 bg-cherry rounded-[3rem] text-white shadow-2xl shadow-cherry/20 card-hover">
                                <p className="text-white/70 font-black uppercase text-[10px] tracking-widest mb-2">Available Balance</p>
                                <h3 className="text-5xl font-black mb-6 flex items-baseline gap-2">
                                    {walletData.credits} <span className="text-sm opacity-60">CR</span>
                                </h3>

                                <button onClick={() => setActiveTab('wallet')} className="text-[10px] font-black bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-all uppercase tracking-widest">Top Up Now &rarr;</button>
                            </div>
                            <div className="p-10 glass rounded-[3rem] border border-white/10 shadow-xl card-hover">
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-2">My Listings</p>
                                <h3 className="text-5xl font-black text-white">{userItems.filter(i => i.status === 'ACTIVE').length}</h3>
                                <p className="text-xs text-slate-500 font-bold mt-4 uppercase tracking-widest">Active & Visible</p>
                            </div>
                            <div className="p-10 glass rounded-[3rem] border border-white/10 shadow-xl card-hover">
                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-2">Pending Proposals</p>
                                <h3 className="text-5xl font-black text-cosmos">{swapOffers.length}</h3>
                                <p className="text-xs text-slate-500 font-bold mt-4 uppercase tracking-widest">Awaiting Style Swap</p>
                            </div>
                        </div>

                        {/* Recent Activity Mini-List */}
                        <div>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="font-display text-2xl font-black text-white">Your Collections</h2>
                                <button onClick={() => setActiveTab('my-items')} className="text-xs font-black text-cosmos hover:text-white uppercase tracking-widest">View All Vault &rarr;</button>
                            </div>
                            {userItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {userItems.slice(0, 4).map((item, idx) => (
                                        <div key={item.id} className="glass rounded-[2rem] p-4 border border-white/5 card-hover" style={{ animationDelay: `${idx * 0.1}s` }}>
                                            <div className="h-40 bg-slate-900 rounded-2xl overflow-hidden mb-4 relative">
                                                {item.images?.[0] ?
                                                    <img src={item.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> :
                                                    <div className="flex items-center justify-center h-full text-[8px] font-black text-slate-700 uppercase tracking-widest opacity-30">NO IMAGE</div>
                                                }
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase">{item.status}</div>
                                            </div>
                                            <h4 className="font-black text-white text-sm uppercase tracking-tight">{item.title}</h4>
                                            <p className="text-white font-black text-[10px] mt-1">{item.price} CREDITS</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 glass rounded-[3rem] border-dashed border-white/10 text-center">
                                    <p className="text-slate-500 font-bold mb-4 uppercase text-xs">No treasures listed yet</p>
                                    <Link to="/add-item" className="text-cosmos font-black hover:underline text-sm uppercase">Add your first piece</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'my-items' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                        {userItems.length > 0 ? userItems.map((item, idx) => (
                            <div key={item.id} className={`glass rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden card-hover group ${item.status === 'SWAPPED' ? 'opacity-40 grayscale' : ''}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="h-64 bg-slate-900 relative p-3">
                                    <div className="w-full h-full rounded-[2rem] overflow-hidden">
                                        {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="flex items-center justify-center h-full text-[10px] font-black text-slate-700 uppercase tracking-widest opacity-20">NO IMAGE</div>}
                                    </div>
                                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-cosmos shadow-xl">
                                        {item.status || 'ACTIVE'}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="font-black text-xl text-white truncate mb-2 uppercase tracking-tighter">{item.title}</h3>
                                    <p className="text-cosmos font-black text-sm mb-8">{item.price} CREDITS</p>
                                    <div className="flex gap-3">
                                        <Link to={`/items/${item.id}`} className="flex-1 text-center glass text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                            Manage
                                        </Link>
                                        <button onClick={() => handleDelete(item.id)} className="w-14 flex items-center justify-center bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-[10px] hover:bg-red-500/20 transition-all uppercase">
                                            DEL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-32 text-center glass rounded-[4rem] border-dashed border-white/10 px-6">
                                <h3 className="font-display text-4xl font-black text-white mb-4 uppercase">The Vault is Empty</h3>
                                <p className="text-slate-500 font-bold mb-12 uppercase text-xs tracking-widest">Time to declutter and earn credits</p>
                                <Link to="/add-item" className="btn-primary text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-cherry/20">List Your First Piece</Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'swaps' && (
                    <div className="space-y-16 max-w-5xl animate-slide-up">
                        {/* Incoming */}
                        <div>
                            <h2 className="font-display text-2xl font-black text-white mb-8 flex items-center gap-4">
                                Trade Requests
                                {swapOffers.length > 0 && <span className="bg-cosmos/20 text-cosmos text-[10px] px-3 py-1 rounded-full font-black">{swapOffers.length} NEW</span>}
                            </h2>
                            {swapOffers.length > 0 ? (
                                <div className="space-y-6">
                                    {swapOffers.map(offer => (
                                        <div key={offer.id} className={`glass border border-white/10 rounded-[3rem] p-10 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-10 card-hover ${offer.status === 'REJECTED' ? 'opacity-50' : ''}`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full tracking-widest ${offer.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                        {offer.status === 'REJECTED' ? 'Declined' : 'Proposal Received'}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(offer.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Your Treasure</p>
                                                        <h4 className="font-black text-white text-xl uppercase tracking-tighter truncate">{offer.itemRequestedTitle}</h4>
                                                    </div>
                                                    <div className="text-slate-700 text-4xl font-light animate-pulse">⇄</div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Their Offer</p>
                                                        <h4 className="font-black text-cosmos text-xl uppercase tracking-tighter truncate">{offer.itemOfferedTitle}</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {offer.status === 'PENDING' ? (
                                                    <>
                                                        <Link to={`/chat/${offer.id}`} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 shadow-xl transition-all">Chat</Link>
                                                        <button onClick={() => handleSwapResponse(offer.id, 'ACCEPTED')} className="btn-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-cherry/20">Accept</button>
                                                        <button onClick={() => handleSwapResponse(offer.id, 'REJECTED')} className="glass text-slate-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white transition-all">Decline</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleDeleteSwap(offer.id)} className="glass text-red-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all">Remove History</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-slate-500 font-black uppercase tracking-widest text-xs p-20 glass rounded-[3rem] border-dashed border-white/5 text-center">No incoming trade offers yet.</p>}
                        </div>

                        {/* Sent */}
                        <div>
                            <h2 className="font-display text-2xl font-black text-white mb-8">Outgoing Offers</h2>
                            {sentOffers.length > 0 ? (
                                <div className="space-y-6">
                                    {sentOffers.map(offer => (
                                        <div key={offer.id} className={`glass border border-white/5 rounded-[3rem] p-10 shadow-xl flex flex-col lg:flex-row justify-between items-center gap-10 ${offer.status === 'PENDING' ? 'opacity-70' : 'opacity-40'}`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full tracking-widest ${offer.status === 'PENDING' ? 'bg-cosmos/10 text-cosmos' : offer.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'}`}>{offer.status}</div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Desired Item</p>
                                                        <h4 className="font-black text-white text-xl uppercase tracking-tighter truncate">{offer.itemRequestedTitle}</h4>
                                                    </div>
                                                    <div className="text-slate-800 text-4xl font-light">→</div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">Your Offer</p>
                                                        <h4 className="font-black text-slate-300 text-xl uppercase tracking-tighter truncate">{offer.itemOfferedTitle}</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                {offer.status === 'PENDING' ? (
                                                    <>
                                                        <Link to={`/chat/${offer.id}`} className="glass text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Negotiate</Link>
                                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic tracking-[0.2em]">Pending Review</span>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleDeleteSwap(offer.id)} className="glass text-red-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all">Delete Record</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-slate-500 font-black uppercase tracking-widest text-xs p-20 glass rounded-[3rem] border-dashed border-white/5 text-center">Your sent offers list is clear.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-10 animate-slide-up">
                        <div className="lg:col-span-1 space-y-10">
                            <div className="glass rounded-[3.5rem] p-12 shadow-2xl border border-white/10 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-cosmos/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Total Balance</p>
                                <h3 className="text-7xl font-black text-white mb-8 flex items-center justify-center gap-3">
                                    {walletData.credits} <span className="text-lg text-cosmos tracking-tighter italic">CR</span>
                                </h3>
                                <div className="space-y-3">
                                    <button onClick={() => handleBuyCredits(50)} className="w-full glass py-4 rounded-2xl font-black text-xs text-white uppercase tracking-widest hover:bg-white/10 transition-all border-white/10">Purchase 50 Credits</button>
                                    <button onClick={() => handleBuyCredits(100)} className="w-full btn-primary py-5 rounded-2xl font-black text-xs text-white uppercase tracking-widest shadow-2xl shadow-cherry/20 hover:scale-105 transition-all">Purchase 100 Credits</button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-10 border border-white/10">
                                <h4 className="font-display text-xl font-black mb-4 text-cosmos italic">Collector Status</h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed uppercase tracking-tighter font-bold">You are in the top 15% of style traders this month. Keep it up to earn exclusive badges.</p>
                                <div className="mt-8 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cosmos w-[65%] rounded-full shadow-[0_0_15px_rgba(116,165,190,0.5)]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 glass rounded-[3.5rem] p-12 shadow-2xl border border-white/10">
                            <h2 className="font-display text-2xl font-black text-white mb-10">Ledger History</h2>
                            <div className="space-y-8">
                                {walletData.history.length > 0 ? walletData.history.map((tx, idx) => (
                                    <div key={tx.id} className="flex items-center justify-between border-b border-white/5 pb-8 last:border-0 last:pb-0 card-hover" style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-[8px] font-black shadow-inner uppercase tracking-tighter ${tx.type === 'CREDIT_PURCHASE' ? 'bg-emerald-500/10 text-emerald-400' :
                                                tx.type === 'BID_WIN' ? 'bg-cosmos/10 text-cosmos' : 'bg-cherry/10 text-white'
                                                }`}>
                                                {tx.type === 'CREDIT_PURCHASE' ? 'BUY' : tx.type === 'BID_WIN' ? 'BID' : 'SWP'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-sm uppercase tracking-widest mb-1 leading-none">
                                                    {tx.type.replace('_', ' ')}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                                    {tx.itemTitle || 'Credit Bundle'} • {new Date(tx.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-2xl font-black ${tx.role === 'SENDER' ? 'text-red-500' : 'text-emerald-500'}`}>
                                            <span className="text-xs mr-1">{tx.role === 'SENDER' ? 'SELL' : 'BUY'}</span>
                                            {tx.role === 'SENDER' ? '-' : '+'}{tx.credits}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-slate-600 py-20 font-black uppercase tracking-widest text-xs italic">The ledger is awaiting your first trade.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
