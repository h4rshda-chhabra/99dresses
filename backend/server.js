const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const path = require('path');

// Load environment variables from absolute path
dotenv.config({ path: path.join(__dirname, '.env') });

// FORCE FIX: If env didn't load, set it manually right now
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'super_secret_fallback_key_99dresses';
    console.log("🛠️  Auto-fixed JWT_SECRET with hardcoded value.");
}

console.log("DEBUG: JWT_SECRET is currently:", process.env.JWT_SECRET ? "DEFINED" : "UNDEFINED");

// Firebase setup is handled in controllers via config/firebase.js
// No explicit connection call needed in server.js for Firebase Admin


const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/swaps', require('./routes/swapRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

app.get('/', (req, res) => {
    res.send('99Dresses Backend is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
