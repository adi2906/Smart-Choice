const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn, isAuthor, validateRestaurant, paginatedResults} = require("../middleware");
const restaurants = require("../controllers/restaurants");
const multer = require("multer");
const {storage} = require("../cloudinary");
const upload = multer({storage});
const Restaurant = require("../models/restaurant")


//get
router.get("/", paginatedResults(Restaurant), catchAsync(restaurants.index), )

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