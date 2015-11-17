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
    	protected $fillable = array('experienceId', 'poiDesignerId','description');
    	protected $table = 'SharcPoiExperiences'; //name of table
        /*public function sharcPoiDesigner()
        {
            return $this->belongsTo('SharcPoiDesigner');
        }*/
    }
?>

