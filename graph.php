<form action="graph.php" method="POST">
Inital Amount: <input type="number" name="inital" min="0" required><br>
Interest: <input type="number" name="interest" min="0" max="100" required><br>
Length of Time: <input type="number" name="length" min="0" max="150" required><br>
Monthly Contribution: <input type="number" name="contribution" min="0" max="10000000"><br>
Compounding Interval:
<input type="radio" name="interval" value="yearly">Yearly
<input type="radio" name="interval" value="monthly">Monthly
<input type="radio" name="interval" value="weekly">Weekly
<input type="radio" name="interval" value="daily">Daily
<br>
<input type="submit" value="Calculate">
</form>


<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    //filter_input($number, FILTER_SANITIZE_NUMBER_INT);
    $years = filter_input(INPUT_POST, "length", FILTER_SANITIZE_NUMBER_INT);
    $inital = filter_input(INPUT_POST, "inital", FILTER_SANITIZE_NUMBER_INT);
    $interestRate = filter_input(INPUT_POST, "interest", FILTER_SANITIZE_NUMBER_FLOAT);
    $interestRate = $interestRate / 100; // adjusting based on the user entering a whole number instead of a decimal
    if(isset($POST["contribution"])){
        $monthlyContribution = filter_input(INPUT_POST, "contribution", FILTER_SANITIZE_NUMBER_FLOAT);
    } else {
        $monthlyContribution = 0;
    }
    if(!isset($POST["interval"])){
        $interval = 12; // Default to monthly if no interval is selected
    } else {
        $interval = filter_input(INPUT_POST, "interval", FILTER_SANITIZE_SPECIAL_CHARS);
    if ($interval == NULL) {
        $interval = 12;
    } elseif ($interval == "monthly") {
        $interval = 12;
    } elseif ($interval == "weekly") {
        $interval = 52;
    } elseif ($interval == "daily") {
        $interval = 365;
    } else {
        $interval = 12; // Default to monthly if no valid interval is selected
    }
}
} else {  
$years = 15;
$inital = 10000;
$interestRate = .05;
$interval = 12;
$monthlyContribution = 100;
}
//echo $years . "<br>" . $inital . "<br>" . $interestRate . "<br>" . $monthlyContribution . "<br>" . $interval . "<br>";
$previous = $inital;
$totalContributed = $inital;
$realDataPoints = array();
$contributedDataPoints = array();
array_push($realDataPoints, array("x" => 0, "y" => $inital));
array_push($contributedDataPoints, array("x" => 0, "y" => $inital));
for($i = 1; $i <= 12*$years; $i++){
	$y = $monthlyContribution + $previous + ($previous*($interestRate/$interval));
    $previous = $y;
    $totalContributed += $monthlyContribution;
    array_push($contributedDataPoints, array("x" => $i, "y" => $totalContributed));
	array_push($realDataPoints, array("x" => $i, "y" => $y));
}

?>
<!DOCTYPE HTML>
<html>
<head>
<script>
window.onload = function() {

var realDataPoints = <?php echo json_encode($realDataPoints, JSON_NUMERIC_CHECK); ?>;
var contributedDataPoints = <?php echo json_encode($contributedDataPoints, JSON_NUMERIC_CHECK); ?>;

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
</script>
</head>
<body>
<div id="chartContainer" style="height: 370px; width: 100%;"></div>
<script src="https://cdn.canvasjs.com/canvasjs.min.js"></script>
</body>
</html>                              