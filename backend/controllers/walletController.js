const { db } = require('../config/firebase');

exports.getWallet = async (req, res) => {
    try {
        const { userId } = req.params;
        const [userDoc, transSnapshot] = await Promise.all([
            db.collection('users').doc(userId).get(),
            db.collection('transactions')
                .where('fromUserId', '==', userId)
                .get(),
        ]);

        // Secondary query for received transactions
        const receivedTransSnapshot = await db.collection('transactions')
            .where('toUserId', '==', userId)
            .get();

        if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

        const history = [
            ...transSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'SENDER' })),
            ...receivedTransSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'RECEIVER' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            credits: userDoc.data().credits || 0,
            history
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.buyCredits = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const purchaseAmount = Number(amount);

        if (!userId || isNaN(purchaseAmount)) {
            return res.status(400).json({ message: 'Invalid purchase request' });
        }

        await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) throw new Error('User not found');

            const currentCredits = userDoc.data().credits || 0;
            transaction.update(userRef, { credits: currentCredits + purchaseAmount });

            const transRef = db.collection('transactions').doc();
            transaction.set(transRef, {
                type: 'CREDIT_PURCHASE',
                toUserId: userId,
                credits: purchaseAmount,
                createdAt: new Date().toISOString()
            });
        });

        res.status(200).json({ message: 'Credits purchased successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
