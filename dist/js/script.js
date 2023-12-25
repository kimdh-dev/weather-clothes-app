function getCloth(temp) {
    if (temp <= 5) return "패딩, 두꺼운코트";
    if (temp <= 8) return "코트, 가죽자켓";
    if (temp <= 11) return "트렌치코트, 니트";
    if (temp <= 16) return "얇은 자켓, 가디건";
    if (temp <= 19) return "얇은 니트, 청바지";
    if (temp <= 22) return "얇은 가디건, 청바지";
    if (temp <= 27) return "반팔, 반바지";
    return "민소매티, 반팔, 반바지";
}

function get_weather(loc, lat, lon) {
    $.ajax({
        method: "POST",
        url: "/api/weather",
        data: { lat: lat, lon: lon },
    })
        .done(function (msg) {
            $('#city').text(loc);

            let condition = msg.current.weather[0].description;
            let condition_icon = msg.current.weather[0].icon;
            $('#weather-state img').attr("src", "img/weather/" + condition_icon + ".png");
            $('#weather-state #weather-condition').text(condition);

            $('#weather').text(msg.current.weather[0].main);
            $('#realtemp').text(msg.current.temp.toFixed(1) + "℃");
            $('#cloth-txt span').text(getCloth(msg.current.temp));

            $('#feeltemp').text(msg.current.feels_like.toFixed(1) + "℃");
            $('#humi').text(Math.round(msg.current.humidity) + "%");
            $('#wind .deg').text(deg_array[Math.round(msg.current.wind_deg / 24)]);
            $('#wind .speed').text(msg.current.wind_speed.toFixed(1));

            $('#weather2-mobile .w-wrap:eq(0) .val').text(msg.current.feels_like.toFixed(1) + "℃");
            $('#weather2-mobile .w-wrap:eq(1) .val').text(Math.round(msg.current.humidity) + "%");
            $('#weather2-mobile .w-wrap:eq(2) .val').text(deg_array[Math.round(msg.current.wind_deg / 24)] + " " + msg.current.wind_speed.toFixed(1) + "m/s");

            let future_weather = []
            for (let i = 0; i < 12; i++) {
                future_weather.push(msg.hourly[i]);
            }

            let will_rain = false;
            for (const num in future_weather) {
                let weather_id = future_weather[num].weather[0].id;
                if (weather_id >= 200 && weather_id < 700) {
                    will_rain = true;
                }
            }

            if (will_rain == true) {
                $('.rain-y').css({ "display": "block" });
                $('.rain-n').css({ "display": "none" });
            } else {
                $('.rain-y').css({ "display": "none" });
                $('.rain-n').css({ "display": "block" });

            }

            for (let i = 0; i < msg.hourly.length; i++) {
                let next_dt = msg.hourly[i].dt;
                let next_date = new Date(next_dt * 1000);
                let next_day_hour = next_date.getHours();
                let hour_span = '';
                if (next_day_hour == 0) {
                    next_day_hour = next_date.getDate() + '일';
                    hour_span = '<span class="color-purple">' + next_day_hour + '</span>';
                } else {
                    next_day_hour = String(next_date.getHours()).padStart(2, "0") + '시';
                    hour_span = '<span>' + next_day_hour + '</span>';
                }

                let next_condition = msg.hourly[i].weather[0].icon;
                let next_temp = Math.round(msg.hourly[i].temp);
                let next_feeltemp = Math.round(msg.hourly[i].feels_like);
                let next_rain = '-';
                if (msg.hourly[i].hasOwnProperty('rain')) {
                    if (msg.hourly[i].rain.hasOwnProperty('1h')) {
                        next_rain = msg.hourly[i]['rain']['1h'].toFixed(1);
                    }
                }
                let htmls = '<ul class="item">';
                htmls += '<li>' + hour_span + '</li>';
                htmls += '<li><span class="wicon w_' + next_condition + '"></span></li>';
                htmls += '<li><span>' + next_temp + '℃</span></li>';
                htmls += '<li><span>' + next_feeltemp + '℃</span></li>';
                htmls += '<li><span>' + next_rain + '</span></li>';
                htmls += '</ul>';
                $('.next-wrap').append(htmls);
            }
            var viewer = new TouchScroll();
            viewer.init({
                id: 'next-wrap',
                draggable: true,
                wait: false
            });

            $('.weather1-wrap').css({ "display": "block" });
            $('.weather2-wrap').css({ "display": "block" });
            $('.weather3-wrap').css({ "display": "block" });
            $('.weather4-wrap').css({ "display": "block" });
            $('.weather5-wrap').css({ "display": "block" });

        });
}
const deg_array = ["북", "북븍동", "북동", "동북동", "동", "동남동", "남동", "남남동", "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서"];
$(document).ready(function () {
    const param = new URL(window.location.href).searchParams;
    let city = '';
    let lat = '37.566536';
    let lon = '126.977966';
    if (param.get('loc')) {
        loc = param.get('loc');
    } else {
        loc = 'seoul';
    }

    $.ajax({
        method: "POST",
        url: "/api/location",
        data: { name: loc },
    }).done(function (msg) {
        if (msg.length > 0) {
            if (msg[0].local_names) {
                if (msg[0].local_names.ko) {
                    city = msg[0].local_names.ko;
                }
            }

            if (city == '') city = msg[0].name;

            lat = msg[0].lat;
            lon = msg[0].lon;
        } else {
            city = '서울';
        }
        get_weather(city, lat, lon);
    }).catch((e => {
        city = '서울';
        get_weather(city, lat, lon);
    }));
});