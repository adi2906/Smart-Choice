const Restaurant = require("../models/restaurant");
const {cloudinary} = require("../cloudinary")
const {getLocation} = require("../utils/location")

// const NodeGeocoder = require('node-geocoder');

// //map muta
// const options = {
//     provider: 'opencage',

//     apiKey: '6e18e9ffc1ef42e5826a767dee562987', // for Mapquest, OpenCage, Google Premier
//     formatter: null // 'gpx', 'string', ...
// };

// const geocoder = NodeGeocoder(options);

// async function getLocation (location) {
//     const rets = await geocoder.geocode(location);
//     return rets;
// }
// getLocation('Strada George Constantinescu 2-4, Pipera, București').then((result)=> console.log(result));

module.exports.idk = 3;

module.exports.index = async (req, res) => {
    // let restaurants = await Restaurant.find({}).populate("author");
    let restaurants = res.paginatedResults.results;
    let {next, previous, numberOfEntities} = res.paginatedResults;
    let {page, limit} = req.query;

    // console.log(numberOfEntities)
    // console.log("Next: ", next)
    // console.log("Previous: ", previous)

    res.render("restaurants/index", {restaurants, next, previous, page, limit, numberOfEntities})
}

module.exports.renderNewForm = (req, res) => {
    res.render("restaurants/new");
}

module.exports.createRestaurant = async (req, res)=>{ //where the post is submitted to     
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
        return res.redirect("/restaurants?page=1&limit=10");
    }
    let location = await getLocation(restaurant.location).then((result)=> result);
    // let location = await getLocation('Strada George Constantinescu 2-4, Pipera, București').then((result)=> result);
    // module.exports.showRestaurant = location;
    res.render("restaurants/show", {restaurant, location});
}

module.exports.renderEditForm = async (req, res)=>{
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        req.flash("error", "Cannot find that restaurant!");
        return res.redirect("/restaurants?page=1&limit=10");
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
    res.redirect(`/restaurants?page=1&limit=10`);
}