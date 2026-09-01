const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const userWithSameName = users.filter(user => user.username === username);
  return userWithSameName.length === 0;
};

const authenticatedUser = (username, password) => {
  const validUser = users.filter((user) => {
    return (user.username === username) && (user.password === password);
  });
  return validUser.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  // 1. Read from req.body instead of req.params
  const username = req.query.username || req.body.username;
  const password = req.query.password || req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in: Missing username or password" });
  }

  if (authenticatedUser(username, password)) {
    // 2. Encode username instead of raw password in JWT payload
    let accessToken = jwt.sign({
      data: username
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    // 3. Fixed res.send(200) deprecation issue
    return res.status(200).json({ message: "User logged in successfully" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  const review = req.query.review || req.body.review;

  if (books[isbn]) {
    // 4. Fixed typo: books[isbn].reviews instead of books[isbn].review
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review successfully added/updated" });
  } else {
    return res.status(404).json({ message: "Book Not Found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  if (books[isbn]) {
    // 4. Fixed typo: books[isbn].reviews
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review successfully deleted" });
    } else {
      return res.status(404).json({ message: "No review found for this user to delete" });
    }
  } else {
    return res.status(404).json({ message: "Book Not Found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;