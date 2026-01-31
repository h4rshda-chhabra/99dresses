const { db } = require('../config/firebase');

// Create a new review (only if user has transacted with seller)
exports.createReview = async (req, res) => {
    try {
        const { sellerId, buyerId, rating, comment } = req.body;

        // Validation
        if (!sellerId || !buyerId || !rating || !comment) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if buyer and seller are the same
        if (sellerId === buyerId) {
            return res.status(400).json({ message: 'You cannot review yourself' });
        }

        // Find a transaction where buyer bought from or swapped with seller
        const transactionsSnapshot = await db.collection('transactions')
            .where('fromUserId', '==', buyerId)
            .where('toUserId', '==', sellerId)
            .get();

        const reverseTransactionsSnapshot = await db.collection('transactions')
            .where('fromUserId', '==', sellerId)
            .where('toUserId', '==', buyerId)
            .where('type', '==', 'SWAP')
            .get();

        const hasTransaction = !transactionsSnapshot.empty || !reverseTransactionsSnapshot.empty;

        if (!hasTransaction) {
            return res.status(403).json({
                message: 'You can only review sellers you have completed transactions with'
            });
        }

        // Check if user already reviewed this seller
        const existingReviewSnapshot = await db.collection('reviews')
            .where('buyerId', '==', buyerId)
            .where('sellerId', '==', sellerId)
            .get();

        if (!existingReviewSnapshot.empty) {
            return res.status(400).json({
                message: 'You have already reviewed this seller'
            });
        }

        // Get buyer name
        const buyerDoc = await db.collection('users').doc(buyerId).get();
        if (!buyerDoc.exists) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        // Get transaction ID
        // Prioritize transactions where buyer is fromUserId (e.g., BID_WIN)
        // If no such transaction, check for reverse SWAP transactions
        let transactionDoc;
        if (!transactionsSnapshot.empty) {
            transactionDoc = transactionsSnapshot.docs[0];
        } else if (!reverseTransactionsSnapshot.empty) {
            transactionDoc = reverseTransactionsSnapshot.docs[0];
        } else {
            // This case should ideally not be reached due to the `hasTransaction` check above
            return res.status(403).json({
                message: 'No valid transaction found to link the review'
            });
        }

        // Create the review
        const reviewRef = db.collection('reviews').doc();
        await reviewRef.set({
            sellerId,
            buyerId,
            transactionId: transactionDoc.id,
            transactionType: transactionDoc.data().type,
            rating: Number(rating),
            comment,
            buyerName: buyerDoc.data().name,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            message: 'Review submitted successfully',
            review: { id: reviewRef.id }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all reviews for a seller
exports.getSellerReviews = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const snapshot = await db.collection('reviews')
            .where('sellerId', '==', sellerId)
            .get();

        const reviews = snapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data()
        }))
            .sort((a, b) => {
                // Sort by createdAt descending
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA;
            });

        // Calculate average rating
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            reviews,
            averageRating: averageRating.toFixed(1),
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Get seller reviews error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Check if a user can review a seller
exports.checkEligibility = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { buyerId } = req.query;

        if (!buyerId) {
            return res.status(200).json({ canReview: false, reason: 'Not authenticated' });
        }

        // Check if already reviewed
        const existingReviewSnapshot = await db.collection('reviews')
            .where('buyerId', '==', buyerId)
            .where('sellerId', '==', sellerId)
            .get();

        if (!existingReviewSnapshot.empty) {
            return res.status(200).json({
                canReview: false,
                reason: 'You have already reviewed this seller'
            });
        }

        // Check for transaction
        const transactionsSnapshot = await db.collection('transactions')
            .where('fromUserId', '==', buyerId)
            .where('toUserId', '==', sellerId)
            .limit(1)
            .get();

        const reverseTransactionsSnapshot = await db.collection('transactions')
            .where('fromUserId', '==', sellerId)
            .where('toUserId', '==', buyerId)
            .where('type', '==', 'SWAP')
            .limit(1)
            .get();

        const hasTransaction = !transactionsSnapshot.empty || !reverseTransactionsSnapshot.empty;

        if (!hasTransaction) {
            return res.status(200).json({
                canReview: false,
                reason: 'No completed transactions with this seller'
            });
        }

        res.status(200).json({ canReview: true });
    } catch (error) {
        console.error('Check eligibility error:', error);
        res.status(500).json({ message: error.message });
    }
};
