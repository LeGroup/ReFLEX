<?php
require_once('db.php');

$return = new StdClass();

$return->Success = true;
$user = $_POST['Username'];
$email = $_POST['Email'];
$pin = substr(base_convert(rand(10e16, 10e20), 10, 36), 0, 4);
$return->Pin = $pin;

//Insert a new row
$q = $db->prepare('INSERT INTO users(name, email, pin) VALUES(:name, :email, :pin)');
if(!$q->execute(array(
	'name' => $user, 
	'email' => $email,
	'pin' => $pin)))
	$return->Success = false;

//Get the ID
$ID = $db->lastInsertId();
	
//Let's create hash from id and username
$hash = sha1($ID . $user);
	
//Create uri to the new user's page
$uri = '?i='.$hash;
$return->Uri = $uri;

//Save the uri in the database
$q = $db->prepare('UPDATE users SET url_id = :url_id WHERE id = :id');
$q->execute(array('url_id' => $hash, 'id' => $ID));

//Send mail
//...except if you're using local server which doesn't support it.
if($mail_enabled) {
	$subject = 'Your user account in ReFLEX.';
	$message = 'Hello ' . $user .
	"\nHere's a link to your personal user page: " . "<a href=\"".$uri."\">Your user page</a>.
	Here's also your PIN code you need to open private notes: ". $pin;
	$headers = 'From: reflex@example.com' . "\r\n" .
	'X-Mailer: PHP/' . phpversion();

	if(!mail($email, $subject, $message, $headers))
		$return->Success = false;
}
	
echo json_encode($return);


?>