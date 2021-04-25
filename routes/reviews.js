const express = require("express");
const router = express.Router({mergeParams: true}); //mergeParams:true pt acces la params din app.js (id restaurant)
const catchAsync = require("../utils/catchAsync");
const Restaurant = require("../models/restaurant");
const Review = require("../models/review");
const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware");
const reviews = require("../controllers/reviews");




// post
router.post("/", isLoggedIn, validateReview, catchAsync( reviews.createReview))

// delete
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,catchAsync( reviews.deleteReview))

module.exports = router;