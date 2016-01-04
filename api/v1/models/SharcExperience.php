<?php
    /**
     * This class is a model of a SharcExperience using Eloquent     
     *
     * @author: Trien Do  
     */
    use Illuminate\Database\Eloquent\Model;
    class SharcExperience extends Model
    {	
    	public $timestamps = false;
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id','name','description','createdDate','lastPublishedDate','designerId','isPublished','moderationMode','latLng','summary','snapshotPath','thumbnailPath','size','theme');
    	protected $table = 'SharcExperiences'; //name of table
    }
?>