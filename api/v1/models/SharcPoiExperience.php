<?php
    
    /**
     * This class is a model of a SharcPoiExperience using Eloquent  [POIs used in an experience]   
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcPoiExperience extends Model 
    {	 
    	public $timestamps = false;
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'experienceId', 'poiDesignerId','description', 'typeList', 'eoiList', 'routeList');
    	protected $table = 'SharcPoiExperiences'; //name of table
        /*public function sharcPoiDesigner()
        {
            return $this->belongsTo('SharcPoiDesigner');
        }*/
    }
?>

