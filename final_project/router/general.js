const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ==========================================
// 1. SERVICE LAYER (Data Retrieval Logic)
// ==========================================
const bookService = {
  getAllBooks: () => Promise.resolve(books),
  
  getBookByISBN: (isbn) => new Promise((resolve, reject) => {
    books[isbn] ? resolve(books[isbn]) : reject("Book Not Found");
  }),

  getBooksByAuthor: (author) => new Promise((resolve, reject) => {
    const results = Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());
    results.length > 0 ? resolve(results) : reject("Book of author not found");
  }),

  getBooksByTitle: (title) => new Promise((resolve, reject) => {
    const results = Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());
    results.length > 0 ? resolve(results) : reject("Book of title not found");
  })
};

// ==========================================
// 2. ROUTE HANDLERS (HTTP Layer)
// ==========================================

// Task 6: User Registration
public_users.post("/register", (req, res) => {
  const username = req.query.username || req.body.username;
  const password = req.query.password || req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Please enter both username and password" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get all books (Async/Await)
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await bookService.getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Task 11: Get book details by ISBN (Promises/Axios)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await bookService.getBookByISBN(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 12: Get book details by Author (Async/Await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const matchingBooks = await bookService.getBooksByAuthor(req.params.author);
    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 13: Get book details by Title (Axios / Async)
public_users.get('/title/:title', async function (req, res) {
  try {
    const matchingBooks = await bookService.getBooksByTitle(req.params.title);
    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 5: Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book Not Found" });
});

module.exports.general = public_users;