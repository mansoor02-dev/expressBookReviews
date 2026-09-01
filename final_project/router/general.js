const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({'username': username, 'password': password})
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Please enter username or password"});
});

// Get the book list available in the shop
// ====== Async =======
public_users.get('/',async function (req, res) {
  try {
    const allBooks = await new Promise((resolve, reject) => {
      resolve(books);
    });
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Get book details based on ISBN
// ====== Sync =======
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  try  {
    const book = await new Promise((resolve, reject) => {
      resolve(book);
    })
    return res.send(JSON.stringify(books[isbn], null, 4));
  } catch {
    return res.status(404).json({message: "Book Not Found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const author = req.params.author;
  const matchingBooks = await new Promise((resolve, reject) => {
    resolve(Object.values(books).filter(book => book.author === author));
  }) 
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  }
  return res.status(404).json({ message: "Book of author not found" });
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const matchingBooks = await new Promise((resolve, reject) => {
    resolve(Object.values(books).filter(book => book.title === title));
  });
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  }
  return res.status(404).json({ message: "Book of title not found" });
});


//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = await new Promise ((resolve, reject) => {
    resolve(books[isbn]);
  })
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
