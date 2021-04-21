const {restaurantSchema, reviewSchema} = require("./schemas.js");
const ExpressError = require("./utils/ExpressError")
const Restaurant = require("./models/restaurant");
const Review = require("./models/review");



module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER:", req.user);
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
}


module.exports.isAuthor = async (req, res, next)=>{
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/restaurants/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/restaurants/${id}`);
    }
    next();
}


//validate restaurants server-side
module.exports.validateRestaurant = (req, res, next) => {
    const {error} = restaurantSchema.validate(req.body);
    if (error) {
        const message = error.details.map(elem => elem.message).join(",")
        throw new ExpressError(message, 400); 
    }
    else {
        next();
    }
}


//validate reviews server-side
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(elem => elem.message).join(",")
        throw new ExpressError(message, 400); 
    }
    else {
        next();
    }
}