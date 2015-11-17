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
    	protected $fillable = array('contentType', 'content', 'size', 'designerId');
    	protected $table = 'SharcMediaDesigners'; //name of table       
    }
?>
