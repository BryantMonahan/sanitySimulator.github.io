async function graphSP500Returns() {
    const response = await fetch('/JSON_Data/SP500.json');
    let dataPoints;
    try {
        if (!response.ok) {
            throw new Error("Failed to load data from SP500.json");
        }
        const data = await response.json();
        console.log(data)
        // this just parses the data we want into a format that the graphing library can use
        dataPoints = data.map((entry) => {
            return { x: new Date(entry.year, 0), y: Number(entry.totalReturn), color: Number(entry.totalReturn) < 0 ? '#D8315B' : '#2196F3' };
        });
    } catch (error) {
        console.error(error);
    }
    console.log(dataPoints)

    let newChart = new CanvasJS.Chart('sp500Graph', {
        animationEnabled: true,
        responsive: true,
        theme: "light2",
        title: {
            text: ''
        },
        toolTip: {
            shared: true
        },
        options: {
            responsive: true,
        },
        axisX: {
            title: 'S&P500 Annual Return',
            valueFormatString: "YYYY",
        },
        axisY: {
            suffix: "%"
        },
        dataPointWidth: 6,
        data: [{
            label: "Median",
            type: "column",
            color: "#2196F3",
            lineColor: "#2196F3",
            markerSize: 0,
            yValueFormatString: "#,###.##",
            xValueFormatString: "YYYY",
            toolTipContent: "{x}<br>{y}%",
            showInLegend: false,
            legendText: 'This is a legend',
            dataPoints: dataPoints,
        }
        ]
    });

    newChart.render()
}
graphSP500Returns()