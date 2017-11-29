<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Presence as Presence;
use Illuminate\Support\Facades\DB;

class PresenceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
//        return view('home')->with(Presence::all());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($request)
    {
        $prescence = new Presence($request->all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $timeStamp)
    {
        $timeStamp = intval($timeStamp);
        $presence = Presence::where('timeStamp', $timeStamp)->get();
        return $presence;
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function getDay(request $request)
    {
        $weekday = $request->input("weekday");
        $result = Presence::where('date.weekday', intval($weekday))
            ->groupBy('$date.hour')
            ->get();
        return $result;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function getRange(Request $request)
    {

        $minDateRange = $request->input('minDate');
        $maxDateRange = $request->input('maxDate');
        $presenceData = Presence::whereBetween('timeStamp', [intval($minDateRange), intval($maxDateRange)])
            ->get();
        return $presenceData;
    }

    public function getDayAverage(Request $request)
    {

        $requestedDay = $request->input('day');
        $requestedDay = intval($requestedDay);

        $cursor = Presence::raw()->aggregate([
            ['$match' => ["date.weekday" => $requestedDay]],
            ['$group' =>
                ['_id' => '$date.hour',
                    'avg_amount_of_users' => ['$avg' => '$amountOfUsers'],
                    'avg_temperature' => ['$avg' => '$externSensor.temperature'],
                    'avg_humidity' => ['$avg' => '$externSensor.humidity'],
                    'avg_cloud_cover' => ['$avg' => '$externSensor.cloudCover'],
                    'avg_visibility' => ['$avg' => '$externSensor.visibility'],
                    'avg_windspeed' => ['$avg' => '$externSensor.windSpeed'],
                    'avg_precip_intensity' => ['$avg' => '$externSensor.precipIntensity'],
                    'avg_precip_probability' => ['$avg' => '$externSensor.precipProbability'],
                    'avg_gas_usage' => ['$avg' => '$internSensor.gasUsage'],
                    'avg_light_intensity' => ['$avg' => '$internSensor.lightIntensity']
                ]
            ],
            ['$sort' => ['_id' => 1]]
        ]);

        $presenceCollection = [];

        foreach ($cursor as $record) {
            $presence = json_encode($record);
            array_push($presenceCollection, $presence);;
        };

        return $presenceCollection;
    }
}
