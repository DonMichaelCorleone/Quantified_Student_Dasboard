<?php

namespace App;

//use Illuminate\Database\Eloquent\Model;

/*
 * Use the mongodb driver model for eloquent
 */
use Jenssegers\Mongodb\Eloquent\Model as Model;

class Presence extends Model
{

    protected $primaryKey = 'id';
    protected $connection = 'mongodb';
    protected $collection = 'prescence';

}
