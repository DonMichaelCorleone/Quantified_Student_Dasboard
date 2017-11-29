/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

/*jshint esversion: 6 */

require('./bootstrap');


var weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', ' thursday', 'friday', 'saturday'];
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
        comingHourPredictionAccuracy: 0,
        comingHourPredictionObj: 0,
        currentHour: 0,
        currentDay: weekdays[new Date().getDay()],
        currentDayAverages: 0

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
            window.addEventListener("resize", this.renderGraphs);
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
            this.getCurrentDayAverages();

        },
        getSixHourDeviationFromActualTimeData: function () {

            let curHour = this.getCurrentHour();
            let range = 3600 * 12;
            let sixHoursFuture = curHour + range;
            let sixHoursPast = curHour - range;
            this.sixHourDeviationFromActualTimeData = this.getPresenceRange(sixHoursPast, sixHoursFuture);

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
        getCurrentDayAverages: function (day) {

            var context = this;

            context.currentDayAverages = axios.post('api/presence/getDayAverage', {day: day})
                .then(function (response) {
                    // context.currentDayAverages = response.data;
                    return response.data;
                });

        },
        getComingHour: function () {

            let context = this;
            let comingHour = (context.getCurrentHour() + 3600);

            //Axios call
            this.comingHour =  axios.get('api/presence/' + comingHour)
                .then(function (response) {
                    context.comingHourPredictionObj = response.data[0].prediction;
                    context.comingHourPredictionObj.accuracy = response.data[0].prediction.accuracy.toFixed(2);
                    context.comingHourPredictionAccuracy = response.data[0].prediction.accuracy;
                    return response.data[0];
                });

            return this.comingHour;

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
        renderRadialGraph: function () {
            var context = this;
            /**********************************************
             /* Example of how to use d3 to create scalable
             /* SVG radial progress bars, controllable values
             /* and colours are passed in via data attributes.
             ************************************************/
            var wrapper = document.getElementById('accuracy_radial');
            var start = 0;

            let accuracy = context.comingHourPredictionAccuracy;
            console.log(accuracy);
            var end = accuracy;

            var colours = {
                fill: '#' + wrapper.dataset.fillColour,
                track: '#' + wrapper.dataset.trackColour,
                text: '#' + wrapper.dataset.textColour,
                stroke: '#' + wrapper.dataset.strokeColour,
            }

            var radius = 100;
            var border = wrapper.dataset.trackWidth;
            var strokeSpacing = wrapper.dataset.strokeSpacing;
            var endAngle = Math.PI * 2;
            var formatText = d3.format('.0%');
            var boxSize = radius * 2.2;
            var count = end;
            var progress = start;
            var step = end < start ? -0.01 : 0.01;

//Define the circle
            var circle = d3.arc()
                .startAngle(0)
                .innerRadius(radius)
                .outerRadius(radius - border);

//setup SVG wrapper
            var svg = d3.select(wrapper)
                .append('svg')
                .attr('width', boxSize)
                .attr('height', boxSize);

// ADD Group container
            var g = svg.append('g')
                .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

//Setup track
            var track = g.append('g').attr('class', 'radial-progress');
            track.append('path')
                .attr('class', 'radial-progress__background')
                .attr('fill', colours.track)
                .attr('stroke', colours.stroke)
                .attr('stroke-width', strokeSpacing + 'px')
                .attr('d', circle.endAngle(endAngle));

//Add colour fill
            var value = track.append('path')
                .attr('class', 'radial-progress__value')
                .attr('fill', colours.fill)
                .attr('stroke', colours.stroke)
                .attr('stroke-width', strokeSpacing + 'px');

//Add text value
            var numberText = track.append('text')
                .attr('class', 'radial-progress__text')
                .attr('fill', colours.text)
                .attr('text-anchor', 'middle')
                .attr('dy', '.5rem');

            function update(progress) {
                //update position of endAngle
                value.attr('d', circle.endAngle(endAngle * progress));
                //update text value
                numberText.text(formatText(progress));
            }

            (function iterate() {
                //call update to begin animation
                update(progress);
                if (count > 0) {
                    //reduce count till it reaches 0
                    count--;
                    //increase progress
                    progress += step;
                    //Control the speed of the fill
                    setTimeout(iterate, 10);
                }
            })();
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
            d3.selectAll("svg").remove();
            this.renderPresenceGraph();
            this.renderCurrentDayAverageGraph();
            this.renderRadialGraph();

        },
        renderCurrentDayAverageGraph: function () {

            this.currentDayAverages.then(function (data) {

                let tileWidth = $('#presence_average').parent().width();
                let tileHeight = $('#presence_average').parent().height();

                // set margins
                let margin = {top: 20, right: 10, bottom: 25, left: 25},
                    width = tileWidth - margin.left - margin.right,
                    height = tileHeight - margin.top - margin.bottom;


                // set the scales
                let x = d3.scaleBand()
                    .range([0, width])
                    .padding(0.01);

                let y = d3.scaleLinear()
                    .range([height, 0]);

                let presenceObjects = [];

                for (var i = 0; i < data.length; i++) {
                    presenceObjects.push(JSON.parse(data[i]))
                }

                let averageExtent = d3.extent(presenceObjects, function (d) {
                    return d.avg_amount_of_users / 1000;
                });

                let svg = d3.select("#presence_average").append('svg')
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                x.domain(presenceObjects.map(function (d) {
                    return d._id;
                }));

                y.domain(averageExtent);

                let bars = svg.selectAll(".bar")
                    .data(presenceObjects)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function (d) {
                        return x(d._id);
                    })
                    .style("fill", "steelblue")
                    .attr("width", x.bandwidth())
                    .attr("y", function (d) {
                        return y(d.avg_amount_of_users / 1000);
                    })
                    .attr("height", 0);


                bars.transition()
                    .duration(1000)
                    .attr("height", function (d) {
                        return (height - y(d.avg_amount_of_users / 1000));
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
                    .attr("transform", function (d) {
                        return "rotate(-90)"
                    });
                // add the y Axis
                svg.append("g")
                    .attr("class", "axis")
                    .call(d3.axisLeft(y))
                    .selectAll("text")


                svg.selectAll(".bar").exit().remove();

            });

        },
        renderPresenceGraph: function (width, height) {

            var context = this;



            let currentHour = context.getCurrentHour();
            let date = new Date(0);
            date.setUTCSeconds(currentHour);
            let timeString = date.toLocaleString();

            // get current with and height of tile
            let tileWidth = $('#presence_actual').parent().width();
            let tileHeight = $('#presence_actual').parent().height();

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

                let amountOfUsers = function (d) {
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
                    .attr("transform", function (d) {
                        return "rotate(-90)"
                    });

                // define the line
                var valueline = d3.line()
                    .x(function (d) {
                        var date = new Date(0);
                        date.setUTCSeconds(d.timeStamp);
                        date = date.toLocaleString();
                        return x(date);
                    })
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

