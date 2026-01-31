import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        console.log("Logging in user:", userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const refreshUser = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.token) return;

        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${storedUser.token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                // Merge new data (credits) with existing token
                const updatedUser = { ...storedUser, ...data };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log("Credits updated:", updatedUser.credits);
            }
        } catch (err) {
            console.error("Failed to refresh user data:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
