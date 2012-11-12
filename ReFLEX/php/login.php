<?php
header('Access-Control-Allow-Origin: *'); 
require_once 'db.php';
if(isset($_POST['email']))
{
	$q = $db->prepare('SELECT id, name, date, email FROM users WHERE email = :email AND pin = :pin');
	$q->execute(
		array('email' => $_POST['email'],
		'pin' => $_POST['pin']));
	
	if($q->rowCount() == 1) {
		$result = $q->fetch();
		$USER = new StdClass();
		$USER->Success = true;
		$USER->ID = $result['id'];
		$USER->username = $result['name'];
		$USER->registered = $result['date'];
		$USER->Email = $result['email'];
		echo json_encode($USER);
	}
	else{
		$res = new StdClass();
		$res->Success = false;
		$res->Error = 'User not found';
		echo json_encode($res);
	}
}
?>