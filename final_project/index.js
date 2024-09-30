const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Session middleware
app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware for customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "fingerprint_customer", (err, user) => {
            if (!err) {
                req.user = user; // Attach user info to request
                next(); // Continue to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Define the port for the server
const PORT = 5001;

// Route handling
app.use("/customer", customer_routes); // Use customer routes
app.use("/", genl_routes); // Use general routes

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

