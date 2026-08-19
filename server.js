const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
require('dotenv').config();
const fs = require('fs')
const { Buffer } = require('buffer')
const XLSX = require('xlsx')
const cron = require('node-cron')
const path = require('path');

// ---- Gary fund log: shared, server-side, no-frills JSON store ----
const GARY_LOG_FILE = path.join(__dirname, 'garyLog.json')

function readGaryLog() {
    try {
        return JSON.parse(fs.readFileSync(GARY_LOG_FILE, 'utf8'))
    } catch (err) {
        return []
    }
}

function writeGaryLog(entries) {
    fs.writeFileSync(GARY_LOG_FILE, JSON.stringify(entries))
}

app.get('/api/gary/log', (req, res) => {
    res.json(readGaryLog())
})

app.post('/api/gary/log', (req, res) => {
    const hours = Number(req.body && req.body.hours)
    if (!hours || hours <= 0) {
        return res.status(400).json({ error: 'hours must be a positive number' })
    }
    const description = typeof (req.body && req.body.description) === 'string' ? req.body.description.slice(0, 60) : ''
    const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        description,
        hours,
        ts: Date.now()
    }
    const entries = readGaryLog()
    entries.push(entry)
    writeGaryLog(entries)
    res.json(entry)
})

app.delete('/api/gary/log/:id', (req, res) => {
    const entries = readGaryLog().filter(e => e.id !== req.params.id)
    writeGaryLog(entries)
    res.json({ ok: true })
})

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
    getHistoricSP500Data()
    console.log('Data updated')
}

refreshFiles()

// runs at midnight once a day
cron.schedule('0 0 * * *', async (ctx) => {
    console.log(`Task started at ${ctx.triggeredAt.toISOString()}`);
    console.log(`Scheduled for: ${ctx.dateLocalIso}`);
    refreshFiles()
});
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }))
app.listen(8080, () => {
    console.log('app has started')
})


async function getHistoricSP500Data() {
    const response = await fetch('https://www.multpl.com/s-p-500-historical-prices/table/by-month')
    const dom = await response.text()
    let lines = dom.split('\n')
    lines = lines.filter(line => (line.includes('<td>') && line.includes('</td>')) || (line.includes('.') && !Number.isNaN(Number(line.replace(',', '')))))

    const values = lines.map(line => {
        if (line.includes('<td>') && line.includes('</td>')) {
            return new Date(line.replace('<td>', '').replace('</td>', ''))
        } else if (line.includes('.') && !Number.isNaN(Number(line.replace(',', '')))) {
            return Number(line.replace(',', ''))
        }
    })
    const objects = []
    for (let i = 0; i < values.length - 2; i += 2) {
        objects.push({ date: values[i], value: values[i + 1] })
    }
    fs.writeFileSync('./public/JSON_Data/SP500Monthly.json', JSON.stringify(objects))

    // console.log(objects)
    // console.log(values.slice(0, 30))
}    