<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$return = new StdClass();

$return->Success = true;
$return->EmailFound = true;
$email = $_POST['email'];
$pin = substr(base_convert(rand(10e16, 10e20), 10, 36), 0, 4);

$q = $db->prepare('SELECT id FROM users WHERE email = :email');
$q->execute(array('email' => $_POST['email']));

if($q->rowCount() == 0) {
	$return->EmailFound = false;
	$return->Success = false;
}
else {

	$id = $q->fetchColumn();

	$q = $db->prepare('UPDATE users SET pin = :pin WHERE id = :id');
	$q->execute(array('pin' => $pin, 'id' => $id));

	//Send mail
	if(MAIL_ENABLED) {
		$subject = localize('You requested a new pin code in ReFLEX.');
		$message = localize('Hello').'<br />'. 
		localize("Here's your new pin code: ") . $pin;
			
		//Headers from db.php
		if(!mail($email, $subject, $message, MAIL_HEADERS))
			$return->Success = false;
		else
			$return->MailSent = true;
	}

	//Delete after mail works
	//Otherwise anyone is able to reset pin and see it in POST data
	if(!MAIL_ENABLED)
		$return->Pin = $pin;
}
echo json_encode($return);


?>