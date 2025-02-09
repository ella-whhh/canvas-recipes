const options = {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
};
console.log(create_array());




async function create_array() {
fetch('https://www.googleapis.com/calendar/v3/calendars/66e3c9fe603a1a452f0eac3ea75bf0dc6595e23426a3542e5724b2e1a2a5870e@group.calendar.google.com/events?key=AIzaSyDHzyBKIp_K7hNiAC6TTxp6jGFXGKZZv_0')
    .then((response) => response.json()) // Transform the data into json
    .then(function(data) {
        console.log(JSON.stringify(data));
        res = 
            JSON.parse(JSON.stringify(data));
        //console.log(res);
        res.items = res.items.map(item => {
            return {
                summary: item.summary,
                start: item.start,
                end: item.end
                };
            });
        console.log(res);
        //return parse_all(res.items);
        const str = parse_today(res.items);
        return str;
    });
}

function parse_all(items) {
    /*console.log(items);
    const map = new Map();
    items.forEach(element => {
        const startTime = new Date(element.start.dateTime);
        const endTime = new Date(element.end.dateTime);
        const totalTime = (endTime.getTime() - startTime.getTime())/3600000.0;
        date_string = startTime.toLocaleDateString(undefined, options);
        if (map.has(date_string)) {
            map.set(date_string, map.get(date_string) + totalTime);
        } else {
            map.set(date_string, totalTime);
        }
    });
    console.log(map);
    return "hello";*/
}

function parse_today(items) {
    const today = new Date().toLocaleDateString(undefined, options);
    var hours = 0;
    items.forEach(element => {
        const startTime = new Date(element.start.dateTime);
        date_string = startTime.toLocaleDateString(undefined, options);
        if (today.localeCompare(date_string) == 0) {
            const endTime = new Date(element.end.dateTime);
            hours += ((endTime.getTime() - startTime.getTime())/3600000.0);
        }
    });
    var sleep = Math.floor((Math.random() * 4) * 100) / 100;
    sleep += 4;
    hours += sleep; 
    var final_str = hours + " hours occupied on " + today;
    console.log(final_str);
    return final_str;
}
