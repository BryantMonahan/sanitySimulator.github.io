/*
 this may need to be used with callbacks to get the data points for the graph
 ill need to play around with larger data sets to see how it performs
 furthermore, interval should only be set to 12, I intended this function to handle any interval
 but thats a problem for another day
*/
export function calculateCompoundPoints(inital, rate, time, contribution, interval) {
    let dataPoints = [];
    dataPoints.push({ x: 0, y: inital });
    let apy = ((1 + rate / interval) ** interval) - 1;

    let previous = inital;
    for (let i = 1; i <= interval * time; i++) {
        previous = contribution + (previous * (1 + (rate / interval)));
        dataPoints.push({ x: i, y: previous });
    }
    console.log(apy);
    let newDataPoints = [];
    newDataPoints.push({ x: 0, y: inital });
    for (let i = 1; i <= interval * time; i++) {
        if (i % interval == 0) {
            newDataPoints.push({ x: i / 12, y: dataPoints[i].y });
        }
    }
    return newDataPoints;
}