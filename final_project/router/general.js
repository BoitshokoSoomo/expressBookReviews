const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let users = require('./auth_users.js').users;
const public_users = express.Router();
const baseUrl = 'http://localhost:5000';

const getBookByIsbn = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  });
};

const getBooksByField = (field, value) => {
  return new Promise((resolve, reject) => {
    const result = Object.values(books).filter(book => book[field] === value);
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(new Error("No books found"));
    }
  });
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. You can now login." });
});

public_users.get('/', async function (req, res) {
  return res.status(200).json(books);
});

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByIsbn(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const result = await getBooksByField("author", author);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const result = await getBooksByField("title", title);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book." });
  }
});

public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${baseUrl}/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`${baseUrl}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`${baseUrl}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

module.exports.general = public_users;
