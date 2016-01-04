<?php
    
    /**
     * This class is a model of a SharcMediaExperience using Eloquent [media used in an experience]    
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcMediaExperience extends Model
    {	 
    	public $timestamps = false;        
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'mediaDesignerId', 'entityType','entityId', 'experienceId','caption', 'context', 'mainMedia', 'visible', 'order', 'size');
    	protected $table = 'SharcMediaExperiences'; //name of table
    }
?>
