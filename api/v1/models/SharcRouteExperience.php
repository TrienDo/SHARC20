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
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'experienceId', 'routeDesignerId', 'description', 'poiList', 'eoiList');
    	protected $table = 'SharcRouteExperiences'; //name of table
    }
?>