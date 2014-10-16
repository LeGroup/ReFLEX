<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$new_note = new StdClass();

$id = Auth($_POST['email'], $_POST['pin']);
if(!$id) { $obj = new StdClass(); $obj->Success = false; echo json_encode($obj); die(); }

$new_note->Picture = "";
$new_note->Voice = "";
$new_note->Student = $id;
$new_note->Time = $_POST['time'];
$new_note->Pin = $_POST['pin'];
$new_note->Length = $_POST['length'];

$q = $db->prepare('SELECT name FROM users WHERE id = :id AND pin = :pin');
$q->execute(array(
	'id' => $new_note->Student,
	'pin' => $new_note->Pin));

if($q->rowCount() != 1) {
	$new_note->Success = false;
	echo json_encode($new_note);
	die();
}

$username = $q->fetchColumn();

$root = '../';
$base='uploads';
$student_folder = $username.'_'.$new_note->Student;

//Insert a row in the database
$q = $db->prepare('INSERT INTO notes(Time, Student) 
		VALUES(:time, :student)');
		
		$result = $q->execute(array(
		'time' => $new_note->Time,
		'student' => $new_note->Student));

if($result) { }
else { 
	_log('Inserting database row failed!'); 
	$e = $db->errorInfo();
	_log($e[2]); 
}

//Get the ID
$new_note->ID = $db->lastInsertId();

//Hash
$hash = sha1($_SERVER['WEBSITE_SALT'].sha1($_SERVER['WEBSITE_SALT'].sha1(microtime().$new_note->ID)));

CreateDirectoryIfNotExist($root.$base);
CreateDirectoryIfNotExist($root.$base . '/' . $student_folder);

$directory = $base . '/' . $student_folder . '/';

//Saving photo
$picture = $_FILES['photo']['tmp_name'];
$i = 1;
$pic_name= $directory.$new_note->Student.'_'.$hash.$i.'_pic.jpg';

while(file_exists($root.$pic_name))
{ $i++; $pic_name = $directory.$new_note->Student.'_'.$hash.$i.'_pic.jpg'; }

if(!move_uploaded_file($picture, $root.$pic_name))
{ _log('Uploading photo failed!'); }
else
{ $new_note->Picture = $pic_name; }

//Saving audio
$audio = $_FILES['voice']['tmp_name'];
$i = 1;
$aud_name = $directory.$new_note->Student.'_'.$hash.$i.'_rec.mp3';
while(file_exists($root.$aud_name))
{ $i++; $aud_name = $directory.$new_note->Student.'_'.$hash.$i.'_rec.mp3'; }

if(!move_uploaded_file($audio, $root.$aud_name)){
	_log('Uploading audio failed!');
}
else { $new_note->Voice = $aud_name; }

$q = $db->prepare('UPDATE notes SET Voice = :voice, Picture = :picture, AudioLength = :length WHERE ID = :id');
$q->execute(array(
		'voice' => $aud_name,
		'picture' => $pic_name,
		'length' => $new_note->Length,
		'id' => $new_note->ID
		));

//Return encoded results to javascript
echo json_encode($new_note);

fclose($log);

function CreateDirectoryIfNotExist($path) {
	if (!file_exists($path)) 
		mkdir($path);
}
?>
