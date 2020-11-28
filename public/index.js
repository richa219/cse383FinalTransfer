var calcURL = "https://api.clearllc.com/api/v2/math/";
var zipURL = "https://api.clearllc.com/api/v2/miamidb/_table/zipcode"
var weatherURL = "https://api.openweathermap.org/data/2.5/onecall"
var sensorURL = "https://api.clearllc.com/api/v2/setTemp";
var sensorUpdateURL = "https://richa219.aws.csi.miamioh.edu/final.php"
var apiKEY = "bed859b37ac6f1dd59387829a18db84c22ac99c09ee0f5fb99cb708364858818";
var openWeatherKey = "3a3799bbc1479a3f68aed6fd29f75ac4";

for (let n = 1; n < 100; n++) {
    $('#updateQuantity').append(`<option>${n}</option>`);
}

$('.collapses').on('show.bs.collapse', '.collapse', function () {
    $('.collapses').find('.collapse.show').each(function () {
        $(this).toggleClass('show');
    });
});

//Stops the calculator from reloading the page if it is submitted via pressing enter
$('#calcForm').submit(function () {
    submitCalculation();
    return false;
});
$('#weatherForm').submit(function () {
    submitZip();
    return false;
});
$('#sensorUpdateForm').submit(function () {
    submitSensorUpdate();
    return false;
});
$('#sensorReportForm').submit(function () {
    submitSensorReport();
    return false;
});


function updateTitle(num) {
    switch (num) {
        case 1:
            $('#title').text('Calculator');
            break;
        case 2:
            $('#title').text('Weather Forecast');
            break;
        case 3:
            $('#title').text('Sensor Update');
            break;
        case 4:
            $('#title').text('Sensor Report');
            break;
        default:
            $('#title').text('Student Information');
            break;
    }
}

function submitCalculation() {
    let op;
    switch ($('#operation').val()) {
        case '-':
            op = 'Subtract';
            break;
        case '*':
            op = 'Multiply';
            break;
        case '/':
            op = 'Divide';
            break;
        default:
            op = "Add"
            break;
    }
    $.ajax({
        url: `${calcURL}${op}?api_key=${apiKEY}&n1=${$('#firstNum').val()}&n2=${$('#secondNum').val()}`,
        method: 'GET'
    }).done(function (data) {
        // console.log(data);
        $('#calcResult').html(`${$('#firstNum').val()} ${$('#operation').val()} ${$('#secondNum').val()} = ${data.result}`);
    }).fail(function (err) {
        console.log(err);
    });
}

function submitZip() {
    let date = new Date();
    let weekStart = new Date();
    let weekEnd = new Date();
    weekStart.setDate(date.getDate() + 1);
    weekEnd.setDate(date.getDate() + 8);
    $('#dateToday').text(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
    $('#dateWeek').text(`${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()} - ${weekEnd.getFullYear()}-${weekEnd.getMonth() + 1}-${weekEnd.getDate()}`)
    $.ajax({
        url: `${zipURL}?api_key=${apiKEY}&ids=${$('#zip').val()}`,
        method: 'GET'
    }).done(function(data) {
        let lat = data.resource[0].latitude
        let lon = data.resource[0].longitude
        $.ajax({
            url: `${weatherURL}?lat=${lat}&lon=${lon}&exclude=hourly&appid=${openWeatherKey}`,
            method: 'GET'
        }).done(function(data) {
            let daily = data.daily
            $('#weatherWeekList').html("");
            daily.forEach(day => {
                let date = new Date(day.dt * 1000);
                $('#weatherWeekList').append(`<div class="col-5 col-sm-3 col-md-3 col-lg-3 outlined"><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" width="30px">${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}</div>`);
            });
            $('#weatherResults').show();
        }).fail(function(err) {            
        });
    }).fail(function(err) {
        $('#weatherWeekList').html(`Please make sure that the zip code is correct`);
        $('#weatherResults').show();
    });
}

function submitSensorUpdate() {
    // Make sure that the value of sensor is a positive integer
    if (Number.isInteger(Number($('#sensor').val())) && Number($('#sensor').val()) >= 0) {
        $.ajax({
            url: `${sensorURL}?api_key=${apiKEY}&userid=richa219&location=${$('#sensorLocation').val()}&sensor=${$('#sensor').val()}&value=${$('#sensorValue').val()}`,
            method: 'GET'
        }).done(function(data) {
            // console.log(data);
            $('#toggleButtonSensor').show()
            $('#sensorStatus').text(data.status);
            $('#sensorMessage').text(data.message);
        }).fail(function(err) {
            console.log(err);
        });
    } else {
        // console.log('bad num');
        // console.log($('#sensor').val());
    }
}

function submitSensorReport() {
    let sensor;
    let location;
    if ($('#updateLocation').val() == "") {
        location = "+"
    } else {
        location = $('#updateLocation').val()
    }
    if ($('#updateSensor').val() == "") {
        sensor = "0"
    } else {
        sensor = $('#updateSensor').val()
    }
    $.ajax({
        url: `${sensorUpdateURL}?method=getTemp&qty=${$('#updateQuantity').val()}&location=${location}&sensor=${sensor}`,
        method: 'GET'
    }).done(function(data) {
        $('#sensorTable').html("");
        data.result.forEach(function(instance) {
            $('#sensorTable').append(`<tr><td>${instance.date}</td><td>${instance.location}</td><td>${instance.sensor}</td><td>${instance.value}</td></tr>`)
        });
        $('#sensorResults').css("height", `${~~(screen.height / 2.2)}`);
        $('#sensorResults').show();
    }).fail(function(err) {
        console.log(err);
    });
}