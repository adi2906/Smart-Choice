const express = require("express");
const router = express.Router({mergeParams: true}); //mergeParams:true pt acces la params din app.js (id restaurant)
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError")
const Restaurant = require("../models/restaurant");
const Review = require("../models/review");
const {reviewSchema} = require("../schemas.js");



//validate reviews server-side
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);

    if (error) {
        const message = error.details.map(elem => elem.message).join(",")
        throw new ExpressError(message, 400); 
    }
    else {
        next();
    }

}

// post
router.post("/", validateReview, catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id);
    const review = new Review(req.body.review) //its under the key of review because i did for e.g. review[body] review[rating]
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save();
    res.redirect(`/restaurants/${restaurant._id}`);
}))

// delete
router.delete("/:reviewId", catchAsync( async (req, res)=>{
    const {id, reviewId} = req.params;
    await Restaurant.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/restaurants/${id}`);
}))

module.exports = router;