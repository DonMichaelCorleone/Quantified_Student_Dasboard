<!doctype html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Laravel</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
        <script src="https://d3js.org/d3.v4.min.js"></script>
        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">

        <!-- Styles -->
        <style>
            .line {
                fill: none;
                stroke: white;
                stroke-width: 2px;
            }
            .panelBody text {
                fill: white;
                font: 10px sans-serif;
                text-anchor: end;

            }
            .axis text {
                font: 10px sans-serif;
            }

            .axis path,
            /*.axis line {*/
                /*shape-rendering: crispEdges;*/
            /*}*/
            .axis *{
                color: white;
                fill: white;
            }

            html, body {
                background-color: #fff;
                color: #101214;
                font-family: 'Raleway', sans-serif;
                font-weight: 100;
                height: 100vh;
                margin: 0;
            }
            .panelBody {
                min-height: inherit;
            }
            .panelBody  h1 {
                height: 100%;
                width: 100%;
                font-weight: bold;


             }
            .triangle{
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 15px 30px 15px;
                margin-left: 15px;
                display: inline;
                padding-bottom: -15px;
            }
            .green {
                border-color: transparent transparent #646723 transparent;
            }
            .red {
                border-color: transparent transparent darkred transparent;
            }
            .dashboard-element{
                border-color: #292929;
                border-width: 4px;
                background-color: #222222;
                color: white;
                margin-bottom: 20px;
                text-align: center;
                height: inherit;
            }
            .container{
                min-height: 1500px!important;
            }
            .row-header{
                border-style: solid;
                height:60px;
                line-height: 50px;
                padding-left: 20px;
                font-family: 'Raleway', sans-serif;
                font-weight: bold;
                font-size: large;
            }
            .row-dashboard small{
                height: 200px;
            }
            .row-dashboard normal{
                height: 250px;
            }
            .col{
                padding: 0px 0px 0px 0px;
            }
            .title {
                background-color: #222222;
                color: white;
                height:30px;
                font-weight: bold;
                line-height: 25px;
            }
            .tile {
                background-color: #292929;
                margin-right: 2px;
                margin-left: 2px;
            }
            #app {
                background-color:black;
            }
            .small {
                min-height:200px;
            }/* Style the dots by assigning a fill and stroke */
            .dot {
                fill: #ffab00;
                stroke: #fff;
            }

            #progress {
                padding: 20px;
            }


            .radial-progress {
            &__text {
                 font-family: Arial, sans-serif;
                 font-size: 2rem;
                 font-weight: bold;
             }
            }


        </style>
    </head>
    <body>
            <div class="content">
                <div id="app">
                    <div class="container" style="max-height: 100%; max-width: 1530px!important;">
                        <div class="row row-header dashboard-element">
                                Quantified Student Dashboard
                        </div>
                        <div class="row row-dashboard small">


                            <div class="col tile dashboard-element">
                                <div  class="panelBody">
                                <div class="title">Time</div>
                                <h1 id="timer"></h1>
                                </div>
                            </div>
                            {{--Presence Tile--}}
                            <div class="col tile dashboard-element">
                                <div class="title">Current presence R1</div>
                                <div  class="panelBody" v-if="currentPresenceR1 > pastHourPresenceR1">
                                    <h1>@{{ currentPresenceR1 }}</h1>
                                    <div class="row">
                                        <div class="col">
                                            <div class="triangle green"></div>
                                        </div>
                                        <div class="col">
                                            <h1>@{{ pastHourPresenceR1 }}</h1>
                                        </div>
                                    </div>

                                </div>

                                <div  class="panelBody" v-else-if="currentPresenceR1 == pastHourPresenceR1">
                                    <h1>@{{ currentPresenceR1 }}</h1>
                                </div>

                                <div  class="panelBody" v-else="currentPresenceR1 < pastHourPresenceR1">
                                    <h1>@{{ currentPresenceR1 }}</h1>
                                    <div class="triangle red"></div>
                                    <h1>@{{ pastHourPresenceR1 }}</h1>
                                </div>
                            </div>


                            <div class="col tile dashboard-element">
                                <div class="title">Predicted amount for coming hour</div>
                                <div class="panelBody"><h1>@{{ comingHourPredictionObj.amountOfUsers }}</h1></div>
                            </div>
                            <div class="col tile dashboard-element">
                                <div class="title">Weather</div>
                                <div class="panelBody">
                                    <h1 v-if="currentHourWeather">@{{ currentHourWeather.summary }}</h1>
                                </div>
                            </div>


                        </div>
                        {{--<div class="row row-dashboard small">--}}
                            {{--<div class="col tile dashboard-element"></div>--}}
                            {{--<div class="col tile dashboard-element"></div>--}}
                            {{--<div class="col tile dashboard-element"></div>--}}
                            {{--<div class="col tile dashboard-element"></div>--}}
                            {{--<div class="col tile dashboard-element"></div>--}}
                        {{--</div>--}}
                    <div class="row row-dashboard small">
                        <div class="col tile dashboard-element">
                            <div class="title">Diagram toolbox</div>
                            <div class="panelBody">
                                <div id="toolBox"></div>
                            </div>

                        </div>
                        <div class="col tile dashboard-element">
                            <div class="title">Alert</div>
                            <div class="'panelbody">
                                <h1 v-if='currentHourWeather.alert && currentHourWeather.alert.description  !== ""'>@{{ currentHourWeather.alert.description }}</h1>
                                <h1 v-else>No Alerts</h1>
                            </div>
                        </div>
                        <div class="col tile dashboard-element">
                            <div class="title">Accuracy</div>
                            <div class="panelBody"
                                 data-percentage="99"
                                 data-track-width="12"
                                 data-track-colour="555555"
                                 data-fill-colour="4682b4"
                                 data-text-colour="00C0FF"
                                 data-stroke-spacing="4"
                                 id="accuracy_radial"></div>

                        </div>
                        <div class="col tile dashboard-element">
                            <div class="title">Average @{{ currentDay }}</div>
                            <div class="panelBody" id="presence_average"></div>
                        </div>

                    </div>
                        <div class="row row-dashboard small">
                            <div class="col tile dashboard-element">
                                <div class="title">Presence today</div>
                                <div class="panelBody" id="presence_actual"></div>
                            </div>
                        </div>
                        </div>

                </div>
            </div>
    </body>
    <script src="js/app.js"></script>
</html>
