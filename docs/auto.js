import { graphSingleDataPoints, loadSingleLineChart } from "./genericGraphs.js";
graphSingleDataPoints("JSON_Data/autoRates.json", "autoRatesGraph", "", "", "60-Month Auto Rate");

let depreciationPoints = [
    { x: 0, y: 100 },
    { x: 1, y: 84 },
    { x: 2, y: 72 },
    { x: 3, y: 61 },
    { x: 4, y: 52 },
    { x: 5, y: 45 },
];
let chart = loadSingleLineChart(depreciationPoints, "depreciationGraph", "", "", "% Of Original MSRP");
chart.options.data[0].xValueFormatString = "Year #0";
chart.options.data[0].markerSize = 7;
chart.options.axisX.valueFormatString = "Year #0";
chart.options.axisX.minimum = 0;
chart.options.axisY.maximum = 100;
chart.options.axisX.maximum = 5;



chart.render();

