<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$return = new StdClass();

$return->Success = true;
$return->MailSent = false;
$user = $_POST['Username'];
$email = $_POST['Email'];
$return->Mail = $email;
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
$uri = 'http://reflex.aalto.fi/'.$uri;

//Save the uri in the database
$q = $db->prepare('UPDATE users SET url_id = :url_id WHERE id = :id');
$q->execute(array('url_id' => $hash, 'id' => $ID));

//Send mail
//...except if you're using local server which doesn't support it.
if(MAIL_ENABLED) {
	$subject = 'Your user account in ReFLEX.';
	$message = '<h3>Hello ' . $user . '</h3>'.
	"<p>Here's a link to your personal user page: " . "<a href=\"".$uri."\">Your user page</a></p>.
	<p>Here's also your PIN code you need to open private notes: <b>". $pin . '</b></p>'.
	'<p style="color: #565656;">Reflex</p>';

	if(!mail($email, $subject, $message, MAIL_HEADERS))
		$return->Success = false;
	else
		$return->MailSent = true;
}
	
echo json_encode($return);


?>