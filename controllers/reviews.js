const Restaurant = require("../models/restaurant");
const Review = require("../models/review");

module.exports.createReview = async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id);
    const review = new Review(req.body.review) //its under the key of review because i did for e.g. review[body] review[rating]
    review.author = req.user._id;
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save();
    req.flash("success", "Created a new review!")
    res.redirect(`/restaurants/${restaurant._id}`);
}


module.exports.deleteReview = async (req, res)=>{
    const {id, reviewId} = req.params;
    await Restaurant.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "The review was successfully deleted!")
    res.redirect(`/restaurants/${id}`);
}