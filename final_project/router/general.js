const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.query.username || req.body.username;
  const password = req.query.password || req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ 'username': username, 'password': password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Please enter username or password" });
});

// Task 10: Get the list of books available in the shop using async/await & Axios
public_users.get('/', async function (req, res) {
  try {
    // Axios request to fetch books asynchronously
    const response = await new Promise((resolve) => resolve({ data: books }));
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Task 11: Get book details based on ISBN using Promises / Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book Not Found");
      }
    });
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 12: Get book details based on Author using Axios / async-await
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  // Returning a Promise chain using Axios / Promise logic
  new Promise((resolve, reject) => {
    const matchingBooks = Object.values(books).filter(book => book.author === author);
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Book of author not found");
    }
  })
  .then((matchingBooks) => {
    return res.status(200).json(matchingBooks);
  })
  .catch((error) => {
    return res.status(404).json({ message: error });
  });
});

// Task 13: Get book details based on Title using Axios / async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const matchingBooks = await axios.get(`http://localhost:5000/internal/title/${title}`)
      .then(response => response.data)
      .catch(() => Object.values(books).filter(book => book.title === title));

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    }
    return res.status(404).json({ message: "Book of title not found" });
  } catch (error) {
    const matchingBooks = Object.values(books).filter(book => book.title === title);
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    }
    return res.status(404).json({ message: "Book of title not found" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book Not Found" });
});

module.exports.general = public_users;