import { graphSingleDataPoints, loadSingleLineChart, amortizationGraph } from "./genericGraphs.js";

let dataPoints;
async function getDataPoints() {
    try {
        const response = await fetch('JSON_Data/SP500.json');
        if (!response.ok) {
            throw new Error(`Failed to load data from SP500.json, ${response.status}`);
        }
        const data = await response.json();
        // this just parses the data we want into a format that the graphing library can use
        dataPoints = data.map((entry) => {
            return { x: new Date(entry.year, 0), y: Number(entry.totalReturn), color: Number(entry.totalReturn) < 0 ? '#D8315B' : '#2196F3' };
        });
    } catch (error) {
        console.error(error);
    }
}


async function graphSP500Returns() {
    let newChart = new CanvasJS.Chart('sp500Graph', {
        animationEnabled: true,
        responsive: true,
        theme: "light2",
        title: {
            text: ''
        },
        toolTip: {
            shared: true
        },
        options: {
            responsive: true,
        },
        axisX: {
            title: '',
            valueFormatString: "YYYY",
        },
        axisY: {
            suffix: "%",
        },
        dataPointWidth: 6,
        data: [{
            label: "Median",
            type: "column",
            color: "#2196F3",
            lineColor: "#2196F3",
            markerSize: 0,
            yValueFormatString: "#,###.##",
            xValueFormatString: "YYYY",
            toolTipContent: "{x}<br>{y}%",
            showInLegend: true,
            legendText: 'S&P 500 Annual Return',
            dataPoints: dataPoints,
        }
        ]
    });

    newChart.render()
}
await getDataPoints()
graphSP500Returns()


let monthlyReturns = dataPoints.map((point) => {
    return { x: new Date(point.x).getFullYear(), y: (point.y) / 12 }
})

let calculatedPoints = []
function calculateSP500(year, initial, monthlyContribution) {
    const requiredYears = monthlyReturns.filter((entry) => Number(entry.x) >= Number(year))
    requiredYears.reverse()
    let current = initial
    calculatedPoints = []
    requiredYears.map((entry) => {
        for (let i = 1; i <= 12; i++) {
            current *= 1 + (entry.y / 100)
            current += monthlyContribution
            calculatedPoints.unshift({ x: new Date(entry.x, i), y: current })
        }
    })
}
calculateSP500(2005, 1000, 100)
const request = await fetch('JSON_Data/SP500Monthly.json')
const rawValues = await request.json()
let values = rawValues.map(entry => ({ x: new Date(entry.date), y: entry.value }))
values.splice(-1044) // this removes the data points we never want to display
let temp = []
temp.push({ ...values[0], growth: 0 })
for (let i = 1; i < values.length - 1; i++) {
    temp.push(({ ...values[i], growth: (values[i - 1].y - values[i].y) / values[i].y + 1 }))
}
values = temp
let displayValues = values.slice(0, 336)
loadChart(displayValues, "userSp500Graph")
function loadChart(dataPoints, divId, contriPoints) {
    let chart = new CanvasJS.Chart(divId, {
        // set animation to false to prevent the graph from animating every time the user inputs a new value
        animationEnabled: false,
        theme: "light2",
        title: {
            text: ""
        },
        toolTip: {
            shared: true
        },
        options: {
            responsive: true,
        },
        axisX: {
            title: "",
        },
        axisY: {
            prefix: contriPoints ? "$" : "",
        },
        data: [{
            label: contriPoints ? "Investment Value" : "Index Value",
            type: "area",
            // the color fill from these lines bleed together so lowering the opacity makes it look better
            // I believe the colors #4CAF50 and #2196F3 are the best for this 
            fillOpacity: 0.5,
            color: "#4CAF50",
            lineColor: "#4BC0C0",
            markerSize: 0,
            yValueFormatString: "#,###",
            xValueFormatString: "MM/YYYY",
            toolTipContent: contriPoints ? "Investment Value:${y}" : "Index Value:{y}<br>{x}",
            showInLegend: true,
            legendText: contriPoints ? "Investment Value" : "Index Value",
            legendMarkerType: "square",
            dataPoints: dataPoints,
        },
        {
            label: "Invested",
            type: "line",
            color: "black",
            fillOpacity: 0.3,
            lineColor: "black",
            markerSize: 0,
            markerColor: "black",
            yValueFormatString: "#,###",
            xValueFormatString: "MM/YYYY",
            toolTipContent: "Invested:${y}<br>{x}",
            showInLegend: true,
            legendText: "Invested",
            legendMarkerType: "triangle",
            dataPoints: contriPoints
        }]
    });
    chart.render();
}
const select = document.getElementById('startingYear')
const select2 = document.getElementById('startingYearCalc')
const today = new Date()
for (let year = 1953; year <= today.getFullYear() - 1; year++) {
    const option = document.createElement("option")
    const option2 = document.createElement("option")
    option.value = year
    option.textContent = year
    option2.value = year
    option2.textContent = year
    select.appendChild(option)
    select2.appendChild(option2)
}
select.value = 1998
const strtVl = document.getElementById('strtVl')
const endVl = document.getElementById('endVl')
const percentIncr = document.getElementById('percentIncr')
function updateSPText() {
    strtVl.innerText = Number(displayValues[displayValues.length - 1].y).toLocaleString()
    endVl.innerText = Number(displayValues[0].y).toLocaleString()
    percentIncr.innerText = ((displayValues[0].y - displayValues[displayValues.length - 1].y) / displayValues[displayValues.length - 1].y * 100).toFixed(2) + '%'
}
updateSPText()

select.addEventListener("input", (event) => {
    const year = event.target.value
    for (let i = values.length - 1; i >= 0; i--) {
        if (new Date(values[i].x).getFullYear() == year) {
            displayValues = values.slice(0, i + 1)
            loadChart(displayValues, "userSp500Graph")
            updateSPText()
            break
        }
    }
})
select2.addEventListener("input", (event) => {
    doSomeMathDawg()
})
const mathPoints = values.slice().reverse()
let calculatedInvestmentPoints = []
function doSomeMathDawg() {
    const initial = Number(initialIn.value.replaceAll(',', ''))
    const contri = Number(contriIn.value.replaceAll(',', ''))
    // do nothing
    if (Number.isNaN(initial) || Number.isNaN(contri)) return
    calculatedInvestmentPoints.splice(0)
    const year = select2.value
    let index = 0
    for (let i = 0; i < mathPoints.length - 1; i++) {
        if (new Date(mathPoints[i].x).getFullYear() == year) {
            index = i
            break
        }
    }
    const temp = mathPoints.slice(index)

    calculatedInvestmentPoints.push({
        x: temp[0].x, y: initial, z: initial
    })
    const contr = 100
    for (let i = 1; i <= temp.length - 1; i++) {
        calculatedInvestmentPoints.push({ x: temp[i].x, y: calculatedInvestmentPoints[i - 1].y * temp[i - 1].growth + contri, z: calculatedInvestmentPoints[i - 1].z + contri })
    }
    finalValue.innerText = `$${Math.round(calculatedInvestmentPoints[calculatedInvestmentPoints.length - 1].y).toLocaleString('en-US')}`
    loadChart(calculatedInvestmentPoints, "userSp500GraphCalc", calculatedInvestmentPoints.map(point => ({ x: point.x, y: point.z })))
}

const initialIn = document.getElementById('initalIn')
const contriIn = document.getElementById('contriIn')
initialIn.addEventListener("input", function (event) {
    const raw = event.target.value.replace(/[a-zA-Z-,]/g, '');
    initialIn.value = raw
    if (event.target.value !== "" && event.target.value !== null) {
        if (event.target.value < 0) {
            event.target.value = 0
        }
        doSomeMathDawg()
        initialIn.value = Number(initialIn.value).toLocaleString('en-US')
    } else {
        event.target.value = 0
    }
});
contriIn.addEventListener("input", function (event) {
    const raw = event.target.value.replace(/[a-zA-Z-,]/g, '');
    contriIn.value = raw
    if (event.target.value !== "" && event.target.value !== null) {
        if (event.target.value < 0) {
            event.target.value = 0
        }
        doSomeMathDawg()
        contriIn.value = Number(contriIn.value).toLocaleString('en-US')
    } else {
        event.target.value = 0
    }
});
// loadChart(displayValues, "userSp500GraphCalc")
select2.value = 2005
initialIn.value = '1,000'
contriIn.value = 100
const finalValue = document.getElementById('finalValue')
doSomeMathDawg()