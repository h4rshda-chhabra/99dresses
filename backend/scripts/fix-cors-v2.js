const { Storage } = require('@google-cloud/storage');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../config/serviceAccountKey.json'));

const storage = new Storage({
    projectId: serviceAccount.project_id,
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key
    }
});

async function fixCors() {
    try {
        const [buckets] = await storage.getBuckets();
        console.log('📦 Found Buckets in your project:', buckets.map(b => b.name));

        if (buckets.length === 0) {
            console.error('❌ No buckets found. Please ensure Storage is enabled in Firebase Console.');
            return;
        }

        const cors = [
            {
                origin: ['*'], // Temporary wildcard for testing, we can narrow it down later
                method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
                responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                maxAgeSeconds: 3600
            }
        ];

        for (const bucket of buckets) {
            console.log(`📡 Applying CORS to: ${bucket.name}...`);
            await bucket.setCorsConfiguration(cors);
            console.log(`✅ Success for: ${bucket.name}`);
        }

        console.log('\n🚀 ALL DONE! Try uploading again.');
    } catch (error) {
        console.error('❌ Critical Error:', error.message);
        if (error.message.includes('permission')) {
            console.log('💡 Tip: Your Service Account might lack "Storage Admin" permissions.');
        }
    }
}

fixCors();
