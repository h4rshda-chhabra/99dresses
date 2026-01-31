import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SellerProfilePage = () => {
    const { userId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canReview, setCanReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
        if (user && user._id !== userId) {
            checkReviewEligibility();
        }
    }, [userId, user]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/profile/${userId}`);
            const data = await response.json();

            if (response.ok) {
                setProfile(data);
            } else {
                console.error('Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkReviewEligibility = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/reviews/can-review/${userId}?buyerId=${user._id}`
            );
            const data = await response.json();
            setCanReview(data.canReview);
        } catch (error) {
            console.error('Error checking review eligibility:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: userId,
                    buyerId: user._id,
                    rating,
                    comment,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Review submitted successfully!');
                setShowReviewForm(false);
                setComment('');
                setRating(5);
                fetchProfile(); // Refresh to show new review
                setCanReview(false);
            } else {
                alert(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-white font-black tracking-widest text-[10px] uppercase">Loading Profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-red-500 font-black uppercase">Profile not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body pb-20">
            <div className="max-w-5xl mx-auto px-6 pt-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest flex items-center gap-2 mb-12"
                >
                    <span className="text-lg">←</span> Back
                </button>

                {/* Profile Header */}
                <div className="glass rounded-[3rem] p-12 border-white/10 mb-12 animate-slide-up">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full glass border-2 border-white/10 flex items-center justify-center">
                                    <span className="text-4xl font-black text-cosmos">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="font-display text-5xl font-black tracking-tighter uppercase mb-2">
                                        {profile.name}
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        {profile.basedIn && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <span className="text-cosmos text-xs">📍</span>
                                                <span className="font-bold text-sm">{profile.basedIn}</span>
                                            </div>
                                        )}
                                        {(!user || user._id !== userId) && (
                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        navigate('/login');
                                                        return;
                                                    }
                                                    navigate(`/dashboard?tab=messages&withUser=${userId}`);
                                                }}
                                                className="btn-primary px-8 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-cherry/40 flex items-center gap-4 hover:scale-105 transition-all group"
                                            >
                                                <span className="text-xl group-hover:animate-bounce">💬</span> {user ? 'Message Seller' : 'Login to Message'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 mt-8">
                                <div className="glass rounded-2xl p-6 border-white/5 text-center">
                                    <div className="text-4xl font-black text-white mb-2">
                                        {profile.productsSold}
                                    </div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Products Sold
                                    </div>
                                </div>
                                <div className="glass rounded-2xl p-6 border-white/5 text-center">
                                    <div className="text-4xl font-black text-white mb-2">
                                        {profile.productsSwapped}
                                    </div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Products Swapped
                                    </div>
                                </div>
                                <div className="glass rounded-2xl p-6 border-white/5 text-center">
                                    <div className="text-4xl font-black text-cosmos mb-2">
                                        {profile.averageRating > 0 ? profile.averageRating : 'N/A'}
                                    </div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Average Rating
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="glass rounded-[3rem] p-12 border-white/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-display text-3xl font-black uppercase tracking-tighter">
                            Reviews ({profile.totalReviews})
                        </h2>
                        {canReview && !showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="btn-primary px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-cherry/20"
                            >
                                Write a Review
                            </button>
                        )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="glass rounded-2xl p-8 border-white/5 mb-8 animate-fade-in">
                            <h3 className="font-black text-white text-xl mb-6 uppercase tracking-tighter">Share Your Experience</h3>

                            {/* Star Rating */}
                            <div className="mb-6">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-4xl transition-all ${star <= rating ? 'text-yellow-500' : 'text-slate-700'
                                                } hover:scale-110`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-6">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Comment</label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:border-cherry/50 outline-none transition-all font-medium resize-none"
                                    rows="4"
                                    placeholder="Share your experience with this seller..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cosmos hover:text-white transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="flex-1 glass border-white/10 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Reviews List */}
                    {profile.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {profile.reviews.map((review) => (
                                <div key={review._id} className="glass rounded-2xl p-8 border-white/5 hover:bg-white/5 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 glass rounded-full flex items-center justify-center font-black text-cosmos border-white/10">
                                                {review.buyerName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-lg">{review.buyerName}</div>
                                                <div className="text-slate-500 text-xs font-bold">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xl ${i < review.rating ? 'text-yellow-500' : 'text-slate-700'
                                                        }`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed font-medium">{review.comment}</p>
                                    {review.transactionType && (
                                        <div className="mt-4 inline-block px-3 py-1 rounded-full bg-slate-800 border border-white/5">
                                            <span className="text-[10px] font-black text-cosmos uppercase tracking-widest">
                                                {review.transactionType === 'BID_WIN' ? 'Verified Purchase' : 'Verified Swap'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                                No reviews yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerProfilePage;
