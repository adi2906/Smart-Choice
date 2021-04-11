const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError")
const Restaurant = require("../models/restaurant");
const {restaurantSchema} = require("../schemas.js");


//validate restaurants server-side
const validateRestaurant = (req, res, next) => {
    const {error} = restaurantSchema.validate(req.body);
    if (error) {
        const message = error.details.map(elem => elem.message).join(",")
        throw new ExpressError(message, 400); 
    }
    else {
        next();
    }
}

//get
router.get("/", catchAsync( async (req, res)=>{
    
    const restaurants = await Restaurant.find({});
    res.render("restaurants/index", {restaurants})
    
}))

//post
router.get("/new", (req, res)=>{
    res.render("restaurants/new");
})


router.post("/", validateRestaurant, catchAsync( async (req, res)=>{ //where the post is submitted to
    // console.log( "BODYYYY" ,req.body.restaurant)

    // if (!req.body.restaurant) throw new ExpressError("Invalid restaurant data", 400);
    // console.log(req.body)    
    const restaurant = new Restaurant(req.body.restaurant);
    await restaurant.save();
    req.flash("success", "Successfully made a new restaurant!");
    res.redirect(`/restaurants/${restaurant._id}`);
}))

//get by id
router.get("/:id", catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id).populate("reviews");
    if(!restaurant) {
        req.flash("error", "Restaurant not found!");
        return res.redirect("/restaurants");
    }
    res.render("restaurants/show", {restaurant});
}))

//update
router.get("/:id/edit", catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id);
    res.render("restaurants/edit", {restaurant});
}))

router.put("/:id", validateRestaurant, catchAsync( async (req, res)=>{
    const {id} = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant}, {new: true});
    req.flash("update", "Successfully updated restaurant!")
    res.redirect(`/restaurants/${restaurant._id}`);
}))

//delete
router.delete("/:id", catchAsync( async (req, res)=>{
    const {id} = req.params;
    await Restaurant.findByIdAndDelete(id);
    req.flash("success", "The restaurant was deleted successfully!")
    res.redirect(`/restaurants`);
}))

module.exports = router;