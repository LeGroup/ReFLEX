<?php
require_once 'db.php';
if(isset($_POST['id']))
{
	$q = $db->prepare('SELECT * FROM users WHERE url_id = :id');
	$q->execute(array('id' => $_POST['id']));
	
	if($q->rowCount() == 1) {
		$result = $q->fetch();
		$USER = new StdClass();
		$USER->Success = true;
		$USER->ID = $result['id'];
		$USER->username = $result['name'];
		$USER->registered = $result['date'];
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