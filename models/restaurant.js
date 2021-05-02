const mongoose = require("mongoose");
const Review = require("./review")
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("representation").get(function() { //virtual ca sa nu mai stochez in db deoarece e derivat din datele pe care le stochez deja (url)
    // this = image normal func
    return this.url.replace("/upload", "/upload/w_300")
})

const RestaurantSchema = new Schema({
    title: String,
    defaultImage: String,
    images: [ImageSchema],
    price: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, { timestamps: { createdAt: 'created_at' }} );

// query middleware
// doc este obiectul care a fost sters
RestaurantSchema.post("findOneAndDelete", async function(doc){
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
    console.log(doc)
})


module.exports = mongoose.model("Restaurant", RestaurantSchema);