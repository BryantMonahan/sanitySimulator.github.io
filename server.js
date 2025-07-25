const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
require('dotenv').config();
const fs = require('fs')



async function getApiData() {
    // get the median home sale price
    let apiURL = `https://api.stlouisfed.org/fred/series/observations?series_id=MSPNHSUS&api_key=${process.env.ST_LOUIS_KEY}&file_type=json`
    let response = await fetch(apiURL)
    let data = await response.json()
    fs.writeFileSync('./public/JSON_Data/homeSalePrice.json', JSON.stringify(data))
    // get inflation
    apiURL = `https://api.stlouisfed.org/fred/series/observations?series_id=FPCPITOTLZGUSA&api_key=${process.env.ST_LOUIS_KEY}&file_type=json`
    response = await fetch(apiURL)
    data = await response.json()
    fs.writeFileSync('./public/JSON_Data/inflation.json', JSON.stringify(data))
    // get median income
    apiURL = `https://api.stlouisfed.org/fred/series/observations?series_id=MEHOINUSA646N&api_key=${process.env.ST_LOUIS_KEY}&file_type=json`
    response = await fetch(apiURL)
    data = await response.json()
    fs.writeFileSync('./public/JSON_Data/medianIncome.json', JSON.stringify(data))
    // 60 month auto loan
    apiURL = `https://api.stlouisfed.org/fred/series/observations?series_id=RIFLPBCIANM60NM&api_key=${process.env.ST_LOUIS_KEY}&file_type=json`
    response = await fetch(apiURL)
    data = await response.json()
    fs.writeFileSync('./public/JSON_Data/autoRates.json', JSON.stringify(data))
    // credit card rate
    apiURL = `https://api.stlouisfed.org/fred/series/observations?series_id=TERMCBCCALLNS&api_key=${process.env.ST_LOUIS_KEY}&file_type=json`
    response = await fetch(apiURL)
    data = await response.json()
    fs.writeFileSync('./public/JSON_Data/creditCardRates.json', JSON.stringify(data))
    // 30 year fixed mortgage rate
    apiURL = `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=${process.env.ST_LOUIS_KEY}&file_type=json`
    response = await fetch(apiURL)
    data = await response.json()
    fs.writeFileSync('./public/JSON_Data/mortgageRates.json', JSON.stringify(data))
}

getApiData()
app.listen(4200, () => {
    console.log('app has started')
})