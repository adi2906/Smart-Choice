const User = require("../models/user");

module.exports.renderRegister = (req, res)=> {
    res.render("users/register");
}

module.exports.register = async(req, res, next)=>{
    try{
        // console.log(req.body);
        const {firstName, lastName, phone, email, username, password, passwordConfirmation} = req.body;
       
        if (passwordConfirmation != password) {
            throw new Error("Password and confirm password does not match!")
        }
        const user = new User({email, username, firstName, lastName, phone});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to my app!");
            res.redirect("/restaurants");
        })
    }catch(e){
        req.flash("error", e.message);
        res.redirect("register");
    }
    // console.log(registeredUser)
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.firstName}!`); 
    const redirectUrl = req.session.returnTo || "/restaurants";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("update", "You've been logged out!");
    res.redirect("/restaurants");
}