const { db } = require('../config/firebase');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { swapOfferId, senderId, text } = req.body;

        if (!swapOfferId || !senderId || !text) {
            return res.status(400).json({ message: 'Missing required message fields' });
        }

        const { admin } = require('../config/firebase');
        const newMessage = {
            swapOfferId,
            senderId,
            text,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('messages').add(newMessage);

        // Fetch swap offer to find the recipient
        const swapDoc = await db.collection('swapOffers').doc(swapOfferId).get();
        if (swapDoc.exists) {
            const swapData = swapDoc.data();
            const recipientId = senderId === swapData.fromUserId ? swapData.toUserId : swapData.fromUserId;

            // Trigger Notification
            await db.collection('notifications').add({
                userId: recipientId,
                title: 'New Message',
                message: `New message regarding your trade negotiation.`,
                type: 'CHAT_MESSAGE',
                link: `/chat/${swapOfferId}`,
                isRead: false,
                createdAt: new Date().toISOString()
            });

            // Also update the swap offer with a "lastMessageAt" for sorting if needed
            await db.collection('swapOffers').doc(swapOfferId).update({
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        res.status(201).json({ id: docRef.id, ...newMessage });
    } catch (error) {
        console.error("Send Message Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get messages for a swap offer
exports.getMessages = async (req, res) => {
    try {
        const { swapOfferId } = req.params;
        const snapshot = await db.collection('messages')
            .where('swapOfferId', '==', swapOfferId)
            .get();

        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
            const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
            return timeA - timeB;
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Get Messages Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};
