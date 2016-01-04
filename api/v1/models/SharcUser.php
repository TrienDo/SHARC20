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
    	public $incrementing = false;//Important for non-increment id
    	protected $fillable = array('id', 'username', 'email','registrationDate','lastOnline','cloudType','cloudAccountId','apiKey','location');
    	protected $table = 'SharcUsers'; //name of table
    }
?>

