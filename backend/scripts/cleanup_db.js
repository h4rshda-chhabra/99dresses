const { db } = require('../config/firebase');

const collectionsToClear = [
    'users',
    'items',
    'bids',
    'swapOffers',
    'messages',
    'reviews',
    'transactions',
    'notifications'
];

async function deleteCollection(collectionPath, batchSize = 100) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

async function clearDatabase() {
    console.log("🚀 Starting database cleanup...");

    for (const collectionName of collectionsToClear) {
        try {
            console.log(`🧹 Clearing collection: ${collectionName}...`);
            await deleteCollection(collectionName);
            console.log(`✅ Collection ${collectionName} cleared.`);
        } catch (error) {
            console.error(`❌ Error clearing collection ${collectionName}:`, error.message);
        }
    }

    console.log("🏁 Database cleanup complete!");
    process.exit(0);
}

// Safety check: Require a specific flag to run
if (process.argv.includes('--force')) {
    clearDatabase();
} else {
    console.log("⚠️  WARNING: This script will PERMANENTLY delete all data in the following collections:");
    console.log(collectionsToClear.join(', '));
    console.log("\nTo proceed, run the script with the --force flag:");
    console.log("node scripts/cleanup_db.js --force");
    process.exit(0);
}
