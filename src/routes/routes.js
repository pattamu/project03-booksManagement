const express = require('express');
const router = express.Router();
const UserController = require("../controller/userController")
const { getBooks } = require("../controller/bookController")
const {userLogin} = require("../controller/loginController")
const authentication = require("../middleware/authentication")

router.post("/register", UserController.registerUser )

router.post("/login", userLogin)

router.get("/books", getBooks)


module.exports = router