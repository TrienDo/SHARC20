<?php
    
    /**
     * This class is a model of a SharcRouteDesigner using Eloquent [a pool of Routes for each designer]     
     *
     * @author: Trien Do
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcRouteDesigner extends Model
    {	 
    	public $timestamps = false;
    	protected $fillable = array('name', 'directed', 'colour','path','designerId');
    	protected $table = 'SharcRouteDesigners'; //name of table        
    }
?>

