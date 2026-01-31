import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ItemDetailPage = () => {
    const { id } = useParams();
    const { user, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [bidding, setBidding] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [userItems, setUserItems] = useState([]);
    const [swapping, setSwapping] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [ownerData, setOwnerData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // For carousel
    const [showFullImage, setShowFullImage] = useState(false);
    const [modalZoom, setModalZoom] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemRes, bidsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/items/${id}`),
                fetch(`http://localhost:5000/api/bids/${id}/bids`)
            ]);

            const itemData = await itemRes.json();
            const bidsData = await bidsRes.json();

            if (itemRes.ok) {
                setItem(itemData);
                setBidAmount((itemData.price || 0) + 1);

                // Fetch owner data
                if (itemData.ownerId) {
                    console.log('Fetching owner data for:', itemData.ownerId);
                    try {
                        const ownerRes = await fetch(`http://localhost:5000/api/profile/${itemData.ownerId}`);
                        if (ownerRes.ok) {
                            const ownerInfo = await ownerRes.json();
                            console.log('Owner data fetched successfully:', ownerInfo);
                            setOwnerData(ownerInfo);
                        } else {
                            console.error('Failed to fetch owner data, status:', ownerRes.status);
                        }
                    } catch (err) {
                        console.error('Error fetching owner data:', err);
                    }
                } else {
                    console.log('No ownerId found in item data:', itemData);
                }
            }
            if (bidsRes.ok) {
                setBids(bidsData.sort((a, b) => b.amount - a.amount));
            }
        } catch (err) {
            console.error("Error fetching item details:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/items');
            const data = await response.json();
            if (response.ok) {
                const filtered = data.filter(i =>
                    i.ownerId === user?._id &&
                    (i.status === 'ACTIVE' || !i.status)
                );
                setUserItems(filtered);
            }
        } catch (err) {
            console.error("Error fetching user items for swap:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (showSwapModal && user) {
            fetchUserItems();
        }
    }, [showSwapModal, user]);

    const handleAcceptBid = async (bidId) => {
        if (!window.confirm("Are you sure you want to accept this bid? This will complete the sale and transfer credits.")) return;

        setAccepting(true);
        try {
            const response = await fetch('http://localhost:5000/api/bids/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bidId }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                await refreshUser();
                fetchData();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error("Accept bid error:", err);
            alert('Failed to accept bid');
        } finally {
            setAccepting(false);
        }
    };

    const handleBid = async () => {
        if (!user) return alert('Please login to place a bid');
        if (!bidAmount || isNaN(bidAmount)) return alert('Please enter a valid amount');

        const amount = Number(bidAmount);
        if (amount <= (item.price || 0)) {
            return alert(`Your bid must be higher than ${item.price} Credits`);
        }

        if (user.credits < amount) {
            return alert(`You don't have enough credits! (Your balance: ${user.credits})`);
        }

        setBidding(true);
        try {
            const response = await fetch('http://localhost:5000/api/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId: id,
                    bidderId: user._id,
                    amount: amount
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                await refreshUser();
                fetchData();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error("Bid error:", err);
            alert('Failed to connect to server for bidding');
        } finally {
            setBidding(false);
        }
    };

    const handleConfirmSwap = async (offeredItemId) => {
        setSwapping(true);
        try {
            const response = await fetch('http://localhost:5000/api/swaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemRequestedId: id,
                    itemOfferedId: offeredItemId,
                    fromUserId: user._id,
                    toUserId: item.ownerId
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setShowSwapModal(false);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error("Swap error:", err);
            alert('Failed to send swap offer');
        } finally {
            setSwapping(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Item deleted successfully');
                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                alert(`Failed to delete: ${errorData.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert('Error connecting to server for deletion');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-pulse text-white font-black tracking-widest text-[10px] uppercase">Reviewing Vault...</div>
        </div>
    );
    if (!item) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-black uppercase">Item not found.</div>;

    const isOwner = user?._id === item.ownerId;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body pb-20">
            {/* Swap Modal */}
            {showSwapModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="glass border border-white/10 rounded-[3rem] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Offer a Swap</h2>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">Curate your trade</p>
                            </div>
                            <button onClick={() => setShowSwapModal(false)} className="text-slate-500 hover:text-white transition-colors text-4xl">&times;</button>
                        </div>
                        <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                            <p className="text-slate-400 mb-10 font-medium leading-relaxed uppercase text-xs tracking-widest text-center">Which treasure from your vault would you swap for the <span className="text-cosmos font-black">"{item.title}"</span>?</p>

                            {userItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {userItems.map(userItem => (
                                        <div key={userItem.id} className="glass border border-white/5 hover:border-cosmos/50 rounded-[2rem] p-6 transition-all group relative overflow-hidden card-hover">
                                            <div className="aspect-[3/4] rounded-[3.5rem] bg-slate-900 overflow-hidden shadow-2xl border border-white/5 relative group">
                                                {userItem.images && userItem.images[0] ? (
                                                    <img src={userItem.images[0]} alt={userItem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-[10px] font-black text-slate-700 uppercase tracking-widest opacity-20">NO IMAGE</div>
                                                )}
                                            </div>
                                            <h3 className="font-black text-white mb-2 uppercase tracking-tighter truncate">{userItem.title}</h3>
                                            <p className="text-cosmos font-black text-xs mb-8">{userItem.price} CREDITS</p>
                                            <button
                                                onClick={() => handleConfirmSwap(userItem.id)}
                                                disabled={swapping}
                                                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-cosmos hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {swapping ? 'PROPOSING...' : 'CONFIRM OFFER'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 px-6">
                                    <h3 className="text-3xl font-display font-black text-white mb-4 uppercase">The Vault is Bare</h3>
                                    <p className="text-slate-500 mb-12 uppercase text-[10px] tracking-[0.2em] font-bold">List an item to start high-end trading</p>
                                    <Link to="/add-item" className="btn-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-cherry/20">
                                        Open Your Shop
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Item Detail Section */}
            {/* Full Screen Image Modal */}
            {showFullImage && (
                <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                    {/* Controls */}
                    <div className="absolute top-6 right-6 flex items-center gap-4 z-[210]">
                        <div className="flex glass border border-white/10 rounded-full overflow-hidden">
                            <button
                                onClick={() => setModalZoom(prev => Math.max(0.5, prev - 0.25))}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-all font-bold text-xl"
                            >
                                −
                            </button>
                            <div className="w-16 h-10 flex items-center justify-center border-x border-white/10 font-black text-[10px] tracking-widest uppercase bg-white/5">
                                {Math.round(modalZoom * 100)}%
                            </div>
                            <button
                                onClick={() => setModalZoom(prev => Math.min(3, prev + 0.25))}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 transition-all font-bold text-xl"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={() => setShowFullImage(false)}
                            className="w-10 h-10 glass border border-white/10 rounded-full flex items-center justify-center text-2xl hover:bg-white/20 transition-all"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Image Container */}
                    <div className="w-full h-full overflow-auto flex items-center justify-center custom-scrollbar">
                        <img
                            src={item.images[currentImageIndex]}
                            alt={item.title}
                            className="max-w-none transition-transform duration-200 ease-out shadow-2xl"
                            style={{
                                transform: `scale(${modalZoom})`,
                                maxHeight: '90vh'
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 pt-4 pb-4">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Image Section */}
                    <div className="lg:w-[30%] w-full space-y-2">
                        {/* Main Image Display */}
                        <div className="rounded-[3rem] overflow-hidden glass border-white/10 shadow-2xl relative group card-hover">
                            <div className="aspect-[3/4] relative">
                                {item.images && item.images.length > 0 ? (
                                    <>
                                        <img
                                            src={item.images[currentImageIndex]}
                                            alt={`${item.title} - Image ${currentImageIndex + 1}`}
                                            className="w-full h-full object-cover transition-all duration-500 cursor-zoom-in"
                                            key={currentImageIndex}
                                            onClick={() => {
                                                setModalZoom(1);
                                                setShowFullImage(true);
                                            }}
                                        />

                                        {/* Navigation Arrows - Only show if multiple images */}
                                        {item.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentImageIndex((prev) => prev === 0 ? item.images.length - 1 : prev - 1)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white font-black hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    onClick={() => setCurrentImageIndex((prev) => prev === item.images.length - 1 ? 0 : prev + 1)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white font-black hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    →
                                                </button>
                                            </>
                                        )}

                                        {/* Image Counter */}
                                        {item.images.length > 1 && (
                                            <div className="absolute bottom-4 right-4 glass px-3 py-1 rounded-full border-white/10">
                                                <span className="font-black text-[10px] tracking-wider">
                                                    {currentImageIndex + 1}/{item.images.length}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] font-black text-slate-700 uppercase tracking-widest opacity-20">
                                        NO IMAGE AVAILABLE
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="absolute top-6 left-6 glass px-4 py-2 rounded-full border-white/10">
                                <span className="font-black text-[10px] tracking-[0.2em]">{item.category}</span>
                            </div>
                        </div>

                        {/* Thumbnail Gallery - Only show if multiple images */}
                        {item.images && item.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {item.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-xl overflow-hidden border transition-all ${currentImageIndex === index
                                            ? 'border-cosmos shadow-lg shadow-cosmos/30'
                                            : 'border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Information & Actions */}
                    <div className="lg:w-[70%] w-full animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="sticky top-4">
                            <span className="text-cosmos font-black uppercase text-[7px] tracking-[0.3em] mb-2 block">Exclusively Handpicked</span>
                            <h1 className="font-display text-2xl font-black mb-2 leading-tight tracking-tighter uppercase">{item.title}</h1>

                            {/* Seller Info */}
                            {ownerData && (
                                <Link
                                    to={`/profile/${item.ownerId}`}
                                    className="inline-flex items-center gap-2 glass rounded-lg px-3 py-1.5 border-white/10 mb-2 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center">
                                        <span className="font-black text-cosmos text-[10px]">{ownerData.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none">Seller</div>
                                        <div className="font-black text-white text-xs group-hover:text-cosmos transition-colors">{ownerData.name}</div>
                                    </div>
                                </Link>
                            )}

                            <div className="p-3 glass rounded-2xl border-white/10 mb-2 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-cosmos/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Valuation / Reserved At</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-white">{item.price || 0}</span>
                                    <span className="text-xs font-black text-cosmos tracking-tighter italic">CREDITS</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed mb-2 font-medium">
                                {item.description}
                                <span className="block mt-1 text-[9px] text-slate-600 font-bold uppercase tracking-widest italic tracking-tighter">ID: {item.id}</span>
                            </p>

                            <div className="space-y-6">
                                {item.status === 'SWAPPED' ? (
                                    <div className="p-10 glass bg-emerald-500/10 border-emerald-500/20 border-2 rounded-[3.5rem] text-center card-hover overflow-hidden">
                                        <div className="text-[10px] font-black text-emerald-500 mb-6 uppercase tracking-widest italic">Inventory Logic</div>
                                        <h3 className="font-display text-4xl font-black uppercase text-emerald-400 mb-2">Acquisition Complete</h3>
                                        <p className="text-emerald-500/60 font-black uppercase text-[10px] tracking-widest">This item has found a new home</p>
                                    </div>
                                ) : !isOwner ? (
                                    <div className="glass border border-white/10 p-4 rounded-3xl shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cherry opacity-5 blur-[100px]"></div>

                                        <div className="mb-2">
                                            <label className="block text-slate-500 text-[7px] font-black mb-1.5 uppercase tracking-[0.2em] text-center">Enter Your Bid Proposal</label>
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    className="w-full h-10 glass border-2 border-white/5 rounded-xl text-center font-display font-black text-xl text-white focus:border-cherry/50 focus:ring-0 outline-none transition-all placeholder:opacity-10 group-hover:scale-[1.01]"
                                                    placeholder="000"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[7px] font-black text-white opacity-50 tracking-widest uppercase">MIN: {(item.price || 0) + 1}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            <button
                                                onClick={handleBid}
                                                disabled={bidding}
                                                className="btn-primary text-white h-10 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-2xl shadow-cherry/20 hover:scale-105 transition-all disabled:opacity-50"
                                            >
                                                {bidding ? '...' : 'PLACE YOUR BID'}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        alert('Authenticating...');
                                                        navigate('/login');
                                                        return;
                                                    }
                                                    setShowSwapModal(true);
                                                }}
                                                className="glass text-white h-10 rounded-xl font-black uppercase tracking-widest text-[9px] border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-4"
                                            >
                                                <span className="text-[7px] font-black uppercase">BARTER</span> PROPOSE SWAP
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="p-4 glass border-white/10 rounded-2xl flex items-center justify-center gap-4">
                                            <span className="font-black uppercase text-[8px] tracking-widest text-cosmos">OWNER VIEW: You are the curator of this piece</span>
                                        </div>

                                        {bids.length > 0 ? (
                                            <div className="glass border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                                                <div className="bg-white/5 p-4 border-b border-white/5">
                                                    <h3 className="font-black text-white text-[8px] uppercase tracking-[0.3em] flex items-center gap-3">
                                                        <span className="w-1.5 h-1.5 bg-cherry rounded-full animate-pulse"></span>
                                                        Market Interest ({bids.length})
                                                    </h3>
                                                </div>
                                                <div className="divide-y divide-white/5">
                                                    {bids.map((bid, index) => (
                                                        <div key={bid.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 glass rounded-xl flex items-center justify-center font-black text-cosmos border-white/5 group-hover:scale-110 transition-transform text-xs">
                                                                    {bid.bidderName?.charAt(0) || 'U'}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="font-black text-white text-xs uppercase tracking-tight">{bid.bidderName}</span>
                                                                        {index === 0 && <span className="bg-emerald-500/10 text-emerald-400 text-[6px] px-1.5 py-0.5 rounded-full font-black uppercase">Prime</span>}
                                                                    </div>
                                                                    <p className="text-[7px] text-slate-500 font-black tracking-widest uppercase">{new Date(bid.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-lg font-black text-white">{bid.amount} <span className="text-[8px] text-cosmos">CR</span></span>
                                                                <button
                                                                    onClick={() => handleAcceptBid(bid.id)}
                                                                    disabled={accepting}
                                                                    className="bg-white text-black px-4 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                                                                >
                                                                    {accepting ? '...' : 'ACCEPT'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-20 border-2 border-dashed border-white/5 rounded-[4rem] text-center group">
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] leading-relaxed">The market is quiet.<br />Awaiting the first visionary offer.</p>
                                            </div>
                                        )}
                                    </div>
                                )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;
