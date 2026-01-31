const { db } = require('../config/firebase');

// Get complete seller profile with stats and reviews
exports.getSellerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userDoc.data();

        // Get reviews (without orderBy to avoid index requirement)
        let reviews = [];
        try {
            const reviewsSnapshot = await db.collection('reviews')
                .where('sellerId', '==', userId)
                .get();

            reviews = reviewsSnapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data()
            }))
                .sort((a, b) => {
                    // Sort by createdAt descending (newest first)
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB - dateA;
                });
        } catch (reviewError) {
            console.error('Error fetching reviews (collection may not exist):', reviewError);
            // Continue with empty reviews array
        }

        // Calculate average rating
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Build profile response
        const profile = {
            _id: userDoc.id,
            name: userData.name,
            basedIn: userData.basedIn || '',
            productsSold: userData.productsSold || 0,
            productsSwapped: userData.productsSwapped || 0,
            joinedDate: userData.createdAt,
            reviews: reviews,
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: reviews.length
        };

        res.status(200).json(profile);
    } catch (error) {
        console.error('Get seller profile error:', error);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

