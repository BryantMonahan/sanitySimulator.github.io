import { graphSingleDataPoints, amortizationGraph } from "./genericGraphs.js";
import { calculateCardAmortizationPoints } from "./graphCalculations.js";

// we don't need this for the credit card graph, but it just exists so I don't have to rewrite the code for the auto graph
let headerObject = new Object();
headerObject.text = "<p>Placeholder Text<\p>";

let principalDataPoints = [];
let interestDataPoints = [];
let totalPaidDataPoints = [];
calculateCardAmortizationPoints(6730, 21, 2, principalDataPoints, interestDataPoints, totalPaidDataPoints);
let amortizationGraphDiv = amortizationGraph("amortizationGraph", principalDataPoints, interestDataPoints, totalPaidDataPoints, headerObject, false);
amortizationGraphDiv.options.data[0].markerSize = 0;
amortizationGraphDiv.options.data[1].markerSize = 0;
amortizationGraphDiv.options.data[2].markerSize = 0;
amortizationGraphDiv.options.axisX.title = "Time in Months";
amortizationGraphDiv.options.data[0].toolTipContent = "Month:{x}<br>Principal:${y}"

let graphHeader;
let balanceInput;
let interestInput;
let payInput;
let time;
let error;

let balanceFilled = false;
let interestFilled = false;

console.log(principalDataPoints.length, principalDataPoints);
window.onload = function () {
    graphSingleDataPoints("JSON_Data/creditCardRates.json", "creditCardRatesGraph", "", "", "Avg Credit Card Interest Rate");
    amortizationGraphDiv.render();
    graphHeader = document.getElementById("graph_header");
    time = (principalDataPoints.length - 1) / 12;
    graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">With minimum payments it will take <span style="color:rgb(0, 135, 245)">${Math.floor(time)}</span> years and <span style="color: #D8315B">$${Math.round(totalPaidDataPoints[totalPaidDataPoints.length - 1].y).toLocaleString("en-US")}</span> to pay off the balance of <span style="color:rgb(13, 143, 20)">$${Math.round(principalDataPoints[0].y).toLocaleString("en-US")}</span></p>`;
    balanceInput = document.getElementById("balance");
    interestInput = document.getElementById("interest");
    error = document.getElementById("error");
    error.classList.add("hide_me");
    // while this is a bad name, I cant think of a better one rn
    payInput = document.getElementById("pay");
    payInput.value = 2;


    // These event listeners are used to check if the input fields are filled out and if they are, it will call the calculate function
    balanceInput.addEventListener("input", function (event) {
        if (event.target.value !== "" && event.target.value !== null) {
            balanceFilled = true;
            if (event.target.value < 0) {
                event.target.value = 0;
            }
            checkAndCalculate();
        } else {
            balanceFilled = false;
        }
    })

    interestInput.addEventListener("input", function (event) {
        if (event.target.value !== "" && event.target.value !== null) {
            interestFilled = true;
            if (event.target.value < 0 || event.target.value > 23) {
                error.classList.remove("hide_me");
                event.target.value = 0;
            } else {
                error.classList.add("hide_me");
            }
            checkAndCalculate();
        } else {
            interestFilled = false;
        }
    })

    payInput.addEventListener("change", function (event) {
        checkAndCalculate();
    })
}

function checkAndCalculate() {
    if (balanceFilled && interestFilled) {
        // this is used to reset the data points so the graph doesn't get cluttered with old data
        principalDataPoints = [];
        interestDataPoints = [];
        totalPaidDataPoints = [];

        let balance = Number(balanceInput.value);
        let interest = Number(interestInput.value);
        let pay = Number(payInput.value);
        calculateCardAmortizationPoints(balance, interest, pay, principalDataPoints, interestDataPoints, totalPaidDataPoints);
        amortizationGraphDiv = amortizationGraph("amortizationGraph", principalDataPoints, interestDataPoints, totalPaidDataPoints, headerObject, false);
        time = (principalDataPoints.length - 1) / 12;
        graphHeader.innerHTML = `<p id="graph_header" class="graph_headers">With minimum payments it will take <span style="color:rgb(0, 135, 245)">${Math.floor(time)}</span> years and <span style="color: #D8315B">$${Math.round(totalPaidDataPoints[totalPaidDataPoints.length - 1].y).toLocaleString("en-US")}</span> to pay off the balance of <span style="color:rgb(13, 143, 20)">$${Math.round(principalDataPoints[0].y).toLocaleString("en-US")}</span></p>`;
        amortizationGraphDiv.options.data[0].markerSize = 0;
        amortizationGraphDiv.options.data[1].markerSize = 0;
        amortizationGraphDiv.options.data[2].markerSize = 0;
        amortizationGraphDiv.options.axisX.title = "Time in Months";
        amortizationGraphDiv.options.data[0].toolTipContent = "Month:{x}<br>Principal:${y}"
        amortizationGraphDiv.render();
    }
}
