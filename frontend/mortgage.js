var realDataPoints = calculatePoints(10000, 0.05, 10, 1000, 12);
var contributedDataPoints = calculatePoints(10000, 0, 10, 1000, 12);
var interval = 12; // default to monthly

const graphHeader = document.getElementById("graph_header");

document.getElementById("compoundCalculate").onclick = function () {
    console.log("THIS RAAN");

    // Get the values from the input fields
    const initalIn = document.getElementById("inital");
    const interestIn = document.getElementById("interest");
    const lengthIn = document.getElementById("length");
    //  const intervalIn = document.getElementById("interval");
    const contributionIn = document.getElementById("contribution");

    /*
    var interval = intervalIn.value;
    switch (interval) {
        case "monthly":
            interval = 12;
            break;
        case "daily":
            interval = 365;
            break;
        case "weekly":
            interval = 52;
            break;
        case "yearly":
            interval = 1;
            break;
        default:
            interval = 12;
            break;
    }
    */


    var inital = Number(initalIn.value);
    var interest = Number(interestIn.value);
    var length = Number(lengthIn.value);
    var contribution = Number(contributionIn.value);

    console.log(`${inital} ${interest} ${length} ${interval}`);

    realDataPoints = calculatePoints(inital, interest / 100, length, contribution, interval);
    contributedDataPoints = calculatePoints(inital, 0, length, contribution, interval);

    loadChart(realDataPoints, contributedDataPoints);


}

// this may need to be used with callbacks to get the data points for the graph
// ill need to play around with larger data sets to see how it performs
function calculatePoints(inital, rate, time, contribution, interval) {
    let dataPoints = [];
    dataPoints.push({ x: 0, y: inital });
    let apy = ((1 + rate / interval) ** interval) - 1;

    let previous = inital;
    for (let i = 1; i <= interval * time; i++) {
        previous = contribution + (previous * (1 + (rate / interval)));
        dataPoints.push({ x: i, y: previous });
    }
    console.log(apy);
    return dataPoints;
}

function loadChart(realDataPoints, contributedDataPoints) {

    var chart = new CanvasJS.Chart("chartContainer", {
        theme: "light2",
        title: {
            text: ""
        },
        toolTip: {
            shared: true
        },
        options: {
            responsive: true
        },
        axisX: {
            title: "Time in Months"
        },
        axisY: {
            prefix: "$"
        },
        data: [{
            type: "line",
            lineColor: "#4BC0C0",
            yValueFormatString: "#,###",
            toolTipContent: "Month:{x}<br>Value:${y}",
            dataPoints: realDataPoints
        }
            , {
            type: "line",
            lineColor: "#D8315B",
            markerColor: "maroon",
            yValueFormatString: "#,###",
            toolTipContent: "Contributed:${y}",
            dataPoints: contributedDataPoints
        }]
    });

    // this changes the text above the graph to display the total amount after the specified time period
    var time = Math.round(realDataPoints.length / 12); // replace time with length once the creat points function is made
    // these use innerHTML to allow the text to fade in, if I use innerText it will not fade in
    if (length != 1) {
        graphHeader.innerHTML = `<p id="graph_header">Your total amount after ${time} years is $${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</p>`;
    } else {
        graphHeader.innerHTML = `<p id="graph_header">Your total amount after ${time} year is $${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}</p>`;
    }
    chart.render();
}

window.onload = function () {
    loadChart(realDataPoints, contributedDataPoints);
}

