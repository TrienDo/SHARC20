<?php
    
    /**
     * This class is a model of a SharcResponse using Eloquent     
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcResponse extends Model
    {	 
    	public $timestamps = false;
        public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'experienceId', 'userId', 'contentType', 'content', 'description', 'entityType', 'entityId', 'status', 'size', 'submittedDate');
    	protected $table = 'SharcResponses'; //name of table       
    }
?>