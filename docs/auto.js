import { graphSingleDataPoints, loadSingleLineChart, amortizationGraph } from "./genericGraphs.js";
import { calculateAmortization } from "./graphCalculations.js";
graphSingleDataPoints("JSON_Data/autoRates.json", "autoRatesGraph", "", "", "60-Month Auto Rate");

let depreciationPoints = [
    { x: 0, y: 100 },
    { x: 1, y: 84 },
    { x: 2, y: 72 },
    { x: 3, y: 61 },
    { x: 4, y: 52 },
    { x: 5, y: 45 },
];
let chart = loadSingleLineChart(depreciationPoints, "depreciationGraph", "", "", "Value %");
chart.options.data[0].xValueFormatString = "Year #0";
chart.options.data[0].markerSize = 7;
chart.options.axisX.valueFormatString = "Year #0";
chart.options.axisX.minimum = 0;
chart.options.axisY.maximum = 100;
chart.options.axisX.maximum = 5;
chart.options.axisY.title = "% Of Original Value";

let headerObject = new Object();
headerObject.text = "<p>Placeholder Text<\p>";
let principalDataPoints = [];
let interestDataPoints = [];
let totalPaidDataPoints = [];
calculateAmortization(35000, 9, 5, 0, principalDataPoints, interestDataPoints, totalPaidDataPoints);
let amortizationGraphDiv = amortizationGraph("amortizationGraph", principalDataPoints, interestDataPoints, totalPaidDataPoints, headerObject, false);
amortizationGraphDiv.options.data[0].markerSize = 8;
amortizationGraphDiv.options.data[1].markerSize = 8;
amortizationGraphDiv.options.data[2].markerSize = 8;

const initialInput = document.getElementById("initial");
const interestInput = document.getElementById("interest");
const lengthInput = document.getElementById("length");
const graphHeader = document.getElementById("graph_header");

let initialFilled = false;
let interestFilled = false;

window.onload = function () {
    lengthInput.value = 5;
    chart.render();
    amortizationGraphDiv.render();
    graphHeader.innerHTML = headerObject.text;
};


function checkAndCalculate() {
    if (initialFilled && interestFilled) {
        // this is used to reset the data points so the graph doesn't get cluttered with old data
        principalDataPoints = [];
        interestDataPoints = [];
        totalPaidDataPoints = [];

        let initial = Number(initialInput.value);
        let interest = Number(interestInput.value);
        let length = Number(lengthInput.value);
        console.log(initial, interest, length);
        calculateAmortization(initial, interest, length, 0, principalDataPoints, interestDataPoints, totalPaidDataPoints);
        amortizationGraphDiv = amortizationGraph("amortizationGraph", principalDataPoints, interestDataPoints, totalPaidDataPoints, headerObject, false);
        graphHeader.innerHTML = headerObject.text;
        amortizationGraphDiv.render();
    }
}

// These event listeners are used to check if the input fields are filled out and if they are, it will call the calculate function
initialInput.addEventListener("input", function (event) {
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

interestInput.addEventListener("input", function (event) {
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

lengthInput.addEventListener("change", function (event) {
    checkAndCalculate();
})