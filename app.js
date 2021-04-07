const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Restaurant = require("./models/restaurant");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError")
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const {restaurantSchema, reviewSchema} = require("./schemas.js");
const Review = require("./models/review");

// mongoose.set('bufferCommands', false);


mongoose.connect("mongodb://127.0.0.1:27017/licenta", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
})

const app = express();


console.log(__dirname)
app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true})); //pt post!
app.use(methodOverride("_method")) //pt update/delete
app.use(express.static(__dirname + '/public')); //pt DESIGN!

//server-side validation
//validate restaurants
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

//validate reviews
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



//main page
app.get("/", (req, res)=>{
    res.render("home");
})

//get
app.get("/restaurants", async (req, res, next)=>{
    
    const restaurants = await Restaurant.find({});
    res.render("restaurants/index", {restaurants})
    
})

//post
app.get("/restaurants/new", (req, res)=>{
    res.render("restaurants/new");
})


app.post("/restaurants", validateRestaurant, catchAsync( async (req, res)=>{ //where the post is submitted to
    // console.log( "BODYYYY" ,req.body.restaurant)

    // if (!req.body.restaurant) throw new ExpressError("Invalid restaurant data", 400);
    // console.log(req.body)
    // this is going to validate our data before we attempt to save with mongoose
   
    const restaurant = new Restaurant(req.body.restaurant);
    await restaurant.save();
    res.redirect(`/restaurants/${restaurant._id}`);
}))

//get by id
app.get("/restaurants/:id", catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id).populate("reviews");
    res.render("restaurants/show", {restaurant});
}))

//update
app.get("/restaurants/:id/edit", catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id);
    res.render("restaurants/edit", {restaurant});
}))

app.put("/restaurants/:id", validateRestaurant, catchAsync( async (req, res)=>{
    const {id} = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant}, {new: true});
    res.redirect(`/restaurants/${restaurant._id}`);
}))

//delete
app.delete("/restaurants/:id", catchAsync( async (req, res)=>{
    const {id} = req.params;
    await Restaurant.findByIdAndDelete(id);
    res.redirect(`/restaurants`);
}))

// REVIEW ROUTES

// POST
app.post("/restaurants/:id/reviews", validateReview, catchAsync( async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id);
    const review = new Review(req.body.review) //its under the key of review because i did for e.g. review[body] review[rating]
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save();
    res.redirect(`/restaurants/${restaurant._id}`);
}))


app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})


app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message= "Something went wrong:("
    console.dir(err)
    res.status(statusCode).render("errors/error", {err, statusCode});
})


app.listen(3000, ()=>{
    console.log("Serving on port 3000");
})