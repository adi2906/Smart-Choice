const express = require("express");
const router = express.Router({mergeParams: true}); //mergeParams:true pt acces la params din app.js (id restaurant)
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError")
const Restaurant = require("../models/restaurant");
const Review = require("../models/review");
const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware");





// post
router.post("/", isLoggedIn, validateReview, catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id);
    const review = new Review(req.body.review) //its under the key of review because i did for e.g. review[body] review[rating]
    review.author = req.user._id;
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save();
    req.flash("success", "Created a new review!")
    res.redirect(`/restaurants/${restaurant._id}`);
}))

// delete
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,catchAsync( async (req, res)=>{
    const {id, reviewId} = req.params;
    await Restaurant.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "The review was successfully deleted!")
    res.redirect(`/restaurants/${id}`);
}))

module.exports = router;