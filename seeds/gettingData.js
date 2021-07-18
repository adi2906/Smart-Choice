const puppeteer = require("puppeteer");
var fs = require("fs");

let valoare = [];
let reviewObj = [];



async function scrape1() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();


    async function getRestaurantInfoIaLoc() {

        // title
        let title = await page.$eval('h1 .headline', el => el.innerText)
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
        //console.log(reviewsBody);

        //review body
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
       
        addInfos(title, images, description, location, price, reviewObj)
        reviewObj = [];

        //console.log(valoare[0]);
    }

    
    for (let i = 1; i < 5; i++){

        await page.goto(`https://ialoc.ro/restaurante-bucuresti?p=${i}`);
        await page.waitForTimeout(1000);
        const restaurants = await page.$$eval('.list-item.venue-link', element => element.length)

        for(let j = 1; j < 15; j++){
            const restaurant = await page.$(`#mainContainer > div > div.col-md-9.col-md-push-3 > section.hotel-list > div.hotel-list-cn.clearfix .list-item.venue-link:nth-child(${j})`); //BUN!!
                if (restaurant){
                await restaurant.evaluate( restaurant => restaurant.click());
                await page.waitForTimeout(2000);
                getRestaurantInfoIaLoc();
                await page.waitForTimeout(1500);
                await page.goBack();
                await page.waitForTimeout(1000);
                console.log("Added restaurant!");
            }
        }
    }
    
    await page.goBack();
    await page.waitForTimeout(1000)


    page.close();
    browser.close();

 
}

//2
async function scrape2() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    let reviewObj = [];

    

    //colecteaza date
    async function getRestaurantInfoZileSiNopti() {

        // title
        let title = await page.$eval('.title-area h1', el => el.innerText)
        title = title.trim();
        title = title.replace(/\r?\n|\r/g, '');
        title = title.replace(/\s{2,}/g, ' '); // removes 2+ spaces
        title = title.replace("Nou pe ialoc Sponsorizat", "");



        // images
        // let images = await page.$$eval('.thumb.track-click a', el => {return el.map(elem => elem.currentSrc).filter(elem=>elem)})
        let images = await page.$$eval('#main-galerie-poze > ul li a', el => {return el.map(elem => elem.href)})
        //#main-galerie-poze > ul > li:nth-child(1)
        //#main-galerie-poze > ul > li:nth-child(1)


        // description
        let description = await page.$eval('.text p', el => el.innerText)
        description = description.replace(/\r?\n|\r/g, '');
        
        // price
        let price = "unspecified";
        
        
        // location
        let location = await page.$eval('.info-lista li', el => el.innerText);
        location = location.trim();
        location = location.replace("ADRESA:\n", "");
        

        addInfos(title, images, description, location, price, reviewObj)
        //console.log(valoare[0]);
    }

    
    for (let i = 1; i < 3; i ++){

        await page.setDefaultNavigationTimeout(0); 
        await page.goto(`https://www.zilesinopti.ro/bucuresti/locuri/restaurante/${i}`);
        await page.waitForTimeout(2000)
        //const restaurants = await page.$$eval('.list-item.venue-link', element => element.length)

        for(let j = 1; j < 15; j ++ ){
            const restaurant = await page.$(`body > section.content.lista.cat-locuri > div.container.list > div > div.col-md-8.main.locuri > div.box-lista > ul.list-items > li:nth-child(${j}) > div > a`); //BUN!!
                if (restaurant){
                await restaurant.evaluate( restaurant => restaurant.click());
                await page.waitForTimeout(2000);
                try{
                    await getRestaurantInfoZileSiNopti();
                }catch(e){
                    console.log("Error getting the data from restaurant!")
                }
                await page.waitForTimeout(2000);
                await page.goBack();
                await page.waitForTimeout(1500);
            }
        }
    }
    
    await page.waitForTimeout(1000);
    await page.goBack();

    await page.close();
    await browser.close();
}


async function collectingData(){
    await scrape1(); 
    await scrape2();
    addToJSON();
}
collectingData();


function addInfos(title, images, description, location, price, reviewObj) {
    if (title === "" || images.length == 0 || description === "" || price === ""  || location === "" ){
        console.log("NULL!!!!");
        return false;
    }
    else {
        for (let elem of valoare) {
            if (elem.title === title){
                return false;
            }
        }
        console.log("Added", {title, images, description, location, price, reviewObj})
        valoare.push({title, images, description, location, price, reviewObj});
        // console.log("Added:", valoare[valoare.length-1])
        return true;

    }
}

function addToJSON() {
    console.log("ADDING TO JSON FILE");
    fs.writeFile("./seeds/dateRestaurante.json", JSON.stringify(valoare, null, 2), err => {
        if(err){
            console.log(err);
        }
    })
}

//todo verifica fiecare in parte
