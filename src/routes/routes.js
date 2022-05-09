const express = require('express');
const router = express.Router();
const UserController = require("../controller/userController")

router.post("/register", UserController.registerUser )





module.exports = router