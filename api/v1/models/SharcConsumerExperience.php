<?php
    
    /**
     * This class is a model of a SharcConsumerExperience using Eloquent -> keep track of who consumes which experiences     
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcConsumerExperience extends Model
    {	 
    	public $timestamps = false;
    	protected $fillable = array('userId', 'experienceId','lastVisitedDate');
    	protected $table = 'SharcConsumerExperiences'; //name of table
    }
?>
