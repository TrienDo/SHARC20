<?php
    
    /**
     * This class is a model of a SharcUser using Eloquent     
     *
     * @author: Trien Do  
     */
     
    use Illuminate\Database\Eloquent\Model;
    class SharcUser extends Model
    {	 
    	public $timestamps = false;
    	protected $fillable = array('username', 'email','registrationDate','lastOnline','cloudType','cloudAccountId','apiKey');
    	protected $table = 'SharcUsers'; //name of table
    }
?>

