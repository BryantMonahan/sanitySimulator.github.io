document.getElementById("compoundCalculate").onclick = function() {
    console.log("THIS RAAN");
    var inital = document.getElementById("inital").value;
    var interest = document.getElementById("interest").value;
    var length = document.getElementById("length").value;
    var interval = document.getElementById("interval").value;
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
            prefix: ""
        },
        data: [{
            type: "line",
            lineColor: "#4BC0C0",
            yValueFormatString: "#,###",
            toolTipContent: "Value:{y} | Month:{x}",
            dataPoints: realDataPoints
        }
        , {
            type: "line",
            lineColor: "#D8315B",
            markerColor: "maroon",
            yValueFormatString: "#,###",
            toolTipContent: "Contributed:{y} | Month:{x}",
            dataPoints: contributedDataPoints
        }]
    });
    chart.render();
}

window.onload = function() {

    var realDataPoints = [{"x":0,"y":10000},{"x":1,"y":10125},{"x":2,"y":10251.56},{"x":3,"y":10379.61}];
    var contributedDataPoints = [{"x":0,"y":10000}, {"x":1,"y":10000},{"x":2,"y":10000},{"x":3,"y":10000}];
    
    loadChart(realDataPoints, contributedDataPoints);
}

    