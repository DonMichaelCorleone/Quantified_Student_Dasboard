<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

use App\Presence as Presence;
use App\Http\Controllers\PresenceController;


Route::post('/presence/getRange/', 'PresenceController@getRange');

Route::get('/presence/all' , function(Request $request) {
    return Presence::all();
});

Route::get('/presence/latest' , function(Request $request) {
    return Presence::orderBy('timeStamp', 'desc')->take(1)->get();
});

Route::get('/presence/{timeStamp}' , 'PresenceController@show');