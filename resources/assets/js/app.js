/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');


var distinctWeatherTypes = [
    "Mostly Cloudy",
    "Partly Cloudy",
    "Light Rain",
    "Rain",
    "Drizzle",
    "Clear",
    "Overcast",
    "Foggy",
    "Light Rain and Breezy",
    "Rain and Breezy",
    "Breezy and Mostly Cloudy",
    "Drizzle and Breezy",
    "Breezy",
    "Breezy and Partly Cloudy",
    "Breezy and Overcast"
]

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */
const app = new Vue({
    el: '#app',
    data: {
        sixHourDeviationFromActualTimeData: 0,
        currentPresenceR1: 0,
        pastHourPresenceR1: 0,
        PastMonthRecords: 0,
        comingHour: 0,
        comingHourPredictionObj: 0,

    },
    created: function () {
        this.loadData();
        this.ready();
        this.renderGraphs();
        this.startTime();
    },
    methods: {
        ready: function () {
            setInterval(function () {
                this.loadData();
            }.bind(this), 3600000);
            setInterval(function () {
                this.startTime();
            }.bind(this), 1000);

            window.addEventListener("resize", this.renderPresenceGraph);
        },
        checkTime: function (i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        },
        startTime: function () {
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            var s = today.getSeconds();
            // add a zero in front of numbers<10
            m = this.checkTime(m);
            s = this.checkTime(s);
            document.getElementById('timer').innerHTML = h + ":" + m + ":" + s;
            return today;
        },
        loadData: function () {
            this.getSixHourDeviationFromActualTimeData();
            this.getCurrentPresence();
            this.getPastMonthRecords();
            this.getComingHour();
        },
        getSixHourDeviationFromActualTimeData: function () {
            let curHour = this.getCurrentHour();
            let range = 3600 * 6;
            let sixHoursFuture = curHour + range;
            let sixHoursPast = curHour - range;
            this.sixHourDeviationFromActualTimeData = this.getPresenceRange(sixHoursPast, sixHoursFuture)
        },
        getPastMonthRecords: function () {
            let d = new Date();
            var curTime = Math.round(d.getTime() / 1000)
            d.setMonth(d.getMonth() - 1);
            let pastMonthEpoch = Math.round((d.getTime() / 1000));
            this.PastMonthRecords = this.getPresenceRange(pastMonthEpoch, curTime)
        },
        getCurrentHour: function () {
            var d = new Date();
            var seconds = Math.round(d.getTime() / 1000);
            var remainder = seconds % 3600;
            seconds = seconds - remainder;
            return seconds;
        },
        data: function () {
            return data;
        },
        getComingHour: function () {
            var context = this;
            var comingHour = (this.getCurrentHour() + 3600);
            axios.get('api/presence/' + comingHour)
                .then(function (response) {
                    context.comingHour = response.data[0];
                    context.comingHourPredictionObj = response.data[0].prediction;
                    context.comingHourPredictionObj.accuracy = response.data[0].prediction.accuracy.toFixed(2);
                });
        },
        getCurrentPresence: function () {
            var context = this;
            let curHour = this.getCurrentHour();
            axios.get('api/presence/' + curHour)
                .then(function (response) {
                    context.pastHourPresenceR1 = context.currentPresenceR1;
                    context.currentPresenceR1 = response.data[0].amountOfUsers;
                });
        },
        getPresenceRange: function (minEpochTime, maxEpochTime) {
            var result = axios.post('api/presence/getRange', {minDate: minEpochTime, maxDate: maxEpochTime})
                .then(function (response) {
                    return response.data;
                });
            return result;
        },
        renderGraphs: function () {
            this.renderPresenceGraph();
        },
        renderPresenceGraph: function (width, height) {

            var context = this;
            d3.select("svg").remove();

            let currentHour = context.getCurrentHour();
            console.log(currentHour)

            let date = new Date(0);
            date.setUTCSeconds(currentHour);
            let timeString = date.toLocaleTimeString();

            this.sixHourDeviationFromActualTimeData.then(function (data) {

                let tileWidth = $('#presence_actual').parent().parent().width();
                let tileHeight = $('#presence_actual').parent().parent().height();


                let maximalBuildingPresence = d3.max(data, function (d) {
                    if (d.amountOfUsers !== null) {
                        return d.amountOfUsers;
                    } else {
                        return d.prediction.amountOfUsers;
                    }
                });

                let maxTemperature = d3.max(data,function(d) {
                    return d.externSensor.temperature;
                })
                // set the dimensions and margins of the graph
                let margin = {top: 20, right: 40, bottom: 30, left: 40},
                    width = tileWidth - margin.left - margin.right,
                    height = tileHeight - margin.top - margin.bottom;

                // set the ranges
                let x = d3.scaleBand()
                    .range([0, width])
                    .padding(0.01)

                let y = d3.scaleLinear()
                    .range([height, 0]);

                let yTemperature = d3.scaleLinear()
                    .range([height, 0]);
                // append the svg object to the body of the page
                // append a 'group' element to 'svg'
                // moves the 'group' element to the top left margin
                let svg = d3.select("#presence_actual").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");


                //Scale the range of the data in the domains
                x.domain(data.map(function (d) {
                    let date = new Date(0);
                    date.setUTCSeconds(d.timeStamp);
                    return date.toLocaleTimeString();
                }));
                y.domain([0, maximalBuildingPresence]);

                yTemperature.domain([d3.min(data, function(d) { return d.externSensor.temperature }),maxTemperature]);

                let getY = function (d) {
                    if (d.amountOfUsers === null) {
                        return y(d.prediction.amountOfUsers);
                    } else {
                        return y(d.amountOfUsers);
                    }
                };

                let getX = function(d){
                        var date = new Date(0);
                        date.setUTCSeconds(d.timeStamp);
                        date = date.toLocaleTimeString();
                        return x(date);
                };

                let bars = svg.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .style("fill", function(d) {
                         if(d.amountOfUsers === null) {  console.log(d); return "steelblue"} else{ return "red"} })
                    .attr("x", getX)
                    .attr("width", x.bandwidth())
                    .attr("y", getY)
                    .attr("height", function (d) {
                        if (d.amountOfUsers === null) {
                            return height - y(d.prediction.amountOfUsers);
                        } else {
                            return height - y(d.amountOfUsers);
                        }
                    })

                bars.append("text")
                    .attr("x", getX)
                    .attr("y", function(d){return d.amountOfUsers - 10})
                    .attr("dy", ".35em")
                    .text(function(d) { return d; });


                // add the x Axis
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "axis")
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .style("text-anchor", "middle")

                // define the line
                var valueline = d3.line()
                    .x(getX)
                    .y(function(d) { console.log(d); return yTemperature(d.externSensor.temperature); });

                // Add the valueline path.
                svg.append("path")
                    .data([data])
                    .attr("class", "line")
                    .attr("d", valueline);

                svg.append("line")                              // attach a line
                    .style("stroke", "white")                   // colour the line
                    .attr("x1", function () {
                        return x(timeString);
                    })                                          // x position of the first end of the line
                    .attr("y1", 0)                              // y position of the first end of the line
                    .attr("x2", function () {
                        return x(timeString);
                    })                                          // x position of
                    .attr("y2", height)                      // y position of the second end of the line
                    .append("text")
                    .attr("color" , "white")
                    .attr("transform", "translate(0,"+ height + ")")
                    .text("current time")


                // add the y Axis
                svg.append("g")
                    .attr("class", "axis")
                    .call(d3.axisLeft(y))


                // add the y Axis
                svg.append("g")
                    .attr("class", "axis temperature")
                    .attr("transform", "translate( " + width + ", 0 )")
                    .call(d3.axisRight(yTemperature))
                    .selectAll("text")
                    .style("text-anchor", "start")



                svg.selectAll(".bar").exit().remove();


            });
        },
    }
});

