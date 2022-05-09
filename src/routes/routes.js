const express = require('express');
const router = express.Router();
const UserController = require("../controller/userController")
const {userLogin} = require("../controller/loginController")
const authentication = require("../middleware/authentication")

router.post("/register", UserController.registerUser )
router.post("/login", userLogin)


module.exports = router