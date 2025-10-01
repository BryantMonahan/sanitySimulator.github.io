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
    console.log(calculatedPoints)

}
calculateSP500(2005, 1000, 100)
const request = await fetch('JSON_Data/SP500Monthly.json')
const rawValues = await request.json()
const values = rawValues.map(entry => ({ x: new Date(entry.date), y: entry.value }))
values.splice(-1044)
loadChart(values, [], [])
function loadChart(realDataPoints, simpleDataPoints, contributedDataPoints) {

    let chart = new CanvasJS.Chart("userSp500Graph", {
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
            prefix: "$"
        },
        data: [{
            label: "Value",
            type: "area",
            // the color fill from these lines bleed together so lowering the opacity makes it look better
            // I believe the colors #4CAF50 and #2196F3 are the best for this 
            fillOpacity: 0.5,
            color: "#4CAF50",
            lineColor: "#4BC0C0",
            markerSize: 0,
            yValueFormatString: "#,###",
            toolTipContent: "Year:{x}<br>Compound:${y}",
            showInLegend: true,
            legendText: "Compound",
            legendMarkerType: "circle",
            dataPoints: realDataPoints,
        },
        {
            label: "Simple",
            type: "area",
            fillOpacity: 0.5,
            color: "#2196F3",
            lineColor: "#065899",
            markerSize: 6,
            yValueFormatString: "#,###",
            toolTipContent: "Simple:${y}",
            showInLegend: true,
            legendText: "Simple",
            legendMarkerType: "circle",
            dataPoints: simpleDataPoints,
        },
        {
            label: "Principal",
            type: "area",
            color: "black",
            fillOpacity: 0.5,
            lineColor: "black",
            markerSize: 6,
            markerColor: "black",
            yValueFormatString: "#,###",
            toolTipContent: "Principal:${y}",
            showInLegend: true,
            legendText: "Principal",
            legendMarkerType: "circle",
            dataPoints: contributedDataPoints
        }]
    });

    // // this changes the text above the graph to display the total amount after the specified time period
    // let time = realDataPoints.length - 1; // replace time with length once the create points function is made
    // // these use innerHTML to allow the text to fade in, if I use innerText it will not fade in
    // if (time != 1) {
    //     if (inflation === 0) {
    //         // `<p id="graph_header" class="graph_headers">With monthly payments of <span style="color:rgb(13, 143, 20)">$${monthlyPayment}</span> it will take <span style="color:rgb(0, 135, 245)">${time}</span> and <span style="color: #D8315B">$${grandTotal}</span> to pay off the initial loan</p>`
    //         graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your total amount after <span style="color:rgb(0, 135, 245)">${time} years</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
    //     } else {
    //         graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your <span style="color: #D8315B">inflation-adjusted</span> total after <span style="color:rgb(0, 135, 245)">${time} years</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
    //     }
    // } else {
    //     if (inflation === 0) {
    //         graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your total amount after <span style="color:rgb(0, 135, 245)">${time} year</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
    //     } else {
    //         graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your <span style="color: #D8315B">inflation-adjusted</span> total after <span style="color:rgb(0, 135, 245)">${time} year</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
    //     }
    // }
    // // this handles bad graph formatting at lower time intervals
    // if (time < 20) {
    //     chart.options.axisX.interval = 1;
    // }
    chart.render();
}

