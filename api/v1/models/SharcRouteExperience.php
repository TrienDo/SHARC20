<?php
    
    /**
     * This class is a model of a SharcRouteExperience using Eloquent  [Route used in an experience]   
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcRouteExperience extends Model  
    {	 
    	public $timestamps = false;
    	protected $fillable = array('experienceId', 'routeDesignerId', 'description', 'poiList', 'eoiList');
    	protected $table = 'SharcRouteExperiences'; //name of table
    }
?>