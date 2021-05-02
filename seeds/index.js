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
            author: "6080516302ac0339ec6ce550",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random271].city}, ${cities[random271].admin_name}`,
            defaultImage: "https://res.cloudinary.com/adi2906/image/upload/v1619385303/Licenta/default_hrtqph.jpg",
            images: [
                {
                  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png',
                  filename: 'Licenta/bseplctdbwrdagfwex1b'
                },
                {
                  url: 'https://res.cloudinary.com/adi2906/image/upload/v1619295082/Licenta/chraapm4xmmmwyktew8n.jpg',
                  filename: 'Licenta/chraapm4xmmmwyktew8n'
                },
                {
                  url: 'https://res.cloudinary.com/adi2906/image/upload/v1619295082/Licenta/yoypv89w0ltepqw2u6ou.jpg',
                  filename: 'Licenta/yoypv89w0ltepqw2u6ou'
                },
                {
                  url: 'https://res.cloudinary.com/adi2906/image/upload/v1619295083/Licenta/i5l9ruepssznf16pquwd.jpg',
                  filename: 'Licenta/i5l9ruepssznf16pquwd'
                }
            ],
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Alias adipisci impedit dicta! Ducimus aliquid pariatur totam nesciunt quidem cumque commodi repudiandae doloremque impedit non, qui assumenda! Quam sint sit necessitatibus?",
            price: priceGen(),
        })
        await restaurant.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})