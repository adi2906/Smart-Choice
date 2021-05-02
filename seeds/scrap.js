require("dotenv").config()

const mongoose = require("mongoose");
const cities = require("./cities")
const Restaurant = require("../models/restaurant");
const {places, descriptors} = require("./seedHelpers");
const {cloudinary} = require("../cloudinary")
const dateRestaurante = require("./dateRestaurante.json");
const restaurant = require("../models/restaurant");

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


const seedDBFromScraping = async() => {
    await Restaurant.deleteMany({});
    for(let i = 0; i< 1; i++) {
        const restaurant = await new Restaurant ({
            author: "6080516302ac0339ec6ce550",
            title: dateRestaurante[i].title,
            location: dateRestaurante[i].location,
            defaultImage: "/media/img/defaultPicture.png",
            images: [],
            description: dateRestaurante[i].description,
            price: dateRestaurante[i].price,
        })
        for(let j = 0; j < dateRestaurante[i].images.length; j++){
            const cloud = await cloudinary.uploader.upload(dateRestaurante[i].images[j], { folder: "Licenta"}, function(error, result) {console.log(result, error)});
            let url = cloud.url;
            let filename = cloud.public_id;
            restaurant.images.push({url, filename})
        }
        await restaurant.save();

        // await restaurant.save();
        // const cloud = await cloudinary.uploader.upload("https://cdn.vox-cdn.com/thumbor/6itLJS9BZ-B5gXPjM1AB_z-ZKVI=/0x0:3000x2000/1200x800/filters:focal(1260x760:1740x1240)/cdn.vox-cdn.com/uploads/chorus_image/image/65890203/iStock_1067331614.7.jpg", { folder: "Licenta"},function(error, result) {console.log(result, error)});
        // let url = cloud.url;
        // let filename = cloud.public_id;
        // restaurant.images.push({url, filename});
        // await restaurant.save();
    }
}

seedDBFromScraping().then(() => {
    mongoose.connection.close();
})