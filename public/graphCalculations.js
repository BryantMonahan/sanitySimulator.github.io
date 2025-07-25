// this function is used to calculate compound interest
export function calculateCompoundPoints(initial, rate, time, contribution, interval) {
    let dataPoints = [];
    dataPoints.push({ x: 0, y: initial });
    let apy = ((1 + rate / interval) ** interval) - 1;

    let previous = initial;
    for (let i = 1; i <= interval * time; i++) {
        previous = contribution + (previous * (1 + (rate / interval)));
        dataPoints.push({ x: i, y: previous });
    }
    let newDataPoints = [];
    newDataPoints.push({ x: 0, y: initial });
    for (let i = 1; i <= interval * time; i++) {
        if (i % interval == 0) {
            newDataPoints.push({ x: i / 12, y: dataPoints[i].y });
        }
    }
    return newDataPoints;
}

// this function is used to calculate simple interest 
export function calculateSimplePoints(initial, rate, time, contribution, interval) {
    let dataPoints = [];
    dataPoints.push({ x: 0, y: initial });
    let contributed = initial;
    let previous = initial;
    for (let i = 1; i <= interval * time; i++) {
        contributed += contribution;
        previous += contribution + (contributed * ((rate / interval)));
        dataPoints.push({ x: i, y: previous });
    }
    let newDataPoints = [];
    newDataPoints.push({ x: 0, y: initial });
    for (let i = 1; i <= interval * time; i++) {
        if (i % interval == 0) {
            newDataPoints.push({ x: i / 12, y: dataPoints[i].y });
        }
    }
    return newDataPoints;
}

/*
This function is used to calculate amortization. It takes in the principal, rate, time, and contributions as arguments.
Furthermore, it does what my two previous functions should have done and takes in references to arrays to fill with,
the needed data points so this function only needs to be called once per graph.
*/
export function calculateAmortization(principal, rate, time, contributions, principalDataPoints, interestDataPoints, totalPaidDataPoints) {
    principalDataPoints.push({ x: 0, y: principal });
    let interestPaid = 0;
    interestDataPoints.push({ x: 0, y: interestPaid });
    let totalPaid = 0;
    totalPaidDataPoints.push({ x: 0, y: totalPaid });

    // the next three lines calculate the minimum monthly payments needed to pay off the loan in the given time
    rate = (rate / 100) / 12;
    time *= 12;
    let minMonthlyPayment = principal * rate * ((1 + rate) ** time) / (((1 + rate) ** time) - 1);

    // because we plot by year this will be used to determine if the final plot needs to be added to the array after
    // we filter out all the months that are not divisible by 12
    let endsOnYear = true;
    let finalPaid;
    let finalPrincipal;
    let finalInterest;

    let month = 1;
    // the floor method keeps the graph from going longer than needed (gotta love how computer math works)
    while (Math.floor(principal) > 0 && month < time * 12) {
        interestPaid += principal * rate;
        interestDataPoints.push({ x: month, y: interestPaid });
        principal *= 1 + rate;
        // this runs when the principal is greater than the normal monthly payment amount
        if (minMonthlyPayment + contributions < Math.floor(principal)) {
            totalPaid += minMonthlyPayment + contributions;
            totalPaidDataPoints.push({ x: month, y: totalPaid });
            principal -= minMonthlyPayment + contributions;
            principalDataPoints.push({ x: month, y: principal });
            // this runs when the principal is less than the normal monthly payment amount, which should be the last month of the loan
        } else {
            totalPaid += principal;
            principal = 0;
            totalPaidDataPoints.push({ x: month, y: totalPaid });
            principalDataPoints.push({ x: month, y: 0.00 });
            // this runs when the loan is paid of before the end of a complete year. These will be the final data points on our graph
            if (!(month % 12 === 0)) {
                endsOnYear = false;
                // this is for formatting, we don't want our final year to be "year.reallyLongDecimal"
                month = Number((month / 12).toFixed(2));
                finalPaid = { x: month, y: totalPaid };
                finalPrincipal = { x: month, y: 0.00 };
                finalInterest = { x: month, y: interestPaid };
            }
            break;
        }
        month++;
        if (month > (time + 1) * 12) {
            console.log("This should nver happen, but it might.");
            break;
        }
        //console.log(principal);
    }
    // this goes through the saved values and only keeps the data points at the end of each year
    principalDataPoints.splice(0, principalDataPoints.length, ...principalDataPoints.filter(point => point.x % 12 === 0));
    principalDataPoints.forEach(element => element.x = element.x / 12);
    interestDataPoints.splice(0, interestDataPoints.length, ...interestDataPoints.filter(point => point.x % 12 === 0));
    interestDataPoints.forEach(element => element.x = element.x / 12);
    totalPaidDataPoints.splice(0, totalPaidDataPoints.length, ...totalPaidDataPoints.filter(point => point.x % 12 === 0));
    totalPaidDataPoints.forEach(element => element.x = element.x / 12);

    if (!endsOnYear) {
        principalDataPoints.push(finalPrincipal);
        interestDataPoints.push(finalInterest);
        totalPaidDataPoints.push(finalPaid);
    }

}

export function calculateCardAmortizationPoints(principal, interest, minimum, principalDataPoints, interestDataPoints, totalPaidDataPoints) {
    // initializing my variables 
    let interestPaid = 0;
    interestDataPoints.push({ x: 0, y: interestPaid });
    let totalPaid = 0;
    totalPaidDataPoints.push({ x: 0, y: totalPaid });
    let month = 1;
    principalDataPoints.push({ x: 0, y: principal });
    let rate = (interest / 100) / 12;
    let minRate = minimum / 100;
    let minAmount;

    // runs while the principal is greater than 0 
    while (Math.floor(principal) > 0) {
        minAmount = principal * minRate;
        interestPaid += principal * rate;
        principal *= 1 + rate;
        // when the principal is less than the minimum payment amount, we need to start paying the minimum amount
        if (minAmount < 25) {
            if (principal >= 25) {
                totalPaid += 25;
                principal -= 25;
            } else {
                totalPaid += principal;
                principal = 0;
            }
        } else {
            totalPaid += minAmount;
            principal -= minAmount;
        }
        interestDataPoints.push({ x: month, y: interestPaid });
        totalPaidDataPoints.push({ x: month, y: totalPaid });
        principalDataPoints.push({ x: month, y: principal });
        month++;
    }
}