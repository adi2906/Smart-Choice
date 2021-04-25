const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const users = require("../controllers/users")

//register form
router.get("/register", users.renderRegister)

//register
router.post("/register", catchAsync( users.register));

//login form
router.get("/login", users.renderLogin)

//login
router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), users.login)

//logout
router.get("/logout", users.logout)

module.exports = router;