const puppeteer = require("puppeteer");
var fs = require("fs");

async function scrapeProduct() {
    const browser = await puppeteer.launch({headless: false});
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




        await valoare.push({title});
        //console.log(valoare[0]);
    }

    
   

    await page.goto(`https://tazz.ro/bucuresti/restaurante?gclid=Cj0KCQjwna2FBhDPARIsACAEc_UAzaEYqJCCIJ0mApBJWaX0jL-x-T7a_5PLXs2_0-8WS8RS_u6JMV4aAmYxEALw_wcB`);
    await page.waitForTimeout(2000)

    for (j = 2; j < 10; j++) {
        

        const restaurant = await page.$(`body > div.tz-wrapper > main > tz-partners > div > div.partnersListLayout > div:nth-child(${j}) > a`); //BUN!!
        console.log(page.url());
            if (restaurant){
                console.log("Gasit restaurant")
                await restaurant.evaluate( restaurant => restaurant.click());
                await page.waitForTimeout(2000)
                //getRestaurantInfo();
                // vezi info / recenzii etc.
                console.log(page.url())
                await page.waitForTimeout(2500)
                await page.goBack();
                await page.waitForTimeout(1000)
                console.log("Added restaurant!");
                
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