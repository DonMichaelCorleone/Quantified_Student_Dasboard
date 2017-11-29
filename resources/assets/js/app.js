/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

/*jshint esversion: 6 */

require('./bootstrap');

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
        currentHour: 0,

    },
    created: function () {
        this.loadData();
        this.ready();
        this.startTime();
    },
    mounted: function () {
        this.renderGraphs();
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
            let curTime = Math.round(d.getTime() / 1000);
            let pastMonthEpoch = Math.round((d.getTime() / 1000));

            d.setMonth(d.getMonth() - 1);
            this.PastMonthRecords = this.getPresenceRange(pastMonthEpoch, curTime);

        },
        getCurrentHour: function () {

            let d = new Date();
            let seconds = Math.round(d.getTime() / 1000);
            let remainder = seconds % 3600;

            seconds = seconds - remainder;
            return seconds;
        },
        data: function () {
            return data;
        },
        getComingHour: function () {

            let context = this;
            let comingHour = (context.getCurrentHour() + 3600);

            //Axios call
            axios.get('api/presence/' + comingHour)
                .then(function (response) {
                    context.comingHour = response.data[0];
                    context.comingHourPredictionObj = response.data[0].prediction;
                    context.comingHourPredictionObj.accuracy = response.data[0].prediction.accuracy.toFixed(2);
                });

        },
        getCurrentPresence: function () {

            let context = this;
            let curHour = this.getCurrentHour();

            //Axios call
            axios.get('api/presence/' + curHour)
                .then(function (response) {
                    context.pastHourPresenceR1 = context.currentPresenceR1;
                    context.currentPresenceR1 = response.data[0].amountOfUsers;
                    context.currentHourWeather = response.data[0].externSensor;
                });

        },
        getPresenceRange: function (minEpochTime, maxEpochTime) {

            //Axios call
            let result = axios.post('api/presence/getRange', {minDate: minEpochTime, maxDate: maxEpochTime})
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

            // remove current svg
            d3.select("svg").remove();

            let currentHour = context.getCurrentHour();
            let date = new Date(0);
            date.setUTCSeconds(currentHour);
            let timeString = date.toLocaleString();

            // get current with and height of tile
            let tileWidth = $('#presence_actual').parent().parent().width();
            let tileHeight = $('#presence_actual').parent().parent().height();

            this.sixHourDeviationFromActualTimeData.then(function (data) {

                // set margins
                let margin = {top: 20, right: 40, bottom: 30, left: 40},
                    width = tileWidth - margin.left - margin.right,
                    height = tileHeight - margin.top - margin.bottom;

                // set the scales
                let x = d3.scaleBand()
                    .range([0, width])
                    .padding(0.01);

                let y = d3.scaleLinear()
                    .range([height, 0]);

                let yTemperature = d3.scaleLinear()
                    .range([height, 0]);

                // apply toolbox
                let toolbox = d3.selectAll("#toolBox").append("div")
                    .attr("opacity", 0);



                // get max amount of presence
                let maximalBuildingPresence = d3.max(data, function (d) {
                    if (d.amountOfUsers !== null) {
                        return d.amountOfUsers;
                    } else {
                        return d.prediction.amountOfUsers;
                    }
                });

                let amountOfUsers = function(d) {
                    if (d.amountOfUsers === null) {
                        return d.prediction.amountOfUsers;
                    } else {
                        return d.amountOfUsers;
                    }
                };

                // get max temperature
                let maxTemperature = d3.max(data, function (d) {
                    return d.externSensor.temperature;
                });

                // append the svg
                let svg = d3.select("#presence_actual").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                // bind data to scale
                x.domain(data.map(function (d) {
                    let date = new Date(0);
                    date.setUTCSeconds(d.timeStamp);
                    return date.toLocaleString();
                }));

                y.domain([0, maximalBuildingPresence]);

                yTemperature.domain([d3.min(data, function (d) {
                    return d.externSensor.temperature;
                }), maxTemperature]);


                let getY = function (d) {
                    if (d.amountOfUsers === null) {
                        return y(d.prediction.amountOfUsers);
                    } else {
                        return y(d.amountOfUsers);
                    }
                };

                let getX = function (d) {
                    let date = new Date(0);
                    date.setUTCSeconds(d.timeStamp);
                    date = date.toLocaleString();
                    return x(date);
                };

                let bars = svg.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .style("fill", function (d) {
                        if (d.amountOfUsers === null) {
                            return "#646723";
                        } else {
                            return "steelblue";
                        }
                    })
                    .attr("x", getX)
                    .attr("width", x.bandwidth())
                    .attr("y", getY)
                    .attr("height", 0)
                    .on("mouseover", function (d) {
                        toolbox.transition()
                            .style("opacity", 1);

                        toolbox.html("<h1>" + amountOfUsers(d) + "</h1>");
                        d3.select(this).style("opacity", 0.5);

                    })
                    .on("mouseout", function (d) {
                        toolbox.transition()
                            .style("opacity", 0);
                        d3.select(this).style("opacity", 1);
                    })


                    bars.transition()
                    .duration(1000)
                    .attr("height", function (d) {
                        if (d.amountOfUsers === null) {
                            return height - y(d.prediction.amountOfUsers);
                        } else {
                            return height - y(d.amountOfUsers);
                        }
                    });

                bars.append("text")
                    .attr("x", getX)
                    .attr("y", function (d) {
                        return d.amountOfUsers - 10;
                    })
                    .attr("dy", ".35em")
                    .text(function (d) {
                        return d;
                    });

                // add the x Axis
                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "axis")
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .style("text-anchor", "middle")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-90)"
                    });

                // define the line
                var valueline = d3.line()
                    .x(function (d) {
                        var date = new Date(0);
                        date.setUTCSeconds(d.timeStamp);
                        date = date.toLocaleString();
                        return x(date);
                    }            )
                    .y(function (d) {
                        return yTemperature(d.externSensor.temperature);
                    })

                // Add the valueline path.
                let path = svg.append("path")
                    .data([data])
                    .attr("class", "line")
                    .attr("d", valueline)
                    .attr('pointer-events', 'visibleStroke');


                svg.append("line")                              // attach a line
                    .style("stroke", "white")                   // colour the line
                    .attr("x1", function () {
                        return x(timeString);
                    })                                          // x position of the first end of the line
                    .attr("y1", 0)                              // y position of the first end of the line
                    .attr("x2", function () {
                        return x(timeString);
                    })                                          // x position of
                    .attr("y2", height)                         // y position of the second end of the line
                    .append("text")
                    .attr("color", "white")
                    .attr("transform", "translate(0," + height + ")")
                    .text("current time");

                // add the y Axis
                svg.append("g")
                    .attr("class", "axis")
                    .call(d3.axisLeft(y));

                // add the y Axis
                svg.append("g")
                    .attr("class", "axis temperature")
                    .attr("transform", "translate( " + width + ", 0 )")
                    .call(d3.axisRight(yTemperature))
                    .selectAll("text")
                    .style("text-anchor", "start");

                svg.selectAll(".bar").exit().remove();
            });
        },
    }
});

