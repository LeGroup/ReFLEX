<?php
require_once('db.php');

$return = new StdClass();

$return->Success = true;
$user = $_POST['id'];
$pin = substr(base_convert(rand(10e16, 10e20), 10, 36), 0, 4);

$q = $db->prepare('UPDATE users SET pin = :pin WHERE id = :id');
$q->execute(array('pin' => $pin, 'id' => $user));

$q = $db->prepare('SELECT email FROM users WHERE id = :id');
$q->execute(array('id' => $user));
$email = $q->fetchColumn();
$return->Mail = $email;
$return->MailEnabled = $mail_enabled;

$mail_enabled = true;
	
//Send mail
//...except if you're using local server which doesn't have a mail server oh well
if($mail_enabled) {
	$subject = 'You requested new pin code in ReFLEX.';
	$message = 'Hello' .
	"\nHere's your new pin code: " . $pin;
	$headers = 'From: reflex@example.com' . "\r\n" .
	'X-Mailer: PHP/' . phpversion();

	$return->Headers = $headers;
	$return->Msg = $message;
	
	if(!mail($email, $subject, $message, $headers))
		$return->Success = false;
	else
		$return->MailSent = true;
}

//Delete after mail works
//Otherwise anyone is able to reset pin and see it in POST data
if(!$mail_enabled)
	$return->Pin = $pin;
	
echo json_encode($return);


?>