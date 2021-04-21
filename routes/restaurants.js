const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Restaurant = require("../models/restaurant");
const {isLoggedIn, isAuthor, validateRestaurant} = require("../middleware");



//get
router.get("/", catchAsync( async (req, res)=>{
    
    const restaurants = await Restaurant.find({}).populate("author");
    res.render("restaurants/index", {restaurants})
    
}))

//post
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("restaurants/new");
})


router.post("/", isLoggedIn, validateRestaurant, catchAsync( async (req, res)=>{ //where the post is submitted to
    // console.log( "BODYYYY" ,req.body.restaurant)

    // if (!req.body.restaurant) throw new ExpressError("Invalid restaurant data", 400);
    // console.log(req.body)    
    const restaurant = new Restaurant(req.body.restaurant);
    restaurant.author = req.user._id;
    await restaurant.save();
    req.flash("success", "Successfully made a new restaurant!");
    res.redirect(`/restaurants/${restaurant._id}`);
}))

//get by id
router.get("/:id", catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id).populate({path: "reviews", populate: {path: "author"}}).populate("author"); //nested 
    // console.log(restaurant);
    if(!restaurant) {
        req.flash("error", "Restaurant not found!");
        return res.redirect("/restaurants");
    }
    res.render("restaurants/show", {restaurant});
}))

//update
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync( async (req, res)=>{
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        req.flash("error", "Cannot find that restaurant!");
        return res.redirect("/restaurants");
    }
    
    res.render("restaurants/edit", {restaurant});
}))

router.put("/:id", isLoggedIn, validateRestaurant, isAuthor, catchAsync( async (req, res)=>{
    const {id} = req.params;
  
    const restaurant = await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant}, {new: true});
    req.flash("update", "Successfully updated restaurant!")
    res.redirect(`/restaurants/${restaurant._id}`);
}))

//delete
router.delete("/:id", isLoggedIn, isAuthor, catchAsync( async (req, res)=>{
    const {id} = req.params;
    await Restaurant.findByIdAndDelete(id);
    req.flash("success", "The restaurant was deleted successfully!")
    res.redirect(`/restaurants`);
}))

module.exports = router;