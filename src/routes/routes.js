const express = require('express');
const router = express.Router();
const { registerUser } = require("../controller/userController")
const { userLogin } = require("../controller/loginController")
const { userAuthentication } = require("../middleware/authentication")
const { createBook, getBooks, updateBook, deleteBooksBYId, getBooksReviews } = require("../controller/bookController")
const {createReview, updateReview, deleteReview} = require("../controller/reviewController")

//User API Route Handlers
router.post("/register", registerUser)
router.post("/login", userLogin)

//Book API Route Handlers
router.post("/books", createBook)
router.get("/books", getBooks)
router.put("/books/:bookId", userAuthentication, updateBook)
router.delete("/books/:bookId", userAuthentication, deleteBooksBYId)
router.get("/books/:bookId", getBooksReviews)

//Review API Route Handlers
router.post("/books/:bookId/review", createReview)


module.exports = router