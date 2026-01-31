import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const ChatInterface = ({ swapId, onBack }) => {
    const { user } = useContext(AuthContext);
    const { notifications, markAsRead } = useContext(NotificationContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [swapOffer, setSwapOffer] = useState(null);
    const messagesEndRef = useRef(null);
    const isInitialLoad = useRef(true);

    const scrollToBottom = (behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
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

            const now = Date.now() / 1000;
            msgs.sort((a, b) => {
                const timeA = a.createdAt?.seconds || a.createdAt?._seconds || now;
                const timeB = b.createdAt?.seconds || b.createdAt?._seconds || now;
                return timeA - timeB;
            });

            setMessages(msgs);

            // First load: instant scroll. Subsequent: smooth.
            if (isInitialLoad.current && msgs.length > 0) {
                setTimeout(() => {
                    scrollToBottom("auto");
                    isInitialLoad.current = false;
                }, 100);
            } else {
                setTimeout(() => scrollToBottom("smooth"), 100);
            }
        });

        return () => {
            unsubscribe();
            isInitialLoad.current = true;
        };
    }, [swapId]);

    useEffect(() => {
        if (notifications.length > 0) {
            const currentChatNotifs = notifications.filter(
                n => !n.isRead && n.type === 'CHAT_MESSAGE' && n.link === `/chat/${swapId}`
            );

            currentChatNotifs.forEach(notif => {
                markAsRead(notif.id);
            });
        }
    }, [swapId, notifications, markAsRead]);

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

    const inputRef = useRef(null);

    useEffect(() => {
        if (swapId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [swapId]);

    if (!swapOffer) return (
        <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-white font-black tracking-widest text-[10px] uppercase">Connecting to Concierge...</div>
        </div>
    );

    const partnerName = user._id === swapOffer.fromUserId ? swapOffer.toUserName : swapOffer.fromUserName;

    return (
        <div className="h-full flex flex-col bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl animate-fade-in relative">
            {/* Header - Direct WhatsApp Look */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="lg:hidden text-white/50 hover:text-white mr-2">
                            <span className="text-xl">←</span>
                        </button>
                    )}
                    <div className="w-12 h-12 rounded-full glass border border-cosmos/30 flex items-center justify-center font-black text-cosmos bg-slate-800 shadow-xl">
                        {partnerName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-black text-white leading-none tracking-tight">{partnerName}</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Choice</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-right">
                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Subject</div>
                        <div className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[150px]">{swapOffer.itemRequestedTitle}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-xs opacity-50">
                        💬
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="font-display text-2xl font-black uppercase tracking-tighter text-white italic">Start Conversation</h3>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2 text-center max-w-[200px]">Direct communication ensures authentic acquisition</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?._id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up group`} style={{ animationDelay: `${idx * 0.02}s` }}>
                                <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`relative px-4 py-3 rounded-2xl shadow-lg transition-all ${isMe
                                        ? 'bg-cherry text-white rounded-tr-none border border-cherry/20 ml-12'
                                        : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/10 mr-12 backdrop-blur-md'
                                        }`}>
                                        <p className="text-[14px] leading-relaxed font-medium">{msg.text}</p>

                                        {/* Timestamp inside bubble for compact look */}
                                        <div className={`text-[8px] mt-1 font-black uppercase tracking-widest opacity-40 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                            {isMe && <span className="text-cosmos text-[10px]">✓✓</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - WhatsApp Sticky Floating Look */}
            <div className="p-6 bg-black/40 backdrop-blur-2xl border-t border-white/5">
                <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full h-14 pl-6 pr-14 glass border border-white/10 rounded-full text-white font-medium text-sm focus:border-cherry/50 focus:bg-white/15 focus:ring-4 focus:ring-cherry/10 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                        >
                            📎
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${newMessage.trim()
                            ? 'bg-cherry text-white hover:scale-110 active:scale-90 shadow-cherry/30'
                            : 'bg-white/5 text-slate-700 pointer-events-none'}`}
                    >
                        <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19V5m-7 7l7-7 7 7" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
