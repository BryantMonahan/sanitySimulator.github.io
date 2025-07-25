const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
require('dotenv').config();
const fs = require('fs')
const { Buffer } = require('buffer')
const XLSX = require('xlsx')

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

getHomeAff()
getStLouisApiData('MSPNHSUS', './public/JSON_Data/homeSalePrice.json')
getStLouisApiData('FPCPITOTLZGUSA', './public/JSON_Data/inflation.json')
getStLouisApiData('MEHOINUSA646N', './public/JSON_Data/medianIncome.json')
getStLouisApiData('RIFLPBCIANM60NM', './public/JSON_Data/autoRates.json')
getStLouisApiData('TERMCBCCALLNS', './public/JSON_Data/creditCardRates.json')
getStLouisApiData('MORTGAGE30US', './public/JSON_Data/mortgageRates.json')

app.listen(10000, () => {
    console.log('app has started')
})