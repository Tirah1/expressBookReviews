const express = require('express');
const axios = require ('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." }); 
      } 

      if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists!" }); // 409 Conflict
      }
      users.push({ username, password });
  return res.status(300).json({message: "you are now registered!"});
});

 // Get the book list available in the shop
public_users.get('/',async function (req, res) {
  try {
    const response = await axios.get('https://nginajustina-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai')
    const booksList = response.data;
    return res.status(200).json(booksList);
    } catch (error) {
        console.error("Error fetching books:", error);
        return res.status(500).json({ message: "Failed to fetch books." });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
  return res.status(300).json(books[isbn])
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();
    let matchingBooks = [];
    // Iterate through the books object
  Object.keys(books).forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      matchingBooks.push(books[key]);  // Add books with matching authors to the array
    }
  });
  return res.status(300).json(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    let matchingBooks = [];

// Iterate through the books object
  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      matchingBooks.push(books[key]);  // Add books with matching titles to the array
    }
  });

  return res.status(300).json(matchingBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    // Check if the book with the given ISBN exists
  if (books[isbn]) {
    const reviews = books[isbn].reviews;
  }
    return res.status(300).json(reviews);
});

module.exports.general = public_users;
