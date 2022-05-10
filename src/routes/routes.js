const express = require('express');
const router = express.Router();
const {registerUser} = require("../controller/userController")
const {userLogin} = require("../controller/loginController")
const {userAuthentication} = require("../middleware/authentication")

router.post("/register", registerUser )
router.post("/login", userLogin)


module.exports = router