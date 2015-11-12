<?php
    
    /**
     * This class is a model of a SharcPoiDesigner using Eloquent     
     *
     * @author: Trien Do   , name, coordinate, triggerZone, designerID
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcPoiDesigner extends Model
    {	 
    	public $timestamps = false;
    	protected $fillable = array('name', 'coordinate','triggerZone', 'designerId');
    	protected $table = 'SharcPoiDesigners'; //name of table
    }
?>

