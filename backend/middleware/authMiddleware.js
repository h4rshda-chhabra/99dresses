const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || '99dresses_secret_key_fixed_fall_back');

            const userRef = db.collection('users').doc(decoded.id);
            const doc = await userRef.get();

            if (!doc.exists) {
                return res.status(401).json({ message: 'Not authorized, user failed' });
            }

            req.user = {
                _id: doc.id,
                ...doc.data()
            };
            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
