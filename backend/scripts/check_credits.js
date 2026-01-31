const fetch = require('node-fetch');

async function testCreditUpdate() {
    try {
        console.log("1. Registering/Logging in User A (Buyer)...");
        const buyerRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Buyer', email: 'buyer_' + Date.now() + '@test.com', password: 'password123' })
        });
        const buyer = await buyerRes.json();
        console.log("Buyer Credits:", buyer.credits);

        console.log("2. Registering User B (Seller)...");
        const sellerRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Seller', email: 'seller_' + Date.now() + '@test.com', password: 'password123' })
        });
        const seller = await sellerRes.json();
        console.log("Seller Credits:", seller.credits);

        // Fetch Profile directly to check
        console.log("3. Fetching Buyer Profile...");
        const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${buyer.token}` }
        });
        const profile = await profileRes.json();
        console.log("Fetched Profile Credits:", profile.credits);

    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testCreditUpdate();
