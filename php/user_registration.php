<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$return = new StdClass();

$return->Success = true;
$return->MailSent = false;
$return->MailEnabled = MAIL_ENABLED;
$user = $_POST['Username'];
$email = $_POST['Email'];
$return->Mail = $email;
$pin = substr(base_convert(rand(10e16, 10e20), 10, 36), 0, 4);
$return->Pin = $pin;

$q = $db->prepare('SELECT id FROM users WHERE email = :email');
$q->execute(array('email' => $email));

if($q->rowCount() > 0) {
	$return->Success = false;
	$return->Message = localize('User for this email address exists already!');
	echo json_encode($return);
	die();
}

//Insert a new row
$q = $db->prepare('INSERT INTO users(name, email, pin) VALUES(:name, :email, :pin)');
if(!$q->execute(array(
	'name' => $user, 
	'email' => $email,
	'pin' => $pin)))
	$return->Success = false;

//Get the ID
$ID = $db->lastInsertId();
	
//Send mail
//...except if you're using local server which doesn't support it.
if(MAIL_ENABLED) {
	
	$subject = localize('Thank you for signing up for Reflex');
	$message = '<b>'.localize('Hello').' '.$user.'</b><br />
	<b>'.localize('Thank you for signing up for Reflex').'</b>
	<p>'.localize('Your pin code:').' '.$pin.'</p>
	<p>'.localize('Navigate to your <a href="http://reflex.aalto.fi">ReFlex page</a> and login with your email address and pin code.').'</p>
	';
	
	if(!mail($email, $subject, $message, MAIL_HEADERS))
		$return->Success = false;
	else
		$return->MailSent = true;
}
	
echo json_encode($return);


?>