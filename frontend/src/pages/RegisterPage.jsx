import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [basedIn, setBasedIn] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, basedIn }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Registration Success! Data:", data);
                login(data);
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-6 py-12 bg-slate-950">
            <div className="w-full max-w-md animate-slide-up">
                <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 transition-colors font-bold uppercase tracking-widest text-xs">
                    ← Back to home
                </button>

                <div className="glass rounded-[3rem] p-12 border-white/10 shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="font-display text-4xl font-black text-white mb-3">Join the Movement</h1>
                        <p className="text-slate-400 font-medium">Get 500 free credits to start trading</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:border-cherry/50 outline-none transition-all font-medium"
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:border-cherry/50 outline-none transition-all font-medium"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:border-cherry/50 outline-none transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Based In (City/Location)</label>
                            <input
                                type="text"
                                value={basedIn}
                                onChange={(e) => setBasedIn(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:border-cherry/50 outline-none transition-all font-medium"
                                placeholder="New York, USA"
                            />
                        </div>

                        <button type="submit" className="w-full btn-primary py-5 rounded-2xl font-black text-white text-lg shadow-xl shadow-cherry/20 hover:scale-[1.02] transition-all">
                            Create Account
                        </button>
                    </form>

                    <p className="text-center text-slate-500 mt-10 font-bold text-sm">
                        Already have an account?
                        <button onClick={() => navigate('/login')} className="text-cosmos hover:text-white ml-2 border-b-2 border-cosmos/20 pb-0.5">Sign In</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
