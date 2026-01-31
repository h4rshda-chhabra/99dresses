import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [popupNotification, setPopupNotification] = useState(null);

    useEffect(() => {
        if (!user?._id) {
            setNotifications([]);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user._id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allNotifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by createdAt descending and limit to 20
            const newNotifs = allNotifs
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB - dateA;
                })
                .slice(0, 20);

            // If we have a new notification that wasn't there before, show a popup
            if (newNotifs.length > 0) {
                const latest = newNotifs[0];
                const isNew = !notifications.find(n => n.id === latest.id);

                // Only show popup for unread notifications created very recently (within last 10 seconds)
                const isRecent = new Date() - new Date(latest.createdAt) < 10000;

                if (isNew && !latest.isRead && isRecent) {
                    // Don't show popup if we are already in the chat room for this notification
                    const isCurrentChat = window.location.pathname === latest.link;

                    if (!isCurrentChat) {
                        setPopupNotification(latest);
                        setTimeout(() => setPopupNotification(null), 5000);
                    } else {
                        // Mark as read automatically if we are already seeing it
                        const notifRef = doc(db, 'notifications', latest.id);
                        updateDoc(notifRef, { isRead: true });
                    }
                }
            }

            setNotifications(newNotifs);
        }, (error) => {
            console.error("Notification listener error:", error);
        });

        return () => unsubscribe();
    }, [user?._id]);

    const markAsRead = async (notifId) => {
        try {
            const notifRef = doc(db, 'notifications', notifId);
            await updateDoc(notifRef, { isRead: true });
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, popupNotification, setPopupNotification, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
