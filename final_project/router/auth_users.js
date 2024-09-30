const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "userttt", password: "pass12" }
];

const isValid = (username) => { 
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password; 
}

// only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username exists and the password matches
    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token with the username as the payload
    const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });

    /// Store the username and JWT in the session
    req.session.username = username; // Store username in session
    req.session.authorization = { accessToken }; // Store token in session

    return res.status(200).json({ message: "Login successful!", accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;  // Assuming the review is sent in the request body
    const username = req.session.username;  // Retrieve the logged-in username from the session

    // Check if the user is logged in
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    // Check if the book with the given ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Get the book object
    const book = books[isbn];

    // Initialize the reviews object if it doesn't exist
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or modify the review for this user
    book.reviews[username] = review;

    return res.status(201).json({ message: "Review successfully added/updated", reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;  // Retrieve the logged-in username from the session

    // Check if the user is logged in
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    // Check if the book with the given ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Get the book object
    const book = books[isbn];

    // Check if the reviews object exists
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review for this user
    delete book.reviews[username];

    return res.status(200).json({ message: "Review successfully deleted", reviews: book.reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
