const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

//routes
const restaurants = require("./routes/restaurants");
const reviews = require("./routes/reviews");

// mongoose.set('bufferCommands', false);


mongoose.connect("mongodb://127.0.0.1:27017/licenta", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
})

const app = express();


console.log(__dirname)
app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true})); //pt post!
app.use(methodOverride("_method")) //pt update/delete
app.use(express.static(path.join(__dirname + '/public'))); //pt design & scripts

const sessionConfig = {
    secret: "licenta2021woo",
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly : true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }

}
app.use(session(sessionConfig));
app.use(flash());



app.use("/restaurants", restaurants);
app.use("/restaurants/:id/reviews", reviews);

//main page
app.get("/", (req, res)=>{
    res.render("home");
})





// app.all("*", (req, res, next) => {
//     next(new ExpressError("Page Not Found", 404));
// })


app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message= "Something went wrong:("
    console.dir(err)
    res.status(statusCode).render("errors/error", {err, statusCode});
})


app.listen(3000, ()=>{
    console.log("Serving on port 3000");
})