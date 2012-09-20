﻿<?php
require_once('db.php');

// if(!isset($_POST['note_id'])) { _log('Note_id not set.'); die(); }

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

$base='uploads';
$class_id = 'class';
$class_hash= md5($class_id);
$dir1=substr($class_hash, 0,2);

CreateDirectoryIfNotExist($base);
CreateDirectoryIfNotExist($base . '/' . $dir1);
CreateDirectoryIfNotExist($base . '/' . $dir1 . '/' . $class_id);

$directory = $base . '/' . $dir1 . '/' . $class_id . '/';

//Saving photo
$picture = $_FILES['photo']['tmp_name'];
$i = 1;
$pic_name= $directory.$new_note->Student.$i.'_pic.jpg';

while(file_exists($pic_name))
{ $i++; $pic_name = $directory.$new_note->Student.$i.'_pic.jpg'; }

if(!move_uploaded_file($picture, $pic_name))
{ _log('Uploading photo failed!'); }
else
{ $new_note->Picture = $pic_name; }


//Saving audio
$audio = $_FILES['voice']['tmp_name'];
$i = 1;
$aud_name = $directory.$i.'_rec.mp3';
while(file_exists($aud_name))
{ $i++; $aud_name = $directory.$new_note->Student.$i.'_rec.mp3'; }

if(!move_uploaded_file($audio, $aud_name)){
	_log('Uploading audio failed!');
}
else { $new_note->Voice = $aud_name; }


//Insert a row in the database
$q = $db->prepare('INSERT INTO notes(Time, Picture, Voice, Title, Student) VALUES(:time, :picture, :voice, :title, :student)');
$result = $q->execute(array(
			'time' => $new_note->Time,
			'picture' => $new_note->Picture,
			'voice' => $new_note->Voice,
			'title' => $new_note->Title,
			'student' => $new_note->Student));

if($result) {_log('Database row inserted successfully'); }
else { _log('Inserting database row failed!'); _log($db->errorInfo()[2]); }

//Get the ID
$new_note->ID = $db->lastInsertId();

//Return encoded results to javascript
echo json_encode($new_note);

fclose($log);

function CreateDirectoryIfNotExist($path) {
	if (!file_exists($path)) 
		mkdir($path);
}
?>
