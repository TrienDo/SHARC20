<?php
    
    /**
     * This class is a model of a SharcPoiDesigner using Eloquent [a pool of POIs for each designer]     
     *
     * @author: Trien Do
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcPoiDesigner extends Model
    {	 
    	public $timestamps = false;
    	protected $fillable = array('name', 'coordinate','triggerZone', 'designerId');
    	protected $table = 'SharcPoiDesigners'; //name of table
        /*public function sharcPoiExperience()
        {
            return $this->hasMany('SharcPoiExperience');
        }*/
    }
?>

