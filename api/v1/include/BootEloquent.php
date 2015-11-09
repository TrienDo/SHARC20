<?php
	// Database information
	$settings = array(
		'driver' => 'mysql',
		'host' => 'localhost',
		'database' => 'task_manager',
		'username' => 'root',
		'password' => 'root',
		'charset'   => 'utf8',
		'collation' => 'utf8_general_ci',
		'prefix' => ''
	);

	// Bootstrap Eloquent ORM
	/*$connFactory = new \Illuminate\Database\Connectors\ConnectionFactory();
	$conn = $connFactory->make($settings);
	$resolver = new \Illuminate\Database\ConnectionResolver();
	$resolver->addConnection('default', $conn);
	$resolver->setDefaultConnection('default');
	\Illuminate\Database\Eloquent\Model::setConnectionResolver($resolver);*/
	
	use Illuminate\Database\Capsule\Manager as Capsule;  

	$capsule = new Capsule; 

	$capsule->addConnection($settings);

	$capsule->bootEloquent();
?>