const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');

const bucketName = 'dresses-c6543.firebasestorage.app';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
});

async function configureCors() {
    try {
        const bucket = admin.storage().bucket();
        console.log(`📡 Attempting to configure CORS for default bucket: ${bucket.name}...`);

        const cors = [
            {
                origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:5174'],
                method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
                responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                maxAgeSeconds: 3600
            }
        ];

        await bucket.setCorsConfiguration(cors);
        console.log(`✅ Success: CORS configuration applied!`);
    } catch (error) {
        console.error('❌ Error configuring CORS:', error.message);
    }
}

configureCors();

configureCors();
