const mongoose = require("mongoose");
const cities = require("./cities")
const Restaurant = require("../models/restaurant");
const {places, descriptors} = require("./seedHelpers");


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

// console.log(places, descriptors);
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}
const priceGen = () => {
    let price = ["$", "$$", "$$$"];
    return price[Math.floor(Math.random() * 3)];
}

const seedDB = async() => {
    await Restaurant.deleteMany({});
    for(let i = 0; i< 50; i++) {
        const random271 = Math.floor(Math.random() * 271);
        const restaurant = await new Restaurant ({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random271].city}, ${cities[random271].admin_name}`,
            image: "https://source.unsplash.com/collection/312299",
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Alias adipisci impedit dicta! Ducimus aliquid pariatur totam nesciunt quidem cumque commodi repudiandae doloremque impedit non, qui assumenda! Quam sint sit necessitatibus?",
            price: priceGen(),
        })
        await restaurant.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})