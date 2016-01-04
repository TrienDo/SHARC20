<?php
    
    /**
     * This class is a model of a SharcEoiDesigner using Eloquent [a pool of EOIs for each designer]     
     *
     * @author: Trien Do
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcEoiDesigner extends Model
    {	 
    	public $timestamps = false;
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'name', 'description', 'designerId');
    	protected $table = 'SharcEoiDesigners'; //name of table        
    }
?>

