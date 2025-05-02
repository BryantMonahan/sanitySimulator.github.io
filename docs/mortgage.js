import { calculateAmortization } from "./graphCalculations.js";
import { graphSingleDataPoints, graphDoubleDataPoints } from "./genericGraphs.js";

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

// this is decalred outside the function so the graph header can use it for proper formatting
var contribution;
// this takes in the user input and calculates the compound interest based on the formula
function calculate() {
    // this is used to reset the data points so the graph doesn't get cluttered with old data
    principalDataPoints = [];
    interestDataPoints = [];
    totalPaidDataPoints = [];

    var inital = Number(initalIn.value);
    var interest = Number(interestIn.value);
    var length = Number(lengthIn.value);
    contribution = Number(contributionIn.value);
    // this is important for upadting the graph header when there is no contribution
    if (isNaN(contribution)) {
        contributionFilled = false;
        contribution = 0;
    }

    calculateAmortization(inital, interest, length, contribution, principalDataPoints, interestDataPoints, totalPaidDataPoints);
    loadChart(principalDataPoints, interestDataPoints, totalPaidDataPoints);
}

function loadChart(principalDataPoints, interestDataPoints, totalPaidDataPoints) {
    // at some point I want to label the graph where half the principal has been paid off, so this will find x value for me
    let halfPointFound = false;
    let halfPoint;

    for (let i = 0; i < principalDataPoints.length; i++) {
        let element = principalDataPoints[i];
        if (!halfPointFound && element.y < principalDataPoints[0].y / 2) {
            principalDataPoints[i] = { x: element.x, y: element.y, markerType: "triangle", markerColor: "black", markerSize: 10, indexLabel: "Half Paid", indexLabelFontSize: 9 };
            halfPointFound = true;
            console.log("half point found at: " + element.x);
            halfPoint = element.x;
            break;
        }
    }

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
            showInLegend: true,
            legendText: "Principal Paid",
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
            showInLegend: true,
            legendText: "Interest Paid",
            dataPoints: interestDataPoints,
        },
        {
            label: "Total Paid",
            type: "line",
            color: "black",
            lineColor: "black",
            markerSize: 6,
            markerColor: "black",
            yValueFormatString: "#,###",
            toolTipContent: "Total:${y}",
            showInLegend: true,
            legendText: "Total Paid",
            dataPoints: totalPaidDataPoints
        },

        ]
    });


    // this handles bad graph formatting at lower time intervals
    //options.scales.y.beginAtZero = true;
    // chart.options.axisX.interval = 1;
    let monthlyPayment = (Math.round((totalPaidDataPoints[2].y - totalPaidDataPoints[1].y) / 12)).toLocaleString("en-US");
    let grandTotal = Math.round(totalPaidDataPoints[totalPaidDataPoints.length - 1].y).toLocaleString("en-US");
    let time;
    if (contributionFilled) {
        // this if block is here pretty much only to handle when a user inputs a tiny contribution that messes with the formatting
        if (!Number.isInteger(totalPaidDataPoints[totalPaidDataPoints.length - 1].x)) {
            time = Math.floor((totalPaidDataPoints.length - 2)) + " years " + Math.round(((principalDataPoints[principalDataPoints.length - 1].x) % 1) * 12) + " months";
        } else {
            time = Math.floor((totalPaidDataPoints.length - 1)) + " years ";
        }
        graphHeader.innerHTML = `<p id="graph_header">With monthly payments of $${monthlyPayment} it will take ${time} and $${grandTotal} to pay off the inital loan</p>`;
    } else {
        time = Math.floor((totalPaidDataPoints.length - 1)) + " years";
        graphHeader.innerHTML = `<p id="graph_header">With monthly payments of $${monthlyPayment} it will take ${time} and $${grandTotal} to pay off the inital loan</p>`;
    }
    chart.render();
}

// loads the graphs with the default values assigned at the top of the file
window.onload = function () {
    loadChart(principalDataPoints, interestDataPoints, totalPaidDataPoints);
    // its crucial that the charts are loaded after the DOM to prevent the page from breaking
    //graphSingleDataPoints("JSON_Data/homeSalePrice.json", "medianMortgageGraph", "", "Years", "Median New Home Sale Price");
    graphDoubleDataPoints("JSON_Data/homeSalePrice.json", "JSON_Data/medianIncome.json", "medianMortgageGraph", "", "Years", "Median New Home Sale Price", "Median Household Income");
    graphSingleDataPoints("JSON_Data/mortgageRates.json", "mortgageRatesGraph", "", "Years", "Median 30-Year Fixed Mortgage Rate");

}

// These event listeners are used to check if the input fields are filled out and if they are, it will call the calculate function
initalIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        initalFilled = true;
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        checkAndCalculate();
    } else {
        initalFilled = false;
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

lengthIn.addEventListener("change", function (event) {
    checkAndCalculate();
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
        checkAndCalculate();
    }
})
