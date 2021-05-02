const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn, isAuthor, validateRestaurant} = require("../middleware");
const restaurants = require("../controllers/restaurants");
const multer = require("multer");
const {storage} = require("../cloudinary");
const upload = multer({storage});
const Restaurant = require("../models/restaurant")

function paginatedResults(model) {
    return async (req, res, next) => {
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
  
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const results = {}
  
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
      try {
        results.results = await model.find().limit(limit).skip(startIndex).exec()
        res.paginatedResults = results
        next()
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
    }
  }

//get
router.get("/", paginatedResults(Restaurant), catchAsync(restaurants.index))

//render new restaurant form
router.get("/new", isLoggedIn, restaurants.renderNewForm)

//post 
// router.post("/", isLoggedIn, validateRestaurant, catchAsync( restaurants.createRestaurant ))
router.post("/", isLoggedIn, upload.array("image"), validateRestaurant, catchAsync( restaurants.createRestaurant ))


//get by id
router.get("/:id", catchAsync( restaurants.showRestaurant))

//render edit restaurant form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(restaurants.renderEditForm))

//update 
router.put("/:id", isLoggedIn, upload.array("image"), validateRestaurant, isAuthor, catchAsync( restaurants.updateRestaurant))

//delete
router.delete("/:id", isLoggedIn, isAuthor, catchAsync( restaurants.deleteRestaurant))





module.exports = router;