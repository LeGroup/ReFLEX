$(function() { $('#avatar-image').click(AVA.prepareCamera); });
var AVA = { };
AVA.States = {
	Closed: 'closed',
	Ready: 'ready',
	Countdown: 'countdown',
	Capturing: 'capturing',
	Save: 'save'
}
AVA.State = AVA.States.Closed;

AVA.prepareCamera = function() {
	debug('Preparing camera');
	$('#avatar-image').animate({opacity: 0}, 600);
	swfobject.embedSWF('recorder/AvatarCamera.swf', 'AvatarCamera', '100%', '100%', '10.3.0', 'expressInstall.swf', {}, { wmode: 'transparent' }, {});

}

AVA.action = function () {
	debug(AVA.State);
	switch(AVA.State) {
		case AVA.States.Closed: AVA.prepareCamera(); break;
		case AVA.States.Ready: AVA.startRecording(); break;
	}
}

AVA.recorderInitialized = function() {
	debug('AVA.recorderInitialized');
	AVA.State = AVA.States.Ready;
	AVA.Camera = AVA.getCamera();
	AVA.startRecording = function() {
		$('#avatar-image').animate({opacity: 0}, 200);
		AVA.Camera.startRecording();
	}
	AVA.savePicture = function() { 
		AVA.Camera.savePicture(SERVER_URL, User.ID); 
	}
	AVA.Camera.initCamera();
}
	

AVA.getCamera = function() {
	var rec = swfobject.getObjectById('AvatarCamera');
	if (rec && rec.initCamera !== undefined) {
		debug('Found recorder');
		return rec;
	} else {
		debug('no recorder available');
		return null;
	}
}

AVA.cameraAccepted = function() {
	$('#avatar-image').unbind('click').click(AVA.startRecording);
}

AVA.countdown = function(num) {
	AVA.State = AVA.States.Countdown;
	$('#ava-countdown').show().text(num);
	
	if(num == 0) {  $('#ava-countdown').hide(); }
}

AVA.finishedRecording = function(data) {
	AVA.State = AVA.States.Closed;
	debug('Finished recording, PHP responds: ' + data);
	var d = $.parseJSON(data);
	debug('Finished recording, PHP responds: ' + data);
	$('#ava-save').hide();
	$('#AvatarCameraContainer').html('<div id="AvatarCamera"></div>');
	$('.avatar-image').attr('src', d.Photo + '?'+(new Date().getTime())).animate({opacity: 1.0}, 600).unbind('click').click(AVA.prepareCamera);
}

AVA.tookPhoto = function() {
	AVA.State = AVA.States.Save;
	$('#ava-save').show().click(AVA.savePicture);
}