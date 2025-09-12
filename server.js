const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
require('dotenv').config();
const fs = require('fs')
const { Buffer } = require('buffer')
const XLSX = require('xlsx')
const cron = require('node-cron')
const { Scraper, Root, DownloadContent, OpenLinks, CollectContent } = require('nodejs-web-scraper');


async function getHomeAff() {
    try {
        let response = await fetch('https://www.atlantafed.org/-/media/documents/research/housing-and-policy/hoam/HOAM_US_Affordability_Index.xlsx')
        if (!response.ok) throw new Error('Something went wrong fetching the Atlanta Fed Data')
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        fs.writeFileSync('./buffer.xlsx', buffer)
        const pages = XLSX.readFile('./buffer.xlsx')
        const pageName = pages.SheetNames[0]
        const page = pages.Sheets[pageName]
        const csv = XLSX.utils.sheet_to_csv(page)
        fs.writeFileSync('./public/JSON_Data/HOAM_US_Affordability_Index.csv', csv)
    } catch (err) {
        console.log('Error: ', err.message)
    }
}

async function getStLouisApiData(series_id, path) {
    try {
        let apiURL = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${process.env.ST_LOUIS_KEY}&file_type=json`
        let response = await fetch(apiURL)
        if (!response.ok) throw new Error(`Something went wrong trying to get: ${series_id}`)
        let data = await response.json()
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
        console.log('Ran into error', err.message)
    }
}

async function fetchStandardAndPoors() {
    try {
        const url = 'https://www.slickcharts.com/sp500/returns/history.json'
        const response = await fetch(url)
        if (!response.ok) throw new Error('Something went wrong fetching the S&P500 data')
        const data = await response.json()
        fs.writeFileSync('./public/JSON_Data/SP500.json', JSON.stringify(data))
    } catch (error) {
        console.log(error.message)
    }


}

function refreshFiles() {
    getHomeAff()
    getStLouisApiData('MSPNHSUS', './public/JSON_Data/homeSalePrice.json')
    getStLouisApiData('FPCPITOTLZGUSA', './public/JSON_Data/inflation.json')
    getStLouisApiData('MEHOINUSA646N', './public/JSON_Data/medianIncome.json')
    getStLouisApiData('RIFLPBCIANM60NM', './public/JSON_Data/autoRates.json')
    getStLouisApiData('TERMCBCCALLNS', './public/JSON_Data/creditCardRates.json')
    getStLouisApiData('MORTGAGE30US', './public/JSON_Data/mortgageRates.json')
    fetchStandardAndPoors()
    console.log('Data updated')
}

refreshFiles()

// runs at midnight once a day
cron.schedule('0 0 * * *', async (ctx) => {
    console.log(`Task started at ${ctx.triggeredAt.toISOString()}`);
    console.log(`Scheduled for: ${ctx.dateLocalIso}`);
    refreshFiles()
});

app.listen(10000, () => {
    console.log('app has started')
})

doStuff()

async function doStuff() {

    const config = {
        baseSiteUrl: `https://www.multpl.com/s-p-500-historical-prices/table/by-month`,
        startUrl: `https://www.multpl.com/s-p-500-historical-prices/table/by-month`,
        filePath: './images/',
        concurrency: 10,//Maximum concurrent jobs. More than 10 is not recommended.Default is 3.
        maxRetries: 3,//The scraper will try to repeat a failed request few times(excluding 404). Default is 5.       
        logPath: './logs/'//Highly recommended: Creates a friendly JSON for each operation object, with all the relevant data. 
    }


    const scraper = new Scraper(config);//Create a new Scraper instance, and pass config to it.

    //Now we create the "operations" we need:

    const root = new Root();//The root object fetches the startUrl, and starts the process.  

    //Any valid cheerio selector can be passed. For further reference: https://cheerio.js.org/
    const category = new OpenLinks('.category', { name: 'category' });//Opens each category page.

    const article = new OpenLinks('article a', { name: 'article' });//Opens each article page.

    const td = new DownloadContent('td', { name: 'td' });//Downloads images.

    const title = new CollectContent('h1', { name: 'title' });//"Collects" the text from each H1 element.

    const story = new CollectContent('section.content', { name: 'story' });//"Collects" the the article body.

    root.addOperation(category);//Then we create a scraping "tree":
    category.addOperation(article);
    article.addOperation(td);
    article.addOperation(title);
    article.addOperation(story);

    await scraper.scrape(root);

    const articles = article.getData()//Will return an array of all article objects(from all categories), each
    //containing its "children"(titles,stories and the downloaded image urls) 

    //If you just want to get the stories, do the same with the "story" variable:
    const stories = story.getData();

    fs.writeFile('./articles.json', JSON.stringify(articles), () => { })//Will produce a formatted JSON containing all article pages and their selected data.

    fs.writeFile('./stories.json', JSON.stringify(stories), () => { })
    console.log('This ran')

}    