import React, { useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { notifications, markAsRead } = useContext(NotificationContext);
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };


    return (
        <nav className="glass border-b border-white/5 sticky top-0 z-[100] backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="text-2xl font-display font-black text-white tracking-widest relative group">
                            <span className="text-cosmos">99DRESSES</span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cherry transition-all group-hover:w-full"></span>
                        </Link>
                        <div className="hidden md:flex items-center gap-10">
                            <Link to="/browse" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-colors relative group">
                                The Gallery
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cherry transition-all group-hover:w-full"></span>
                            </Link>
                            {user && <Link to="/add-item" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-colors relative group">
                                Drop Item
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cherry transition-all group-hover:w-full"></span>
                            </Link>}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="hidden sm:flex flex-col items-end gap-0.5 cursor-pointer group relative"
                                >
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter transition-colors">
                                        {user.name}
                                    </span>

                                    <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-cherry transition-all group-hover:w-full"></span>
                                </Link>

                                <div className="hidden sm:flex items-center gap-4">
                                    <Link
                                        to="/dashboard?tab=messages"
                                        className="w-10 h-10 glass border-white/10 rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-black/20 text-slate-400 relative"
                                        title="Messages"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        {notifications.some(notif => !notif.isRead && notif.type === 'CHAT_MESSAGE') && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cosmos rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
                                                {notifications.filter(notif => !notif.isRead && notif.type === 'CHAT_MESSAGE').length}
                                            </span>
                                        )}
                                    </Link>

                                    <div className="relative" ref={notificationRef}>
                                        <button
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            className="w-10 h-10 glass border-white/10 rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-black/20 text-slate-400 relative"
                                            title="Notifications"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cherry rounded-full text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {showNotifications && (
                                            <div className="absolute right-0 mt-4 w-80 glass border border-white/10 rounded-[2rem] shadow-2xl py-6 overflow-hidden z-[110] animate-slide-up origin-top-right">
                                                <div className="px-8 pb-4 border-b border-white/5 flex justify-between items-center">
                                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Recent Activity</h3>
                                                    {unreadCount > 0 && <span className="text-[8px] font-black text-white uppercase tracking-tighter italic">{unreadCount} New</span>}
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {notifications.length > 0 ? (
                                                        notifications.map((notif) => (
                                                            <div
                                                                key={notif.id}
                                                                onClick={() => {
                                                                    markAsRead(notif.id);
                                                                    setShowNotifications(false);
                                                                    if (notif.link) navigate(notif.link);
                                                                }}
                                                                className={`px-8 py-5 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group ${!notif.isRead ? 'bg-cosmos/5' : ''}`}
                                                            >
                                                                <p className="text-[11px] text-slate-300 font-medium leading-relaxed group-hover:text-white mb-2">{notif.message}</p>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    {!notif.isRead && <span className="w-1.5 h-1.5 bg-cherry rounded-full"></span>}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-8 py-12 text-center">
                                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic">No notifications yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-8 pt-4 text-center">
                                                    <button
                                                        onClick={() => setShowNotifications(false)}
                                                        className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                                    >
                                                        Close Dropdown
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="glass text-slate-400 border-white/5 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-cherry/50 hover:text-white transition-all"
                                >
                                    LOGOUT
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-8">
                                <Link to="/login" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors relative group">
                                    LOGIN
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cherry transition-all group-hover:w-full"></span>
                                </Link>
                                <Link to="/register" className="btn-primary text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-cherry/20 hover:scale-105 transition-all">
                                    SIGN UP
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
