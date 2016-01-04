<?php
    
    /**
     * This class is a model of a SharcEoiExperience using Eloquent  [EOIs used in an experience]   
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcEoiExperience extends Model 
    {	 
    	public $timestamps = false;
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'experienceId', 'eoiDesignerId','note', 'poiList', 'routeList');
    	protected $table = 'SharcEoiExperiences'; //name of table
    }
?>

