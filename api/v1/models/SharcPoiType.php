<?php
    
    /**
     * This class is a model of a SharcPoiType using Eloquent [a pool of SharcPoiTypes for each designer]     
     *
     * @author: Trien Do
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcPoiType extends Model
    {	 
    	public $timestamps = false;
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'name', 'description', 'designerId');
    	protected $table = 'SharcPoiTypes'; //name of table        
    }
?>

