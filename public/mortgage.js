import { calculateAmortization } from "./graphCalculations.js";
import { graphSingleDataPoints, graphDoubleDataPoints, graphSingleCSVDataPoints } from "./genericGraphs.js";

let principalDataPoints = [];
let interestDataPoints = [];
let totalPaidDataPoints = [];
calculateAmortization(300000, 7, 30, 0, principalDataPoints, interestDataPoints, totalPaidDataPoints);

const graphHeader = document.getElementById("graph_header");
const affordOutput = document.getElementById("affordOutput");

// Get the values from the input fields
const initialIn = document.getElementById("initial");
const interestIn = document.getElementById("interest");
const lengthIn = document.getElementById("length");
const contributionIn = document.getElementById("contribution");

const incomeIn = document.getElementById("income");
const affordInterestIn = document.getElementById("affordInterest");
const affordLengthIn = document.getElementById("affordLength");
const additionalIn = document.getElementById("additional");

let incomeFilled = true;
let affordInterestFilled = true;
let additionalFilled = true;

let initialFilled = true;
let interestFilled = true;
let contributionFilled = true;

function checkAndCalculate() {
    if (initialFilled && interestFilled) {
        calculate();
    }
}

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!! MUST COME BACK TO VERIFY INFLATION ADJUSTMENT WORKS !!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

// this is declared outside the function so the graph header can use it for proper formatting
let contribution;
// this takes in the user input and calculates the compound interest based on the formula
function calculate() {
    // this is used to reset the data points so the graph doesn't get cluttered with old data
    principalDataPoints = [];
    interestDataPoints = [];
    totalPaidDataPoints = [];

    let initial = Number(initialIn.value.replace(/,/g, ''));
    let interest = Number(interestIn.value);
    let length = Number(lengthIn.value);
    contribution = Number(contributionIn.value);
    // this is important for updating the graph header when there is no contribution
    if (isNaN(contribution)) {
        contributionFilled = false;
        contribution = 0;
    }

    calculateAmortization(initial, interest, length, contribution, principalDataPoints, interestDataPoints, totalPaidDataPoints);
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
            halfPoint = element.x;
            break;
        }
    }

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
            legendText: "Principal Left",
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
        graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">With monthly payments of <span style="color:rgb(13, 143, 20)">$${monthlyPayment}</span> it will take <span style="color:rgb(0, 135, 245)">${time}</span> and <span style="color: #D8315B">$${grandTotal}</span> to pay off the initial loan</p>`;
    } else {
        time = Math.floor((totalPaidDataPoints.length - 1)) + " years";
        graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">With monthly payments of <span style="color:rgb(13, 143, 20)">$${monthlyPayment}</span> it will take <span style="color:rgb(0, 135, 245)">${time}</span> and <span style="color: #D8315B">$${grandTotal}</span> to pay off the initial loan</p>`;
    }
    chart.render();
}

// loads the graphs with the default values assigned at the top of the file
window.onload = function () {
    loadChart(principalDataPoints, interestDataPoints, totalPaidDataPoints);
    // its crucial that the charts are loaded after the DOM to prevent the page from breaking
    //graphSingleDataPoints("JSON_Data/homeSalePrice.json", "medianMortgageGraph", "", "Years", "Median New Home Sale Price");
    graphDoubleDataPoints("JSON_Data/homeSalePrice.json", "JSON_Data/medianIncome.json", "medianMortgageGraph", "", "", "Median New Home Sale Price", "Median Household Income");
    graphSingleDataPoints("JSON_Data/mortgageRates.json", "mortgageRatesGraph", "", "", "30-Year Fixed Mortgage Rate");
    const affordData = graphSingleCSVDataPoints("", "homeAffordabilityGraph", "Income Gap");
    lengthIn.value = 30;
    let final = 0
    affordData.then((value) => document.getElementById("addAnnualIncome").innerHTML = "$" + Math.round(value[value.length - 1].y).toLocaleString('en-US'))
    console.log(final)
    final = Math.round(final)
    document.getElementById("addAnnualIncome").innerHTML = final.toLocaleString('en-US');
}

// These event listeners are used to check if the input fields are filled out and if they are, it will call the calculate function
initialIn.addEventListener("input", function (event) {
    const raw = event.target.value.replace(/[a-zA-Z,]/g, '');
    initialIn.value = raw
    if (event.target.value !== "" && event.target.value !== null) {
        initialFilled = true;
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        checkAndCalculate();
        initialIn.value = Number(initialIn.value).toLocaleString('en-US')
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

lengthIn.addEventListener("change", function (event) {
    checkAndCalculate();
})

contributionIn.addEventListener("input", function (event) {
    const raw = event.target.value.replace(/[a-zA-Z,]/g, '');
    contributionIn.value = raw
    if (event.target.value !== "" && event.target.value !== null) {
        contributionFilled = true;
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        checkAndCalculate();
        contributionIn.value = Number(contributionIn.value).toLocaleString('en-US')
    } else {
        contributionFilled = false;
        checkAndCalculate();
    }
})

// the code for the affordability calculator will be kept below this line
function checkAndCalculateAffordability() {
    if (incomeFilled && affordInterestFilled) {
        let monthlyIncome = Number(incomeIn.value.replace(/[a-zA-Z,]/g, '')) / 12;
        let maxPayment = monthlyIncome * 0.28;
        if (additionalFilled) {
            maxPayment -= Number(additionalIn.value.replace(/[a-zA-Z,]/g, ''));
        }
        let months = Number(affordLengthIn.value) * 12;
        let interest = Number(affordInterestIn.value) / 100;
        let total = maxPayment * ((1 - Math.pow(1 + interest / 12, -months)) / (interest / 12));
        isNaN(total) ? total = 0 : total;
        affordOutput.innerHTML = `You can afford a loan of <span style="color:rgb(13, 143, 20)">$${Math.round(total).toLocaleString("en-US")}</span>`;
    }
}

incomeIn.addEventListener("input", function (event) {
    const raw = event.target.value.replace(/[a-zA-Z,]/g, '');
    incomeIn.value = raw
    if (event.target.value !== "" && event.target.value !== null) {
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        incomeFilled = true;
        checkAndCalculateAffordability();
        incomeIn.value = Number(incomeIn.value).toLocaleString('en-US')
    } else {
        incomeFilled = false;
    }
});

affordInterestIn.addEventListener("input", function (event) {
    if (event.target.value !== "" && event.target.value !== null) {
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        affordInterestFilled = true;
        checkAndCalculateAffordability();
    } else {
        affordInterestFilled = false;
    }
});

affordLengthIn.addEventListener("input", function (event) {
    checkAndCalculateAffordability();
});

additionalIn.addEventListener("input", function (event) {
    const raw = event.target.value.replace(/[a-zA-Z,]/g, '');
    additionalIn.value = raw

    if (event.target.value !== "" && event.target.value !== null) {
        if (event.target.value < 0) {
            event.target.value = 0;
        }
        additionalFilled = true;
        checkAndCalculateAffordability();
        additionalIn.value = Number(additionalIn.value).toLocaleString('en-US')
    } else {
        additionalFilled = false;
    }
});

document.getElementById('year').textContent = new Date().getFullYear()