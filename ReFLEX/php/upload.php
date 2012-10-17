<?php
header('Access-Control-Allow-Origin: *'); 
require_once('db.php');

$new_note = new StdClass();

_log('------------------------NEW NOTE----------------------------');
_log('Photo size: ' . $_FILES['photo']['size']/1000 . " kilobytes");
_log('Audio size: ' . $_FILES['voice']['size']/1000 . " kilobytes");
_log('Photo error code: ' . $_FILES['photo']['error']);
_log('Audio error code: ' . $_FILES['voice']['error']);


$new_note->Picture = "";
$new_note->Voice = "";
$new_note->Student = $_POST['user_id'];
$new_note->Title = isset($_POST['note_title']) ? $_POST['note_title'] : '';
$new_note->Time = $_POST['time'];
$new_note->Private = 'no';

$q = $db->prepare('SELECT name FROM users WHERE id = :id');
$q->execute(array('id' => $new_note->Student));
$username = $q->fetchColumn();

$root = '../';
$base='uploads';
$student_folder = $username.'_'.$new_note->Student;

CreateDirectoryIfNotExist($root.$base);
CreateDirectoryIfNotExist($root.$base . '/' . $student_folder);

$directory = $base . '/' . $student_folder . '/';

//Saving photo
$picture = $_FILES['photo']['tmp_name'];
$i = 1;
$pic_name= $directory.$new_note->Student.'_'.sha1($i).'_pic.jpg';

while(file_exists($root.$pic_name))
{ $i++; $pic_name = $directory.$new_note->Student.'_'.sha1($i).'_pic.jpg'; }

if(!move_uploaded_file($picture, $root.$pic_name))
{ _log('Uploading photo failed!'); }
else
{ $new_note->Picture = $pic_name; }


//Saving audio
$audio = $_FILES['voice']['tmp_name'];
$i = 1;
$aud_name = $directory.$new_note->Student.'_'.sha1($i).'_rec.mp3';
while(file_exists($root.$aud_name))
{ $i++; $aud_name = $directory.$new_note->Student.'_'.sha1($i).'_rec.mp3'; }

if(!move_uploaded_file($audio, $root.$aud_name)){
	_log('Uploading audio failed!');
}
else { $new_note->Voice = $aud_name; }


//Insert a row in the database
$q = $db->prepare('INSERT INTO notes(Time, Picture, Voice, Title, Student, Private) 
VALUES(:time, :picture, :voice, :title, :student, :private)');
$result = $q->execute(array(
			'time' => $new_note->Time,
			'picture' => $new_note->Picture,
			'voice' => $new_note->Voice,
			'title' => $new_note->Title,
			'student' => $new_note->Student,
			'private' => $new_note->Private));

if($result) {_log('Database row inserted successfully'); }
else { 
	_log('Inserting database row failed!'); 
	$e = $db->errorInfo();
	_log($e[2]); 
}

//Get the ID
$new_note->ID = $db->lastInsertId();

if($new_note->Private == 'no') 
	$new_note->Thumb = $new_note->Picture;
else
	$new_note->Thumb = 'images/private.png';

//Return encoded results to javascript
echo json_encode($new_note);

fclose($log);

function CreateDirectoryIfNotExist($path) {
	if (!file_exists($path)) 
		mkdir($path);
}
?>
