import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';

const NotificationPopup = () => {
    const { popupNotification, setPopupNotification, markAsRead } = useContext(NotificationContext);
    const navigate = useNavigate();

    if (!popupNotification) return null;

    const handleClick = () => {
        markAsRead(popupNotification.id);
        setPopupNotification(null);
        if (popupNotification.link) {
            navigate(popupNotification.link);
        }
    };

    return (
        <div
            className="fixed top-24 right-6 z-[100] w-80 animate-slide-up"
            onClick={handleClick}
        >
            <div className="glass border border-white/10 p-6 rounded-[2rem] shadow-2xl cursor-pointer hover:border-cherry/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cherry opacity-10 blur-[40px] -z-10"></div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-white font-black uppercase text-[8px] tracking-[0.3em]">
                            {popupNotification.title || 'System Alert'}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupNotification(null);
                            }}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">CLOSE</span>
                        </button>
                    </div>

                    <h4 className="text-white font-black text-sm uppercase tracking-tighter group-hover:text-cosmos transition-colors">
                        {popupNotification.message}
                    </h4>

                    <div className="flex items-center gap-2 mt-2">
                        <span className="h-0.5 w-6 bg-cherry rounded-full"></span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            TAP TO VIEW
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;
