const express = require('express');
const router = express.Router();
const { registerUser } = require("../controller/userController")
const { userLogin } = require("../controller/loginController")
const { userAuthentication } = require("../middleware/authentication")
const { createBook, getBooks, updateBook, deleteBooksBYId } = require("../controller/bookController")
const {updateReview}=require("../controller/reviewController")

//User API Route Handlers
router.post("/register", registerUser)
router.post("/login", userLogin)

//Book API Route Handlers
router.post("/books", createBook)
router.get("/books", getBooks)
router.put("/books/:bookId", userAuthentication, updateBook)
router.delete("/books/:bookId", userAuthentication, deleteBooksBYId)

router.put("/books/:bookid/review/:reviewId", updateReview)


module.exports = router