const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  const userWithSameName = users.filter(user => user.username === username);
  if (userWithSameName.length > 0) {
    return false;
  } else {
    return true;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  const validUser = users.filter((user) => {
    return (user.username === username) && (user.password === password)
  });
  if (validUser.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.params.username;
  const password = req.params.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60 * 60});

    req.session.authorization = {
      accessToken, username
    }
    return res.send(200).json({message: "User logged in successfully"});
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password Or Sign / Register" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  if (books[isbn]) {
     books[isbn].review[username] = req.body.review;
     return res.status(200).json({message: "Review successfully added"})
  } else {
    return res.status(404).json({message: "Book Not Found"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  if (books[isbn]) {
    delete books[isbn].review[username];
     return res.status(200).json({message: "Review successfully deleted"})
  } else {
    return res.status(404).json({message: "Book Not Found"});
  }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
