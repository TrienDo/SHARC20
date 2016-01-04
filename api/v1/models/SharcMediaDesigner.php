<?php
    
    /**
     * This class is a model of a SharcMediaDesigner using Eloquent [a pool of media for each designer]    
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcMediaDesigner extends Model
    {	 
    	public $timestamps = false;
        public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'name', 'contentType', 'content', 'size', 'designerId', 'createdDate', 'fileId');
    	protected $table = 'SharcMediaDesigners'; //name of table       
    }
?>
