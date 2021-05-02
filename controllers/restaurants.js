const Restaurant = require("../models/restaurant");
const {cloudinary} = require("../cloudinary")


module.exports.index = async (req, res) => {
    let restaurants = await Restaurant.find({}).populate("author");
    console.log(restaurants)
    res.render("restaurants/index", {restaurants})
}

module.exports.renderNewForm = (req, res) => {
    res.render("restaurants/new");
}

module.exports.createRestaurant = async (req, res)=>{ //where the post is submitted to
    // console.log( "BODYYYY" ,req.body.restaurant)
    // if (!req.body.restaurant) throw new ExpressError("Invalid restaurant data", 400);
    // console.log(req.body)    
     
    const restaurant = new Restaurant(req.body.restaurant);
    restaurant.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    restaurant.author = req.user._id;
    restaurant.defaultImage = "/media/img/defaultPicture.png"
    await restaurant.save();
    console.log(restaurant)
    req.flash("success", "Successfully made a new restaurant!");
    res.redirect(`/restaurants/${restaurant._id}`);
}

module.exports.showRestaurant = async (req, res)=>{
    const restaurant = await Restaurant.findById(req.params.id).populate({path: "reviews", populate: {path: "author"}}).populate("author"); //nested 
    // console.log(restaurant);
    if(!restaurant) {
        req.flash("error", "Restaurant not found!");
        return res.redirect("/restaurants");
    }
    res.render("restaurants/show", {restaurant});
}

module.exports.renderEditForm = async (req, res)=>{
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        req.flash("error", "Cannot find that restaurant!");
        return res.redirect("/restaurants");
    }
    
    res.render("restaurants/edit", {restaurant});
}

module.exports.updateRestaurant = async (req, res)=>{
    const {id} = req.params;
    console.log(req.body);
    const restaurant = await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant}, {new: true});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    restaurant.images.push(...imgs); // add toate obj imgs la un array existent 
    await restaurant.save();
    // console.log("======================" , req.body.deleteImages)
    if(req.body.deleteImages){ //pentru delete imgs
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename); //delete pt cloudinary
        }
        await restaurant.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}}) //delete din db
        // console.log(restaurant);
    }
    req.flash("update", "Successfully updated restaurant!")
    res.redirect(`/restaurants/${restaurant._id}`);
}

module.exports.deleteRestaurant = async (req, res)=>{
    const {id} = req.params;
    await Restaurant.findByIdAndDelete(id);
    req.flash("success", "The restaurant was deleted successfully!")
    res.redirect(`/restaurants`);
}