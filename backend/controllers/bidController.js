const { db } = require('../config/firebase');

exports.placeBid = async (req, res) => {
    try {
        const { itemId, bidderId, amount } = req.body;
        const bidAmount = Number(amount);

        if (!itemId || !bidderId || isNaN(bidAmount)) {
            return res.status(400).json({ message: 'Missing required fields or invalid amount' });
        }

        const result = await db.runTransaction(async (transaction) => {
            const itemRef = db.collection('items').doc(itemId);
            const userRef = db.collection('users').doc(bidderId);

            const [itemDoc, userDoc] = await Promise.all([
                transaction.get(itemRef),
                transaction.get(userRef)
            ]);

            if (!itemDoc.exists) throw new Error('Item not found');
            if (!userDoc.exists) throw new Error('User not found');

            const itemData = itemDoc.data();
            const userData = userDoc.data();

            // 1. Owner cannot bid
            if (itemData.ownerId === bidderId) {
                throw new Error('You cannot bid on your own item');
            }

            // 2. Bid must be higher than current price
            if (bidAmount <= (itemData.price || 0)) {
                throw new Error(`Bid must be higher than the current price of ${itemData.price || 0} Credits`);
            }

            // 3. User must have enough credits
            if (userData.credits < bidAmount) {
                throw new Error(`Insufficient credits. You have ${userData.credits} Credits.`);
            }

            // 4. Record the bid
            const bidRef = db.collection('bids').doc();
            const newBid = {
                itemId,
                bidderId,
                bidderName: userData.name,
                amount: bidAmount,
                createdAt: new Date().toISOString()
            };

            transaction.set(bidRef, newBid);

            // 5. Update item with new highest bid
            transaction.update(itemRef, {
                price: bidAmount,
                highestBidderId: bidderId,
                lastBidAt: new Date().toISOString()
            });

            // 6. Trigger Notification for Item Owner
            const notificationRef = db.collection('notifications').doc();
            transaction.set(notificationRef, {
                userId: itemData.ownerId,
                title: 'New Bid Received',
                message: `Someone placed a bid of ${bidAmount} CR on your "${itemData.title}".`,
                type: 'NEW_BID',
                link: `/dashboard`,
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return { id: bidRef.id, amount: bidAmount };
        });

        res.status(201).json({
            id: result.id,
            message: `Bid of ${result.amount} Credits placed successfully!`,
            newPrice: result.amount
        });

    } catch (error) {
        console.error("Bid Placement Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

exports.getItemBids = async (req, res) => {
    try {
        const { id } = req.params; // itemId
        const snapshot = await db.collection('bids').where('itemId', '==', id).get();

        const bids = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(bids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptBid = async (req, res) => {
    try {
        const { bidId } = req.body;

        if (!bidId) {
            return res.status(400).json({ message: 'Missing bidId' });
        }

        const result = await db.runTransaction(async (transaction) => {
            const bidRef = db.collection('bids').doc(bidId);
            const bidDoc = await transaction.get(bidRef);

            if (!bidDoc.exists) throw new Error('Bid not found');
            const bidData = bidDoc.data();

            const itemRef = db.collection('items').doc(bidData.itemId);
            const itemDoc = await transaction.get(itemRef);

            if (!itemDoc.exists) throw new Error('Item not found');
            const itemData = itemDoc.data();

            const buyerRef = db.collection('users').doc(bidData.bidderId);
            const sellerRef = db.collection('users').doc(itemData.ownerId);

            const [buyerDoc, sellerDoc] = await Promise.all([
                transaction.get(buyerRef),
                transaction.get(sellerRef)
            ]);

            if (!buyerDoc.exists || !sellerDoc.exists) throw new Error('Buyer or Seller not found');

            // Final credit check for buyer
            if (buyerDoc.data().credits < bidData.amount) {
                throw new Error('Buyer no longer has sufficient credits');
            }

            // 1. Mark Item as Swapped/Sold
            transaction.update(itemRef, { status: 'SWAPPED', soldAt: new Date().toISOString() });

            // 2. Transfer Credits
            transaction.update(buyerRef, { credits: buyerDoc.data().credits - bidData.amount });
            transaction.update(sellerRef, {
                credits: sellerDoc.data().credits + bidData.amount,
                productsSold: (sellerDoc.data().productsSold || 0) + 1
            });

            // 3. Record Transaction
            const transRef = db.collection('transactions').doc();
            transaction.set(transRef, {
                type: 'BID_WIN',
                itemId: bidData.itemId,
                itemTitle: itemData.title,
                fromUserId: bidData.bidderId,
                toUserId: itemData.ownerId,
                credits: bidData.amount,
                createdAt: new Date().toISOString()
            });

            // 4. Trigger Notification for Winner
            const notificationRef = db.collection('notifications').doc();
            transaction.set(notificationRef, {
                userId: bidData.bidderId,
                title: 'Auction Won!',
                message: `You successfully acquired "${itemData.title}" for ${bidData.amount} CR.`,
                type: 'BID_ACCEPTED',
                link: `/dashboard`,
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return { itemTitle: itemData.title, amount: bidData.amount };
        });

        res.status(200).json({
            message: `Congratulations! You accepted the bid of ${result.amount} Credits for ${result.itemTitle}.`
        });
    } catch (error) {
        console.error("Accept Bid Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};
