import { calculateCompoundPoints, calculateSimplePoints } from "./graphCalculations.js";
import { graphSingleDataPoints } from "./genericGraphs.js";

let realDataPoints = calculateCompoundPoints(10000, 0.06, 40, 100, 12);
let simpleDataPoints = calculateSimplePoints(10000, 0.06, 40, 100, 12);
let contributedDataPoints = calculateCompoundPoints(10000, 0, 40, 100, 12);
let interval = 12; // default to monthly

const graphHeader = document.getElementById("graph_header");

// Get the values from the input fields
const initialIn = document.getElementById("initial");
const interestIn = document.getElementById("interest");
const lengthIn = document.getElementById("length");
const contributionIn = document.getElementById("contribution");
const inflationIn = document.getElementById("inflation");

let initialFilled = false;
let interestFilled = false;
let lengthFilled = false;
let contributionFilled = false;

let inflation = 0;



function checkAndCalculate() {
    if (initialFilled && interestFilled && lengthFilled && contributionFilled) {
        calculate();
    }
}

// this takes in the user input and calculates the compound interest based on the formula
function calculate() {
    let initial = Number(initialIn.value);
    let interest = Number(interestIn.value);
    let length = Number(lengthIn.value);
    let contribution = Number(contributionIn.value);
    if (inflationIn === "" || inflationIn === null) {
        inflation = 0;
        realDataPoints = calculateCompoundPoints(initial, interest / 100, length, contribution, interval);
        simpleDataPoints = calculateSimplePoints(initial, interest / 100, length, contribution, interval);
    } else {
        /*
         Because the user inputs the inflation rate as ANNUAL, we can't just subtract it from the interest rate immediately.
         We first must convert it from annual to monthly by reverse engineering the APY formula.
         */
        inflation = Number(inflationIn.value);
        inflation /= 100;
        inflation = 12 * ((inflation + 1) ** (1 / 12) - 1); // this is the formula to convert annual inflation to monthly inflation
        realDataPoints = calculateCompoundPoints(initial, ((interest / 100) - inflation), length, contribution, interval);
        simpleDataPoints = calculateSimplePoints(initial, ((interest / 100) - inflation), length, contribution, interval);
    }
    contributedDataPoints = calculateCompoundPoints(initial, 0, length, contribution, interval);

    loadChart(realDataPoints, simpleDataPoints, contributedDataPoints);
}

function loadChart(realDataPoints, simpleDataPoints, contributedDataPoints) {

    let chart = new CanvasJS.Chart("chartContainer", {
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
            title: "Time in Years",
        },
        axisY: {
            prefix: "$"
        },
        data: [{
            label: "Compound",
            type: "area",
            // the color fill from these lines bleed together so lowering the opacity makes it look better
            // I believe the colors #4CAF50 and #2196F3 are the best for this 
            fillOpacity: 0.5,
            color: "#4CAF50",
            lineColor: "#4BC0C0",
            markerSize: 6,
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

    // this changes the text above the graph to display the total amount after the specified time period
    let time = realDataPoints.length - 1; // replace time with length once the create points function is made
    // these use innerHTML to allow the text to fade in, if I use innerText it will not fade in
    if (time != 1) {
        if (inflation === 0) {
            // `<p id="graph_header" class="graph_headers">With monthly payments of <span style="color:rgb(13, 143, 20)">$${monthlyPayment}</span> it will take <span style="color:rgb(0, 135, 245)">${time}</span> and <span style="color: #D8315B">$${grandTotal}</span> to pay off the initial loan</p>`
            graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your total amount after <span style="color:rgb(0, 135, 245)">${time} years</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
        } else {
            graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your <span style="color: #D8315B">inflation-adjusted</span> total after <span style="color:rgb(0, 135, 245)">${time} years</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
        }
    } else {
        if (inflation === 0) {
            graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your total amount after <span style="color:rgb(0, 135, 245)">${time} year</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
        } else {
            graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">Your <span style="color: #D8315B">inflation-adjusted</span> total after <span style="color:rgb(0, 135, 245)">${time} year</span> is <span style="color:rgb(13, 143, 20)">$${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</span></p>`;
        }
    }
    // this handles bad graph formatting at lower time intervals
    if (time < 20) {
        chart.options.axisX.interval = 1;
    }
    chart.render();
}

window.onload = function () {
    loadChart(realDataPoints, simpleDataPoints, contributedDataPoints);
    graphSingleDataPoints("JSON_Data/inflation.json", "inflationGraph", "", "", "Inflation Rate");

}

// These event listeners are used to check if the input fields are filled out and if they are, it will call the calculate function
// They also limit and adjust users' input
initialIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        initialFilled = true;
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        checkAndCalculate();
    } else {
        initialFilled = false;
    }
})

interestIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        interestFilled = true;
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        checkAndCalculate();
    } else {
        interestFilled = false;
    }
})

lengthIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        lengthFilled = true;
        if (event.target.value > 400) {
            event.target.value = 400;
        } else if (event.target.value < 1) {
            event.target.value = 1;
        }
        checkAndCalculate();
    } else {
        lengthFilled = false;
    }
})

contributionIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        contributionFilled = true;
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        checkAndCalculate();
    } else {
        contributionFilled = false;
    }
})

inflationIn.addEventListener("input", function (event) {
    if (event.target.value < 0) {
        event.target.value = 0;
    }
    checkAndCalculate();
})