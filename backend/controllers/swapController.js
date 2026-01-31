const { db } = require('../config/firebase');

exports.getSwapDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('swapOffers').doc(id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Swap not found' });
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSwapOffer = async (req, res) => {
    try {
        const { itemRequestedId, itemOfferedId, fromUserId, toUserId } = req.body;
        console.log(`🤝 NEW SWAP OFFER: From ${fromUserId} To ${toUserId} (Request: ${itemRequestedId}, Offer: ${itemOfferedId})`);

        if (!itemRequestedId || !itemOfferedId || !fromUserId || !toUserId) {
            return res.status(400).json({ message: 'Missing required swap identifiers' });
        }

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: 'You cannot swap with yourself' });
        }

        // Transactions are safer for ensuring items aren't already pending/swapped
        const result = await db.runTransaction(async (transaction) => {
            const requestedRef = db.collection('items').doc(itemRequestedId);
            const offeredRef = db.collection('items').doc(itemOfferedId);

            const fromUserRef = db.collection('users').doc(fromUserId);
            const toUserRef = db.collection('users').doc(toUserId);

            const [reqDoc, offDoc, fromUserDoc, toUserDoc] = await Promise.all([
                transaction.get(requestedRef),
                transaction.get(offeredRef),
                transaction.get(fromUserRef),
                transaction.get(toUserRef)
            ]);

            if (!reqDoc.exists || !offDoc.exists || !fromUserDoc.exists || !toUserDoc.exists) {
                throw new Error('Items or users no longer exist');
            }

            if (reqDoc.data().status !== 'ACTIVE' || offDoc.data().status !== 'ACTIVE') {
                throw new Error('One or both items are no longer available for swapping');
            }

            const newOffer = {
                itemRequestedId,
                itemRequestedTitle: reqDoc.data().title,
                itemOfferedId,
                itemOfferedTitle: offDoc.data().title,
                fromUserId,
                fromUserName: fromUserDoc.data().name,
                toUserId,
                toUserName: toUserDoc.data().name,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };

            const offerRef = db.collection('swapOffers').doc();
            transaction.set(offerRef, newOffer);

            // Trigger Notification for the Recipient
            const notificationRef = db.collection('notifications').doc();
            transaction.set(notificationRef, {
                userId: toUserId,
                title: 'New Swap Offer',
                message: `You received a swap offer for your "${reqDoc.data().title}".`,
                type: 'SWAP_OFFER',
                link: `/dashboard`,
                isRead: false,
                createdAt: new Date().toISOString()
            });

            return { id: offerRef.id };
        });

        res.status(201).json({
            id: result.id,
            message: 'Swap offer sent successfully! Waiting for owner to respond.'
        });

    } catch (error) {
        console.error("Swap Offer Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

exports.getIncomingSwapOffers = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('swapOffers')
            .where('toUserId', '==', userId)
            .get();

        const offers = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            const msgSnapshot = await db.collection('messages')
                .where('swapOfferId', '==', doc.id)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            return {
                id: doc.id,
                ...data,
                lastMessage: msgSnapshot.empty ? null : msgSnapshot.docs[0].data().text
            };
        }));

        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSentSwapOffers = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('swapOffers')
            .where('fromUserId', '==', userId)
            .get();

        const offers = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            const msgSnapshot = await db.collection('messages')
                .where('swapOfferId', '==', doc.id)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            return {
                id: doc.id,
                ...data,
                lastMessage: msgSnapshot.empty ? null : msgSnapshot.docs[0].data().text
            };
        }));

        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.respondToSwap = async (req, res) => {
    try {
        const { offerId, status } = req.body; // status: 'ACCEPTED' | 'REJECTED'

        if (status === 'ACCEPTED') {
            await db.runTransaction(async (transaction) => {
                const offerRef = db.collection('swapOffers').doc(offerId);
                const offerDoc = await transaction.get(offerRef);

                if (!offerDoc.exists) throw new Error('Offer not found');
                const offerData = offerDoc.data();

                const reqItemRef = db.collection('items').doc(offerData.itemRequestedId);
                const offItemRef = db.collection('items').doc(offerData.itemOfferedId);

                const fromUserRef = db.collection('users').doc(offerData.fromUserId);
                const toUserRef = db.collection('users').doc(offerData.toUserId);

                const [fromUserDoc, toUserDoc] = await Promise.all([
                    transaction.get(fromUserRef),
                    transaction.get(toUserRef)
                ]);

                // Mark both items as swapped
                transaction.update(reqItemRef, { status: 'SWAPPED' });
                transaction.update(offItemRef, { status: 'SWAPPED' });

                // Increment productsSwapped for both users
                transaction.update(fromUserRef, {
                    productsSwapped: (fromUserDoc.data().productsSwapped || 0) + 1
                });
                transaction.update(toUserRef, {
                    productsSwapped: (toUserDoc.data().productsSwapped || 0) + 1
                });

                // Update the offer status
                transaction.update(offerRef, { status: 'ACCEPTED' });

                // Record Transaction
                const transRef = db.collection('transactions').doc();
                transaction.set(transRef, {
                    type: 'SWAP',
                    itemId: offerData.itemRequestedId,
                    itemTitle: offerData.itemRequestedTitle,
                    offeredItemId: offerData.itemOfferedId,
                    offeredItemTitle: offerData.itemOfferedTitle,
                    fromUserId: offerData.fromUserId,
                    toUserId: offerData.toUserId,
                    credits: 0,
                    createdAt: new Date().toISOString()
                });

                // Trigger Notification for the person who sent the offer
                const notificationRef = db.collection('notifications').doc();
                transaction.set(notificationRef, {
                    userId: offerData.fromUserId,
                    title: 'Swap Accepted!',
                    message: `Your offer for "${offerData.itemRequestedTitle}" has been accepted.`,
                    type: 'SWAP_ACCEPTED',
                    link: `/dashboard`,
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
            });
            return res.status(200).json({ message: 'Swap completed successfully! Items exchanged and recorded.' });
        } else {
            const offerRef = db.collection('swapOffers').doc(offerId);
            const offerDoc = await offerRef.get();
            await offerRef.update({ status: 'REJECTED' });

            if (offerDoc.exists) {
                const offerData = offerDoc.data();
                await db.collection('notifications').add({
                    userId: offerData.fromUserId,
                    title: 'Swap Declined',
                    message: `Your offer for "${offerData.itemRequestedTitle}" was declined.`,
                    type: 'SWAP_REJECTED',
                    link: `/dashboard`,
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
            }
            res.status(200).json({ message: 'Swap offer rejected' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createGeneralInquiry = async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;

        if (fromUserId === toUserId) {
            return res.status(400).json({ message: 'You cannot message yourself' });
        }

        // Check if a general inquiry already exists
        const existingSnapshot = await db.collection('swapOffers')
            .where('fromUserId', '==', fromUserId)
            .where('toUserId', '==', toUserId)
            .where('status', '==', 'GENERAL')
            .get();

        if (!existingSnapshot.empty) {
            return res.status(200).json({ id: existingSnapshot.docs[0].id, message: 'Existing conversation found' });
        }

        const [fromUserDoc, toUserDoc] = await Promise.all([
            db.collection('users').doc(fromUserId).get(),
            db.collection('users').doc(toUserId).get()
        ]);

        if (!fromUserDoc.exists || !toUserDoc.exists) {
            throw new Error('User not found');
        }

        const newInquiry = {
            itemRequestedId: 'GENERAL',
            itemRequestedTitle: 'General Inquiry',
            itemOfferedId: 'NONE',
            itemOfferedTitle: 'Inquiry',
            fromUserId,
            fromUserName: fromUserDoc.data().name,
            toUserId,
            toUserName: toUserDoc.data().name,
            status: 'GENERAL',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('swapOffers').add(newInquiry);
        res.status(201).json({ id: docRef.id, message: 'New conversation started' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSwapOffer = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('swapOffers').doc(id).delete();
        res.status(200).json({ message: 'Negotiation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
