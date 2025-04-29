import { calculateCompoundPoints, calculateSimplePoints } from "./graphCalculations.js";

var realDataPoints = calculateCompoundPoints(10000, 0.06, 40, 100, 12);
var simpleDataPoints = calculateSimplePoints(10000, 0.06, 40, 100, 12);
var contributedDataPoints = calculateCompoundPoints(10000, 0, 40, 100, 12);
var interval = 12; // default to monthly

const graphHeader = document.getElementById("graph_header");

// Get the values from the input fields
const initalIn = document.getElementById("inital");
const interestIn = document.getElementById("interest");
const lengthIn = document.getElementById("length");
const contributionIn = document.getElementById("contribution");
const inflationIn = document.getElementById("inflation");

var initalFilled = false;
var interestFilled = false;
var lengthFilled = false;
var contributionFilled = false;



function checkAndCalculate() {
    if (initalFilled && interestFilled && lengthFilled && contributionFilled) {
        calculate();
    }
}

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!! MUST COME BACK TO VERIFY INFLATION ADJUSTMENT WORKS !!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

// this takes in the user input and calculates the compound interest based on the formula
function calculate() {
    var inital = Number(initalIn.value);
    var interest = Number(interestIn.value);
    var length = Number(lengthIn.value);
    var contribution = Number(contributionIn.value);
    var inflation;
    if (inflationIn === "" || inflationIn === null) {
        inflation = 0;
        realDataPoints = calculateCompoundPoints(inital, interest / 100, length, contribution, interval);
        simpleDataPoints = calculateSimplePoints(inital, interest / 100, length, contribution, interval);
    } else {
        inflation = Number(inflationIn.value);
        realDataPoints = calculateCompoundPoints(inital, interest / 100, length, contribution, interval);
        simpleDataPoints = calculateSimplePoints(inital, interest / 100, length, contribution, interval);
        // im adjusting for inflation by going back after the points have been calculated normally and adjusting the y value of each point based on the year
        realDataPoints = realDataPoints.map(point => {
            return { x: point.x, y: adjustInflation(point.y, inflation, point.x) };
        });
        simpleDataPoints = simpleDataPoints.map(point => {
            return { x: point.x, y: adjustInflation(point.y, inflation, point.x) };
        });
    }
    contributedDataPoints = calculateCompoundPoints(inital, 0, length, contribution, interval);

    loadChart(realDataPoints, simpleDataPoints, contributedDataPoints);
}

// this is used for the map function to adjust the y value of the data points to account for inflation
function adjustInflation(point, inflation, year) {
    return point * ((1 - inflation / 100) ** year);
}

function loadChart(realDataPoints, simpleDataPoints, contributedDataPoints) {

    var chart = new CanvasJS.Chart("chartContainer", {
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
            dataPoints: simpleDataPoints,
        },
        {
            label: "Contributed",
            type: "area",
            color: "black",
            fillOpacity: 0.5,
            lineColor: "black",
            markerSize: 6,
            markerColor: "black",
            yValueFormatString: "#,###",
            toolTipContent: "Contributed:${y}",
            dataPoints: contributedDataPoints
        }]
    });

    // this changes the text above the graph to display the total amount after the specified time period
    var time = realDataPoints.length - 1; // replace time with length once the creat points function is made
    // these use innerHTML to allow the text to fade in, if I use innerText it will not fade in
    if (time != 1) {
        graphHeader.innerHTML = `<p id="graph_header">Your total amount after ${time} years is $${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</p>`;
    } else {
        graphHeader.innerHTML = `<p id="graph_header">Your total amount after ${time} year is $${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</p>`;
    }
    // this handles bad graph formatting at lower time intervals
    if (time < 20) {
        chart.options.axisX.interval = 1;
    }
    chart.render();
}

window.onload = function () {
    loadChart(realDataPoints, simpleDataPoints, contributedDataPoints);
}

// These event listeners are used to check if the input fields are filled out and if they are, it will call the calculate function
initalIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        initalFilled = true;
        checkAndCalculate();
    } else {
        initalFilled = false;
    }
})

interestIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        interestFilled = true;
        checkAndCalculate();
    } else {
        interestFilled = false;
    }
})

lengthIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        lengthFilled = true;
        checkAndCalculate();
    } else {
        lengthFilled = false;
    }
})

contributionIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        contributionFilled = true;
        checkAndCalculate();
    } else {
        contributionFilled = false;
    }
})

inflationIn.addEventListener("input", function (event) {
    checkAndCalculate();
})