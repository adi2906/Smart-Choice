const puppeteer = require("puppeteer");
var fs = require("fs");

async function scrapeProduct() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let valoare = [];
    let reviewObj = [];


    async function getRestaurantInfo() {

        // title
        let title = await page.$eval('h1', el => el.innerText)
        title = title.trim();
        title = title.replace(/\r?\n|\r/g, '');
        title = title.replace(/\s{2,}/g, ' '); // removes 2+ spaces
        title = title.replace("Nou pe ialoc Sponsorizat", "");



        // images
        // let images = await page.$$eval('.thumb.track-click a', el => {return el.map(elem => elem.currentSrc).filter(elem=>elem)})
        let images = await page.$$eval('.thumb.track-click', el => {return el.map(elem => elem.href)})


        // description
        let description = await page.$eval('.local-info-description', el => el.innerText)
        description = description.replace(/\r?\n|\r/g, '');
        
        // price
        let price = await page.$eval('.property.price', el => el.innerText)
        price = price.trim();
        if (price.toUpperCase() === ("PREȚ ACCESIBIL")){
            price = "$"
        } else if (price.toUpperCase() === ("PREȚ MODERAT")){
            price = "$$"
        } else { 
            price = "$$$"
        }
        
        // location
        let location = await page.$eval('.address', el => el.innerText);
        location = location.trim();

        // reviews
        let reviewsBody = await page.$$eval('.review-text p', el => {return el.map(elem => elem.innerText)})
        let reviewsStars = await page.$$eval('.review-text .star', (nodes) => nodes.map((n) => {
            let counter = 0;
            for (let i = 0; i < n.children.length; i++) {
                if(n.children[i].className === "fas fa-star"){
                    counter++;
                }
            }
            return counter;
        }))

        for (let i = 0; i < reviewsBody.length; i ++){
            reviewsBody[i] = reviewsBody[i].trim().replace(/\r?\n|\r/g, '');
            if(reviewsBody[i].length < 5 || reviewsBody[i].length > 1000){
                reviewsBody.splice(i, 1);
                reviewsStars.splice(i, 1);
                i--;
                continue;
            }
            reviewObj.push({reviewBody:reviewsBody[i], reviewStars:reviewsStars[i]});
        }
       
        await valoare.push({title, images, description, location, price, reviewObj});
        reviewObj = [];

        //console.log(valoare[0]);
    }

    
    for (let i = 1; i < 5; i ++){

        await page.goto(`https://ialoc.ro/restaurante-bucuresti?p=${i}`);
        await page.waitForTimeout(1000)
        const restaurants = await page.$$eval('.list-item.venue-link', element => element.length)

        for(let j = 1; j < restaurants; j ++ ){
            const restaurant = await page.$(`#mainContainer > div > div.col-md-9.col-md-push-3 > section.hotel-list > div.hotel-list-cn.clearfix > div:nth-child(${j})`); //BUN!!
                if (restaurant){
                await restaurant.evaluate( restaurant => restaurant.click());
                await page.waitForTimeout(2000)
                getRestaurantInfo();
                await page.waitForTimeout(500)
                await page.goBack();
                await page.waitForTimeout(1000)
                console.log("Added restaurant!");
            }
        }
    }
    
    await page.goBack();
    await page.waitForTimeout(1000)


    page.close();
    browser.close();

    fs.writeFile("./seeds/dateRestaurante.json", JSON.stringify(valoare, null, 2), err => {
        if(err){
            console.log(err);
        }
    })
}

scrapeProduct();