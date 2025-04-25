let realDataPoints = [{ "x": 0, "y": 10000 }, { "x": 1, "y": 10125 }, { "x": 2, "y": 10251.56 }, { "x": 3, "y": 10379.61 }];
let contributedDataPoints = [{ "x": 0, "y": 10000 }, { "x": 1, "y": 10000 }, { "x": 2, "y": 10000 }, { "x": 3, "y": 10000 }];

const graphHeader = document.getElementById("graph_header");

document.getElementById("compoundCalculate").onclick = function () {
    console.log("THIS RAAN");

    // Get the values from the input fields
    const initalIn = document.getElementById("inital");
    const interestIn = document.getElementById("interest");
    const lengthIn = document.getElementById("length");
    const intervalIn = document.getElementById("interval");

    var inital = initalIn.value;
    var interest = interestIn.value;
    var length = lengthIn.value;
    var interval = intervalIn.value;
    console.log(`${inital} ${interest} ${length} ${interval}`);

    loadChart(realDataPoints, contributedDataPoints);


}

// this may need to be used with callbacks to get the data points for the graph
// ill need to play around with larger data sets to see how it performs
function calculatePoints(inital, rate, time, contribution, interval) {
    var dataPoints = [];
    dataPoints.push({ x: 0, y: inital });
}

function loadChart(realDataPoints, contributedDataPoints) {
    realDataPoints.push({ x: realDataPoints.length, y: 10000 });
    contributedDataPoints.push({ x: realDataPoints.length, y: 10000 });

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
    chart.render();S
}

window.onload = function () {
    loadChart(realDataPoints, contributedDataPoints);
}

