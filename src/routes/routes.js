const express = require('express');
const router = express.Router();
const UserController = require("../controller/userController")
const { getBooks } = require("../controller/bookController")
const {registerUser} = require("../controller/userController")
const {userLogin} = require("../controller/loginController")
const {userAuthentication} = require("../middleware/authentication")

router.post("/register", registerUser )
router.post("/login", userLogin)

router.get("/books", getBooks)


module.exports = router