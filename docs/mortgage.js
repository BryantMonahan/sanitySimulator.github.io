import { calculateAmortization } from "./graphCalculations.js";

var principalDataPoints = [];
var interestDataPoints = [];
var totalPaidDataPoints = [];
calculateAmortization(300000, 7, 30, 0, principalDataPoints, interestDataPoints, totalPaidDataPoints);

const graphHeader = document.getElementById("graph_header");

// Get the values from the input fields
const initalIn = document.getElementById("inital");
const interestIn = document.getElementById("interest");
const lengthIn = document.getElementById("length");
const contributionIn = document.getElementById("contribution");

var initalFilled = false;
var interestFilled = false;
var contributionFilled = false;


function checkAndCalculate() {
    if (initalFilled && interestFilled) {
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
    principalDataPoints = [];
    interestDataPoints = [];
    totalPaidDataPoints = [];

    var inital = Number(initalIn.value);
    var interest = Number(interestIn.value);
    var length = Number(lengthIn.value);
    var contribution = Number(contributionIn.value);



    calculateAmortization(inital, interest, length, contribution, principalDataPoints, interestDataPoints, totalPaidDataPoints);
    loadChart(principalDataPoints, interestDataPoints, totalPaidDataPoints);
}

function loadChart(principalDataPoints, interestDataPoints, totalPaidDataPoints) {

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
            label: "Principal",
            type: "line",
            // the color fill from these lines bleed together so lowering the opacity makes it look better
            // I believe the colors #4CAF50 and #2196F3 are the best for this 
            color: "#2196F3",
            lineColor: "#2196F3",
            markerSize: 6,
            yValueFormatString: "#,###",
            toolTipContent: "Year:{x}<br>Principal:${y}",
            dataPoints: principalDataPoints,
        },
        {
            label: "Interest",
            type: "line",
            color: "#D8315B",
            lineColor: "#D8315B",
            markerSize: 6,
            yValueFormatString: "#,###",
            toolTipContent: "Interest Paid:${y}",
            dataPoints: interestDataPoints,
        },
        {
            label: "Toal Paid",
            type: "line",
            color: "black",
            lineColor: "black",
            markerSize: 6,
            markerColor: "black",
            yValueFormatString: "#,###",
            toolTipContent: "Total:${y}",
            dataPoints: totalPaidDataPoints
        }]
    });


    // this handles bad graph formatting at lower time intervals
    //options.scales.y.beginAtZero = true;
    // chart.options.axisX.interval = 1;
    chart.render();
}

window.onload = function () {
    loadChart(principalDataPoints, interestDataPoints, totalPaidDataPoints);
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

lengthIn.addEventListener("change", function (event) {
    checkAndCalculate();
})

contributionIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        contributionFilled = true;
        checkAndCalculate();
    } else {
        contributionFilled = false;
    }
})
