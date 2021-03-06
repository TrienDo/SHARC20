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
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'name', 'coordinate','triggerZone', 'designerId');
    	protected $table = 'SharcPoiDesigners'; //name of table
        /*public function sharcPoiExperience()
        {
            return $this->hasMany('SharcPoiExperience');
        }*/
    }
?>

