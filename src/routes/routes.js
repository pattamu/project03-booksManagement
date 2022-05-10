const express = require('express');
const router = express.Router();
const { registerUser } = require("../controller/userController")
const { userLogin } = require("../controller/loginController")
const { userAuthentication } = require("../middleware/authentication")
const { createBook, getBooks, deleteBooksBYId } = require("../controller/bookController")

router.post("/register", registerUser)
router.post("/login", userLogin)
router.post("/books", createBook)

router.get("/books", getBooks)
router.delete("/books/:bookId", deleteBooksBYId)


module.exports = router