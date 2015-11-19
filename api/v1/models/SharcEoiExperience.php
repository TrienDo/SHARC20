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
    	protected $fillable = array('experienceId', 'eoiDesignerId','note');
    	protected $table = 'SharcEoiExperiences'; //name of table
    }
?>

