const graphHeader = document.getElementById("graph_header");

document.getElementById("compoundCalculate").onclick = function() {
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


}

function calculatePoints(inital, rate, time, contribution, interval){

}

function loadChart(realDataPoints, contributedDataPoints){
    var chart = new CanvasJS.Chart("chartContainer", {
        theme: "light2",
        title: {
            text: ""
        },
        toolTip:{
            shared: true
        },
        options:{
            responsive: true
        },
        axisX:{
            title: "Time in Months"
        },
        axisY:{
            prefix: "$"
        },
        data: [{
            type: "line",
            lineColor: "#4BC0C0",
            yValueFormatString: "#,###",
            toolTipContent: "Value:${y} | Month:{x}",
            dataPoints: realDataPoints
        }
        , {
            type: "line",
            lineColor: "#D8315B",
            markerColor: "maroon",
            yValueFormatString: "#,###",
            toolTipContent: "Contributed:${y} | Month:{x}",
            dataPoints: contributedDataPoints
        }]
    });
    if(length != 1){
        graphHeader.innerText = `Your total amount after ${length} years is $${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}`;
    } else {
        graphHeader.innerText = `Your total amount after ${length} year is $${Math.round(realDataPoints[realDataPoints.length - 1].y).toLocaleString()}`;
    }
    chart.render();
}

window.onload = function() {

    var realDataPoints = [{"x":0,"y":10000},{"x":1,"y":10125},{"x":2,"y":10251.56},{"x":3,"y":10379.61}];
    var contributedDataPoints = [{"x":0,"y":10000}, {"x":1,"y":10000},{"x":2,"y":10000},{"x":3,"y":10000}];
    
    loadChart(realDataPoints, contributedDataPoints);
}

    