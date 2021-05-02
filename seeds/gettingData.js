const puppeteer = require("puppeteer");
var fs = require("fs");

async function scrapeProduct() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let valoare = [];

    async function getRestaurantInfo() {

        // title
        let title = await page.$eval('h1', el => el.innerText)

        // images
        // let images = await page.$$eval('.thumb.track-click a', el => {return el.map(elem => elem.currentSrc).filter(elem=>elem)})
        let images = await page.$$eval('.thumb.track-click', el => {return el.map(elem => elem.href)})


        // description
        let description = await page.$eval('.local-info-description', el => el.innerText)
        description = description.replace(/\r?\n|\r/g, '');
        
        // price
        let price = await page.$eval('.local-prices', el => el.innerText)
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

        //writing and reading data
        console.log({title, images, description, location, price})
        valoare.push({title, images, description, location, price});
    }

    // const pages = await page.$$eval('#mainContainer > div > div.col-md-9.col-md-push-3 > section.hotel-list > div.page-navigation-cn > ul > li', element => element.length) //cuprinde last + first deci -2
    for (let i = 0; i < 5; i ++){

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