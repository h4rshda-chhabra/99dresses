import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const ChatPage = () => {
    const { swapId } = useParams();
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [swapOffer, setSwapOffer] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchSwapDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/swaps/details/${swapId}`);
                if (response.ok) {
                    const data = await response.json();
                    setSwapOffer(data);
                }
            } catch (err) {
                console.error("Error fetching swap details:", err);
            }
        };

        fetchSwapDetails();

        const q = query(
            collection(db, 'messages'),
            where('swapOfferId', '==', swapId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Use current timestamp for items where serverTimestamp hasn't synced yet
            const now = Date.now() / 1000;

            msgs.sort((a, b) => {
                const timeA = a.createdAt?.seconds || a.createdAt?._seconds || now;
                const timeB = b.createdAt?.seconds || b.createdAt?._seconds || now;
                return timeA - timeB;
            });

            setMessages(msgs);
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [swapId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    swapOfferId: swapId,
                    senderId: user._id,
                    text: newMessage
                }),
            });

            if (response.ok) {
                setNewMessage('');
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    if (!swapOffer) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-pulse text-white font-black tracking-widest text-[10px] uppercase">Connecting to Concierge...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body pb-10">
            <div className="max-w-5xl mx-auto h-[90vh] flex flex-col pt-10 px-6">
                {/* Modern Negotiation Header */}
                <div className="glass border border-white/10 rounded-[2.5rem] p-8 mb-6 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group shadow-2xl animate-slide-up">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cherry opacity-5 blur-[100px] -z-10 group-hover:opacity-10 transition-opacity"></div>

                    <div className="flex-1 mb-6 md:mb-0">
                        <Link to="/dashboard" className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                            ← EXIT CONCIERGE
                        </Link>
                        <h2 className="font-display text-4xl font-black uppercase tracking-tighter mb-2">Private Negotiation</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-cosmos font-black uppercase text-[8px] tracking-[0.3em] flex items-center gap-1.5 leading-none bg-cosmos/10 px-3 py-1.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-cosmos rounded-full animate-pulse"></span>
                                ENCRYPTED SECURE CHANNEL
                            </span>
                            <span className="text-slate-500 font-black uppercase text-[8px] tracking-[0.3em] leading-none glass border-white/5 px-3 py-1.5 rounded-full">
                                STATUS: {swapOffer.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 glass border-white/5 p-4 rounded-3xl group-hover:border-white/10 transition-all">
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Proposed Trade Items</p>
                            <p className="text-xs font-black text-white uppercase italic tracking-tighter">
                                <span className="text-white">{swapOffer.itemRequestedTitle}</span>
                                <span className="mx-2 text-slate-700">|</span>
                                <span className="text-cosmos">{swapOffer.itemOfferedTitle}</span>
                            </p>
                        </div>
                        <div className="flex -space-x-4">
                            <div className="w-14 h-14 rounded-2xl glass border border-cherry/50 flex items-center justify-center font-black text-[10px] bg-slate-900 shadow-xl uppercase">ITM</div>
                            <div className="w-14 h-14 rounded-2xl glass border border-cosmos/50 flex items-center justify-center font-black text-[10px] bg-slate-900 shadow-xl uppercase">SWP</div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 glass border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center py-32">
                                <h3 className="font-display text-3xl font-black uppercase tracking-tighter text-white/40">Initiate Discussion</h3>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4">High-end swappers speak with intention</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={msg.id} className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <div className={`max-w-[65%] group`}>
                                        <div className={`p-6 rounded-[2rem] shadow-2xl backdrop-blur-3xl transition-all ${msg.senderId === user?._id
                                            ? 'bg-cherry/20 text-white rounded-tr-none border border-cherry/30'
                                            : 'bg-cosmos/10 text-slate-300 rounded-tl-none border border-cosmos/20 group-hover:border-cosmos/40'
                                            }`}>
                                            <p className="text-[15px] font-medium leading-relaxed tracking-tight">{msg.text}</p>
                                        </div>
                                        <p className={`text-[8px] mt-3 font-black uppercase tracking-[0.2em] opacity-30 ${msg.senderId === user?._id ? 'text-right' : 'text-left'}`}>
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TRANSMITTING...'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-8 bg-white/5 border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Compose your high-end proposal..."
                                    className="w-full h-18 py-5 px-10 glass border border-white/5 rounded-[2rem] text-white font-black uppercase text-[10px] tracking-widest focus:border-cherry/50 focus:ring-0 outline-none transition-all placeholder:text-slate-600 group-hover:scale-[1.01]"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 text-xs font-black uppercase tracking-widest pointer-events-none group-hover:text-slate-500 transition-colors">
                                    COMPOSE
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary w-24 h-18 rounded-[2rem] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-cherry/20 text-[10px] font-black uppercase tracking-widest"
                            >
                                SEND
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
