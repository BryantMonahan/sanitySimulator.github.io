// this takes in a path name and a div id and loads the data from the path name into the div id
export async function graphSingleDataPoints(pathName, divId, title, xAxisTitle, legendInfo) {
    const response = await fetch(pathName);
    try {
        if (!response.ok) {
            throw new Error("Failed to load data from " + pathName);
        }
        const data = await response.json();
        // this just parses the data we want into a format that the graphing library can use
        const dataPoints = data.observations.map((entry) => {
            return { x: new Date(entry.date), y: Number(entry.value) };
        });
        loadSingleLineChart(dataPoints, divId, title, xAxisTitle, legendInfo);
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
            return { x: new Date(entry.date), y: Number(entry.value) };
        });

        loadDoubleLineChart(firstDataPoints, secondDataPoints, divId, title, xAxisTitle, legendInfoOne, legendInfoTwo);
    } catch (error) {
        console.error(error);
    }
}

// this function takes in the data points, div id, title, x axis title, and legend info and loads the chart into the div id
function loadSingleLineChart(plotPoints, divId, title, xAxisTitle, legendInfo) {

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

    newChart.render();
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