const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 1. Configure Express to use EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Serve your global static assets (CSS, JS, Images, Fonts)
app.use(express.static(path.join(__dirname, 'public')));

// 3. Dummy database data for your B2B agricultural marketplace
const mockListings = [
    { id: 101, name: "USP Grade Citric Acid Powder", qty: "450 lbs", price: 1200, expires: "2027-04-12" },
    { id: 102, name: "Organic Xanthan Gum Batch B", qty: "200 lbs", price: 2400, expires: "2026-11-30" },
    { id: 103, name: "Pure Ascorbic Acid (Vitamin C)", qty: "600 lbs", price: 4100, expires: "2027-01-15" }
];

// 4. ROUTE: Render the Marketplace Gallery
app.get('/marketplace', (req, res) => {
    // Passes the array of bulk microingredients into your marketplace.ejs template
    res.render('marketplace', { listings: mockListings }); 
});

// 5. Start the local server
app.listen(PORT, () => {
    console.log(`\n🚀 Ag Marketplace Platform Live!`);
    console.log(`🔗 Access locally at: http://localhost:${PORT}/marketplace\n`);
});