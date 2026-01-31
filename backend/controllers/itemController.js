const { db } = require('../config/firebase');

exports.createItem = async (req, res) => {
    try {
        const { title, description, category, images, ownerId } = req.body;

        const newItem = {
            title,
            description,
            category,
            images: images || [],
            ownerId,
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('items').add(newItem);

        res.status(201).json({ id: docRef.id, ...newItem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getItems = async (req, res) => {
    try {
        const snapshot = await db.collection('items').get();
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const doc = await db.collection('items').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ DELETE Request for Item ID: ${id}`);

        const itemRef = db.collection('items').doc(id);
        const doc = await itemRef.get();

        if (!doc.exists) {
            console.warn(`⚠️ Item not found in Firestore: ${id}`);
            return res.status(404).json({ message: `Item ${id} not found in database.` });
        }

        await itemRef.delete();
        console.log(`✅ Item deleted successfully: ${id}`);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(`❌ Delete Error for ${req.params.id}:`, error.message);
        res.status(500).json({ message: error.message });
    }
};
