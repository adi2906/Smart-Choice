const {restaurantSchema, reviewSchema} = require("./schemas.js");
const ExpressError = require("./utils/ExpressError")
const Restaurant = require("./models/restaurant");
const Review = require("./models/review");
const {getLocation} = require("./utils/location")
//location




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

module.exports.map = async (req, res, next)=>{
  console.log("test");
  const {id} = req.params;
  const restaurant = await Restaurant.findById(id);
  let location = await getLocation(restaurant.location).then((result)=> result);
  console.log(location[0]);

  
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

//pagination
module.exports.paginatedResults = (model) => {
    return async (req, res, next) => {
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
  
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const results = {}
  
      results.numberOfEntities = await model.countDocuments().exec();

      if (endIndex < await model.countDocuments().exec()) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      //depaseste existing restaurants
      if(page > Math.ceil(await model.countDocuments().exec()/limit)) {
        req.flash("error", "Page not found!");
        return res.redirect(`/restaurants?page=1&limit=${limit}`);
      }

      try {
        results.results = await model.find().limit(limit).skip(startIndex).exec()
        res.paginatedResults = results
        next()
      } catch (e) {
        req.flash("error", "Page not found!");
        return res.redirect(`/restaurants?page=1&limit=${limit}`);
    }
    }
}