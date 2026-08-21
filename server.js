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

// ROUTE: Homepage
app.get('/homepage', (req, res) => {
    res.render('homepage'); // Looks for views/homepage.ejs
});

// ROUTE: Render the Marketplace Gallery
app.get('/marketplace', (req, res) => {
    // Passes the array of bulk microingredients into your marketplace.ejs template
    res.render('marketplace', { listings: mockListings }); 
});

// ROUTE: Product Detail Page (Dynamic ID)
app.get('/product/:id', (req, res) => {
    // Later we will fetch this specific ingredient ID from PostgreSQL
    res.render('product-page', { productId: req.params.id }); 
});

// ROUTE: List a Product (Seller Form)
app.get('/sell/list', (req, res) => {
    res.render('productListing'); 
});

// ROUTE: User Account Dashboard
app.get('/account', (req, res) => {
    res.render('account'); 
});

// ROUTE: Shopping Cart / Order Commit View
app.get('/cart', (req, res) => {
    res.render('cart'); 
});

// ROUTE: B2B Seller Onboarding Registration
app.get('/registration', (req, res) => {
    res.render('registration'); 
});

// ROUTE: Contact & Information Pages
app.get('/contact', (req, res) => {
    res.render('contactpage'); 
});

app.get('/infopage', (req, res) => {
    res.render('infoPage'); 
});

// Dummy playground
app.get('/test-product', (req, res) => {
    res.render('product-page', { /* add dummy data here if needed */ });
});

// 5. Start the local server
app.listen(PORT, () => {
    console.log(`\n🚀 Ag Marketplace Platform Live!`);
    console.log(`🔗 Access locally at: http://localhost:${PORT}/homepage\n`);
});
