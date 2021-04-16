const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");

router.get("/register", (req, res)=> {
    res.render("users/register");
})
router.post("/register", catchAsync( async(req, res)=>{
    try{
        // console.log(req.body);
        const {firstName, lastName, phone, email, username, password, passwordConfirmation} = req.body;
       
        if (passwordConfirmation != password) {
            throw new Error("Password and confirm password does not match!")
        }
        const user = new User({email, username, firstName, lastName, phone});
        const registeredUser = await User.register(user, password);
        req.flash("success", "Welcome to my app!");
        res.redirect("/restaurants");
    }catch(e){
        req.flash("error", e.message);
        res.redirect("register");
    }
    // console.log(registeredUser)
}));

router.get("/login", (req, res) => {
    res.render("users/login");
})

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/restaurants")
})

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("update", "You've been logged out!");
    res.redirect("/restaurants");
})

module.exports = router;