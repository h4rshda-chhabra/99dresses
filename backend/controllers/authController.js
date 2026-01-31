const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || '99dresses_secret_key_fixed_fall_back';
    console.log("DEBUG: Using Secret for JWT:", secret ? "YES (length " + secret.length + ")" : "NO");
    return jwt.sign({ id }, secret, {
        expiresIn: '30d',
    });
};

exports.registerUser = async (req, res) => {
    console.log("📝 Register Request Received:", req.body);
    const { name, email, password, basedIn } = req.body;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (!snapshot.empty) {
            console.log("⚠️ User already exists");
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            email,
            password: hashedPassword,
            credits: 50,
            basedIn: basedIn || '',
            productsSold: 0,
            productsSwapped: 0,
            createdAt: new Date().toISOString()
        };

        const docRef = await usersRef.add(newUser);
        console.log("✅ User Created in Firestore:", docRef.id);

        res.status(201).json({
            _id: docRef.id,
            name,
            email,
            credits: 50,
            basedIn: basedIn || '',
            token: generateToken(docRef.id)
        });

    } catch (error) {
        console.error("❌ Registration Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Compare password
        const isMatch = await bcrypt.compare(password, userData.password);

        if (isMatch) {
            res.json({
                _id: userDoc.id,
                name: userData.name,
                email: userData.email,
                credits: userData.credits,
                basedIn: userData.basedIn || '',
                productsSold: userData.productsSold || 0,
                productsSwapped: userData.productsSwapped || 0,
                token: generateToken(userDoc.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Profile (Protected)
exports.getUserProfile = async (req, res) => {
    // req.user is already set by authMiddleware
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            credits: req.user.credits || 0,
            basedIn: req.user.basedIn || '',
            productsSold: req.user.productsSold || 0,
            productsSwapped: req.user.productsSwapped || 0,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
