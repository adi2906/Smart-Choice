require("dotenv").config()

const mongoose = require("mongoose");
const cities = require("./cities")
const Restaurant = require("../models/restaurant");
const Review = require("../models/review");
const {places, descriptors} = require("./seedHelpers");
const {cloudinary} = require("../cloudinary")
const dateRestaurante = require("./dateRestaurante.json");
const restaurant = require("../models/restaurant");
const review = require("../models/review");

mongoose.connect("mongodb://localhost:27017/licenta", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
})

//number of reviews:
let reviewsSize = 0;
for (let i = 0; i< dateRestaurante.length; i++){
    reviewsSize++;
}


let listOfReviews = new Array(reviewsSize);
for (var i = 0; i < listOfReviews.length; i++) {
    listOfReviews[i] = [];
}

async function createNewReview() {
    for (let i = 0; i < dateRestaurante.length; i++){
        for (let j = 0; j < dateRestaurante[i].reviewObj.length; j++){
            const review = await new Review({
                rating : dateRestaurante[i].reviewObj[j].reviewStars,
                body : dateRestaurante[i].reviewObj[j].reviewBody,
                author: "60abd0f7e6863d282c7948f2"
            })
            await review.save();
            listOfReviews[i][j] = review._id; 
        }
      
    }
}

// Add restaurant with reviews
const seedDBFromScraping = async() => {
    await Restaurant.deleteMany({});
    for(let i = 0; i< dateRestaurante.length; i++) {
        const restaurant = await new Restaurant ({
            author: "6080516302ac0339ec6ce550",
            title: dateRestaurante[i].title,
            location: dateRestaurante[i].location,
            defaultImage: "/media/img/defaultPicture.png",
            images: [],
            description: dateRestaurante[i].description,
            price: dateRestaurante[i].price,
            reviews: [],
        })
        // restaurant.reviews.push("608090168bbc28554880a962"); // MERGEEE!

        // console.log(mongoose.Types.ObjectId.isValid("608052b66a2d2841983dd5d2")) 


        // ADD REVIEWS:
        for (let j = 0; j < listOfReviews[i].length; j++){
            restaurant.reviews.push(listOfReviews[i][j]);
        }

        // ADD IMAGES:
        console.log("Adding images");
        for(let j = 0; j < dateRestaurante[i].images.length; j++){
            const cloud = await cloudinary.uploader.upload(dateRestaurante[i].images[j], { folder: "Licenta"}, function(error, result) {console.log(result, error)});
            let url = cloud.url;
            let filename = cloud.public_id;
            restaurant.images.push({url, filename})
            if (j > 2) {
                break;
            }
        }

        //save
        console.log("Saving restaurant...")
        await restaurant.save();
        console.log("Saved", restaurant);

    }
}

createNewReview().then(()=>{
    seedDBFromScraping().then(() => {
        // console.log(listOfReviews);
        mongoose.connection.close();
    })
})



