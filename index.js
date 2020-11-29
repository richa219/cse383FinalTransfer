var calcURL = "https://api.clearllc.com/api/v2/math/";
var zipURL = "https://api.clearllc.com/api/v2/miamidb/_table/zipcode"
var weatherURL = "https://api.openweathermap.org/data/2.5/onecall"
var sensorURL = "https://api.clearllc.com/api/v2/setTemp";
var sensorUpdateURL = "https://richa219.aws.csi.miamioh.edu/final.php"
var apiKEY = "bed859b37ac6f1dd59387829a18db84c22ac99c09ee0f5fb99cb708364858818";
var openWeatherKey = "3a3799bbc1479a3f68aed6fd29f75ac4";

for (let n = 1; n < 100; n++) {
    $('#updateQuantity').append(`<option class="text-dark">${n}</option>`);
}

$('.collapses').on('show.bs.collapse', '.collapse', function () {
    $('.collapses').find('.collapse.show').each(function () {
        $(this).toggleClass('show');
    });
});

$('#weatherWeekList').css('height', `${~~(screen.availHeight / 2.2)}px`);
$(window).resize(function() {
    $('#weatherWeekList').css('height', `${~~(screen.availHeight / 2.2)}px`);
    // console.log('working');
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
    if ($('#secondNum').val() == "0" && $('#operation').val() == "/") {
        $('#calculateError').show();
    } else if ($('#secondNum').val() == "" || $('#firstNum').val() == "") {
        $('#missingCalc').show();
    } else {
        $.ajax({
            url: `${calcURL}${op}?api_key=${apiKEY}&n1=${$('#firstNum').val()}&n2=${$('#secondNum').val()}`,
            method: 'GET'
        }).done(function (data) {
            // console.log(data);
            $('#calculateError').hide()
            $('#missingCalc').hide()
            $('#calcResult').html(`${$('#firstNum').val()} ${$('#operation').val()} ${$('#secondNum').val()} = ${data.result}`);
        }).fail(function (err) {
            console.log(err);
        });
    }
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
                console.log(day);
                $('#weatherWeekList').append(`<li class="list-group-item bg-transparent text-body"><div class="row justify-content-around"><div class="col margined">${dayToDay(date.getDay())} (${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()})</div><div class="col text-right margined">${toFahrenheit(day.temp.max)}°-${toFahrenheit(day.temp.min)}°F<img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" width="30px">></div</div></li>`);
            });
            $('#weatherResults').show();
        }).fail(function(err) {            
        });
    }).fail(function(err) {
        $('#weatherWeekList').html(`Please make sure that the zip code is correct`);
        $('#weatherResults').show();
    });
}

function dayToDay(num) {
    switch(num) {
        case 0:
            return "Sun"
        case 1:
            return "Mon"
        case 2:
            return "Tue"
        case 3:
            return "Wed"
        case 4:
            return "Thu"
        case 5:
            return "Fri"
        default:
            return "Sat"
    }
}

function toFahrenheit(num) {
    return Math.floor((num - 273.15) * 9 / 5 + 32);
}

function submitSensorUpdate() {
    // Make sure that the value of sensor is a positive integer
    if (Number.isInteger(Number($('#sensor').val())) && Number($('#sensor').val()) >= 1 && Number($('#sensor').val()) <= 9) {
        if ($('#sensorLocation').val() == "" || $('#sensorValue').val() == "") {
            $('#toggleButtonSensor').show()
            $('#sensorStatus').text("1");
            $('#sensorMessage').text("Make sure all fields are filled in");
        } else {
            $.ajax({
                url: `${sensorURL}?api_key=${apiKEY}&userid=richa219&location=${$('#sensorLocation').val()}&sensor=${$('#sensor').val()}&value=${$('#sensorValue').val()}`,
                method: 'GET'
            }).done(function(data) {
                $('#toggleButtonSensor').show()
                $('#sensorStatus').text(data.status);
                $('#sensorMessage').text(data.message);
            }).fail(function(err) {
                console.log(err);
                console.log('failed');
            });
        }
    } else {
        $('#toggleButtonSensor').show()
        $('#sensorStatus').text("1");
        $('#sensorMessage').text("Make sure that the sensor number is between 1-9");
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
            let ending = "jpg";
            if (instance.sensor == "2" || instance.sensor == "7") {
                ending = "png";
            }
            $('#sensorTable').append(`<tr><td><img src="https://cse383-richa219.s3.amazonaws.com/sensor${instance.sensor}.${ending}" height="20px" width="20px">${instance.date}</td><td>${instance.location}</td><td>${instance.sensor}</td><td>${instance.value}</td></tr>`)
        });
        $('#sensorResults').css("height", `${~~(screen.height / 2.2)}`);
        $('#sensorResults').show();
    }).fail(function(err) {
        console.log(err);
    });
}