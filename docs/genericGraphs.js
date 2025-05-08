
// this takes in a path name and a div id and loads the data from the path name into the div id
export async function graphSingleDataPoints(pathName, divId, title, xAxisTitle, legendInfo) {
    const response = await fetch(pathName);
    try {
        if (!response.ok) {
            throw new Error("Failed to load data from " + pathName);
        }
        const data = await response.json();
        // this just parses the data we want into a format that the graphing library can use
        let dataPoints = data.observations.map((entry) => {
            return { x: new Date(entry.date), y: Number(entry.value) };
        });
        // due to fred's API, some of the data points are null, so we need to remove them
        dataPoints = dataPoints.filter((entry) => !(isNaN(entry.y)));
        const chart = loadSingleLineChart(dataPoints, divId, title, xAxisTitle, legendInfo);
        chart.render();
    } catch (error) {
        console.error(error);
    }
}

// this takes in two path names and a div id and loads the data from the path names into the div id
export async function graphDoubleDataPoints(firstPathName, secondPathName, divId, title, xAxisTitle, legendInfoOne, legendInfoTwo) {
    const responseOne = await fetch(firstPathName);
    let firstDataPoints;
    let secondDataPoints;
    try {
        if (!responseOne.ok) {
            throw new Error("Failed to load data from " + firstPathName);
        }
        const data = await responseOne.json();
        // this just parses the data we want into a format that the graphing library can use
        firstDataPoints = data.observations.map((entry) => {
            return { x: new Date(entry.date), y: Number(entry.value) };
        });
    } catch (error) {
        console.error(error);
    }

    const responseTwo = await fetch(secondPathName);
    try {
        if (!responseTwo.ok) {
            throw new Error("Failed to load data from " + secondPathName);
        }
        const data = await responseTwo.json();
        // this just parses the data we want into a format that the graphing library can use
        secondDataPoints = data.observations.map((entry) => {
            // be very careful with this, this is needed for median income ONLY. It increases the year by 1 to match the data set
            let time = new Date(entry.date);
            time.setFullYear(time.getFullYear() + 1);
            return { x: time, y: Number(entry.value) };
        });
        loadDoubleLineChart(firstDataPoints, secondDataPoints, divId, title, xAxisTitle, legendInfoOne, legendInfoTwo);
    } catch (error) {
        console.error(error);
    }
}

export async function graphSingleCSVDataPoints(pathName, divId, legendInfo) {
    const response = await fetch("JSON_Data/HOAM_US_Affordability_Index.csv");
    let dataPoints;
    try {
        if (!response.ok) {
            throw new Error("Failed to load data from " + pathName);
        }
        const csvString = await response.text();
        let results = Papa.parse(csvString);
        dataPoints = results.data.map((entry) => {
            return { x: new Date(entry[0]), y: Number(entry[1]) };
        });

        // remove bad data points
        dataPoints.shift();
        dataPoints.pop();
        console.log(dataPoints);
        loadDoubleAreaChart(dataPoints, divId, "", "", legendInfo);
    } catch (error) {
        console.error(error);
    }
}

// this function takes in the data points, div id, title, x axis title, and legend info and loads the chart into the div id
export function loadSingleLineChart(plotPoints, divId, title, xAxisTitle, legendInfo) {

    let newChart = new CanvasJS.Chart(divId, {
        animationEnabled: true,
        responsive: true,
        theme: "light2",
        title: {
            text: title
        },
        toolTip: {
            shared: true
        },
        options: {
            responsive: true,
        },
        axisX: {
            title: xAxisTitle,
            valueFormatString: "YYYY",
        },
        axisY: {
            suffix: "%"
        },
        data: [{
            label: "Median",
            type: "line",
            color: "#2196F3",
            lineColor: "#2196F3",
            markerSize: 0,
            yValueFormatString: "#,###.##",
            xValueFormatString: "MM-YYYY",
            toolTipContent: "{x}<br>{y}%",
            showInLegend: true,
            legendText: legendInfo,
            dataPoints: plotPoints,
        }
        ]
    });
    return newChart;
    // newChart.render();
}

// this function takes in two arrays of data points, div id, title, x axis title, and legend info and loads the chart into the div id
function loadDoubleLineChart(firstPoints, secondPoints, divId, title, xAxisTitle, legendInfoOne, legendInfoTwo) {

    let newChart = new CanvasJS.Chart(divId, {
        animationEnabled: true,
        responsive: true,
        toolTip: {
            shared: true
        },
        theme: "light2",
        title: {
            text: title
        },
        toolTip: {
            shared: false,
        },
        options: {
            responsive: true,
        },
        axisX: {
            title: xAxisTitle,
            valueFormatString: "YYYY",
        },
        axisY: {
            prefix: "$"
        },
        data: [{
            label: "Median",
            type: "line",
            color: "#2196F3",
            lineColor: "#2196F3",
            markerSize: 0,
            yValueFormatString: "#,###",
            xValueFormatString: "MM-YYYY",
            toolTipContent: "{x}<br>${y}",
            showInLegend: true,
            legendText: legendInfoOne,
            dataPoints: firstPoints,
        },
        {
            label: "Median",
            type: "line",
            nullDataLineDashType: "shortDash",
            color: "#D8315B",
            lineColor: "#D8315B",
            markerSize: 7,
            yValueFormatString: "#,###",
            xValueFormatString: "YYYY",
            toolTipContent: "{x}<br>${y}",
            showInLegend: true,
            legendText: legendInfoTwo,
            dataPoints: secondPoints,
        }
        ]
    });

    newChart.render();
}


function loadDoubleAreaChart(dataPoints, divId, title, xAxisTitle, legendInfo) {

    let newChart = new CanvasJS.Chart(divId, {
        animationEnabled: true,
        connectNullData: false,
        responsive: true,
        theme: "light2",
        title: {
            text: title
        },
        toolTip: {
            shared: true
        },
        options: {
            responsive: true,
        },
        axisX: {
            title: xAxisTitle,
            valueFormatString: "YYYY",
        },
        axisY: {
            prefix: "$",
        },
        data: [{
            label: "Median",
            type: "area",
            color: "#2196F3",
            lineColor: "#2196F3",
            fillOpacity: 0.2,
            markerSize: 0,
            yValueFormatString: "#,###.##",
            xValueFormatString: "MM-YYYY",
            toolTipContent: "{x}<br>${y}",
            showInLegend: true,
            legendMarkerType: "circle",
            legendText: legendInfo,
            dataPoints: dataPoints,
        }
        ]
    });

    newChart.render();
}

// this is a modified version of the mortgage calculator that can be used in multiple places
// the object passed in is a reference to the div id that the graph will be loaded into
export function amortizationGraph(divId, principalDataPoints, interestDataPoints, totalPaidDataPoints, graphHeaderObj, contributionFilled) {
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

    let chart = new CanvasJS.Chart(divId, {
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
            minimum: 0,
            interval: 1,
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
        graphHeaderObj.text = `<p id="graph_header" class="graph_headers">With monthly payments of <span style="color:rgb(13, 143, 20)">$${monthlyPayment}</span> it will take <span style="color:rgb(0, 135, 245)">${time}</span> and <span style="color: #D8315B">$${grandTotal}</span> to pay off the initial loan</p>`;
    } else {
        time = Math.floor((totalPaidDataPoints.length - 1)) + " years";
        graphHeaderObj.text = `<p id="graph_header" class="graph_headers">With monthly payments of <span style="color:rgb(13, 143, 20)">$${monthlyPayment}</span> it will take <span style="color:rgb(0, 135, 245)">${time}</span> and <span style="color: #D8315B">$${grandTotal}</span> to pay off the initial loan</p>`;
    }
    return chart;
}