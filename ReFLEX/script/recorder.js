// **********************************
// Team recorder UI Reflex
RECORDER = { on:false, vumeter_values:[], isCameraAccepted: false, noteLength:  60 * 1000 }

// UIChangeState function changes the current UI state
// This means hiding UI elements that shouldn't be displayed in the current state
// Technically this means hiding all ui elements except the ones which have the current state as a class
RECORDER.CurrentState;
RECORDER.UiStates = {
	VideoOff: 'video-off',
	RecorderInitialized: 'recorder-initialized',
	Recording: 'record-on',
	CountDown: 'countdown',
	Playing: 'note-playing',
	PlaybackFinished: 'note-playback-finished',
	Encoding: 'recorder-encoding',
	Finished: 'recorder-finished',
	NoteSelected: 'note-selected',
	NoteSealed: 'note-sealed',
	CameraPermission: 'camera-permission',
	Uploading: 'uploading',
	NoteTimeSealed: 'note-timesealed',
	Preview: 'record-preview'
};

function InitRecorder() {
	UIChangeState(RECORDER.UiStates.VideoOff);
	RECORDER.prepare_recorder();
	
	
	$('#save-recorded-video').click(function() {
		RecordedNote.Time = (new Date).getTime(); 
		RECORDER.save_note();
		});
	$('#play-button-onvideo').click(RECORDER.play);
	$('#record-button.enabled, #new-recording').click(RECORDER.prepare_recorder);
	
	//Recording timer total time
	var sec = RECORDER.noteLength / 1000;
	var min = Math.floor(sec / 60);
	sec = sec % 60;
	$('#record-timer > .total').text(min + ':' + zeronify(sec));
	
	$('#play-pause-button').click(function() {
		if($(this).hasClass('play-button')) { RECORDER.play(); }
		else if($(this).hasClass('pause-button')) { 
		if(RECORDER.CurrentState == RECORDER.UiStates.Playing)
			RECORDER.stop_playing(); 
		else if(RECORDER.CurrentState == RECORDER.UiStates.Preview)
			RECORDER.stop_preview();
		}
		else if($(this).hasClass('preview-button')) { RECORDER.preview(); }
	});
	
	$('#record-button').click(function() {
		if($(this).hasClass('recording')) { RECORDER.stop_recording(); }
		else if($(this).hasClass('enabled')) { RECORDER.start_recording(); }
	});
}

function UIChangeState(state) {
	debug('Changing from ' + RECORDER.CurrentState + ' to ' + state);
	
	//Timeline enabled or disabled
	if(TimelineSlider.hasClass('ui-slider')) {
		if(state == RECORDER.UiStates.PlaybackFinished || state == RECORDER.UiStates.NoteSelected)
			TimelineSlider.slider('enable');
		else
			TimelineSlider.slider('disable');
	}
	
	//Stop playback when opening another note or changing interface somehow
	if(RECORDER.CurrentState == RECORDER.UiStates.Playing && state != RECORDER.UiStates.Playing && state != RECORDER.UiStates.PlaybackFinished)
		RECORDER.stop_playing();
	
	//Stop preview when opening another note or changing interface somehow
	if(RECORDER.CurrentState == RECORDER.UiStates.Preview && state != RECORDER.UiStates.Preview)
		RECORDER.stop_preview();
		
	// Cancel recording if Ui state changed
	// Eg. another note has been selected
	if(RECORDER.CurrentState == RECORDER.UiStates.Recording && state != RECORDER.UiStates.Recording) 
		RECORDER.cancel_recording();
	
	// <('-' <)
	if(RECORDER.CurrentState == RECORDER.UiStates.Countdown && state != RECORDER.UiStates.Countdown) 
		RECORDER.cancel_recording();
		
	//Play/pause button display
	if(state == RECORDER.UiStates.Playing || state == RECORDER.UiStates.Preview) 
		$('#play-pause-button').addClass('pause-button').removeClass('play-button preview-button');
	else if($.inArray(state, [ RECORDER.UiStates.PlaybackFinished, RECORDER.UiStates.NoteSelected ]) >= 0)
		$('#play-pause-button').addClass('play-button').removeClass('pause-button preview-button');
	else if(state == RECORDER.UiStates.Finished)
		$('#play-pause-button').addClass('preview-button').removeClass('pause-button play-button');
	else
		$('#play-pause-button').removeClass('play-button pause-button preview-button');
		
	//Record button display	
	if(state == RECORDER.UiStates.Recording)
		$('#record-button').addClass('recording').removeClass('enabled');
	else if($.inArray(state, [ RECORDER.UiStates.RecorderInitialized, RECORDER.UiStates.Finished ]) >= 0)
		$('#record-button').removeClass('recording').addClass('enabled');
	else
		$('#record-button').removeClass('recording enabled');
	
	//Change the state
	RECORDER.CurrentState = state;
	
	//Handle video UI elements
	$('.recorder-ui').stop().animate({ opacity: 0.0 }, 300, function() { $(this).hide(); }); 
	$('.' + state).stop().show(0, function() { $(this).animate({ opacity: 1.0 }, 300) }); 	
}

RECORDER.prepare_recorder=function() {
	if (!RECORDER.getRecorder()) {
		
		var flashvars = {
			noteLength: RECORDER.noteLength
		}
		
		var params = { 
			scale: 'exactfit', 
			wmode: 'transparent' 
		}
		
		var attributes = { 
			noteLength: RECORDER.noteLength
		}
		
        swfobject.embedSWF('recorder/NoteRecorder.swf', 'NoteRecorder', '100%', '100%', '10.3.0', 'expressInstall.swf', flashvars, params, attributes);
    }
	
    debug('record mode on');
	
	var i = 0;
	$('#vumeters > div').each(function() {
		$(this).css('left', ($(this).width() + 1) * i);
		i++;
    });
	if(RECORDER.isCameraAccepted)
		UIChangeState(RECORDER.UiStates.RecorderInitialized);
	else
		UIChangeState(RECORDER.UiStates.CameraPermission);
		
	$('#note_viewer').hide();
    $('#note_photo').hide();
    $('#note_recorder').show();
}


RECORDER.getRecorder=function() {
    var rec = swfobject.getObjectById('NoteRecorder');
    if (rec && rec.initCamera !== undefined) {
        // debug('Found recorder');
        return rec;
    } else {
        // debug('no recorder available');
        return null;
    }
}

RECORDER.initialized=function() {
    // recorder has loaded and its actionscript is reachable
    rec=RECORDER.getRecorder();
    if (rec) {
        debug('ping received from recorder');
        rec.initCamera();
        rec.initMic();
        $('#recorder_toggle').hide();
    }
}

RECORDER.movePlaybackToPosition = function(t) {
	var rec = RECORDER.getRecorder();
	if(rec) {
		rec.movePlaybackToPosition(t);
	}
}

RECORDER.cameraAccepted=function() {
	RECORDER.isCameraAccepted = true;
	
	if(RECORDER.CurrentState == RECORDER.UiStates.CameraPermission)
	{ UIChangeState(RECORDER.UiStates.RecorderInitialized); }
		
	debug('camera accepted');
	$('#record-button-onvideo > img').click(RECORDER.start_recording);
}
RECORDER.cameraDenied=function() {
    debug('camera denied');
}

RECORDER.start_recording = function() {
    var rec = RECORDER.getRecorder(); 
    if (rec) {
        rec.startRecording();
		UIChangeState(RECORDER.UiStates.CountDown);
        $('#recorder_toggle').css('border-color', 'transparent').hide();
        $('#rec_indicator').removeClass('green').addClass('red');
        $('#stop_button').removeClass('green').addClass('red');
        $('#progress_line').show().width(0);
        $('#countdown').text("3").show();         
    }
}
RECORDER.recording_timer = function(t, total) {
	// t is every 10th of a second
	// total is milliseconds
	// because it makes sense
	t = parseFloat(t);
	total = parseFloat(total);
	
	if(t > total)
		t = total;
	
	if(!total)
		total = SelectedNote.Length;
		
	//Recording timer total time
	var tSec = Math.floor(total / 1000);
	var tMin = Math.floor(tSec / 60);
	tSec = tSec % 60;
	$('#record-timer > .total').text(tMin + ':' + zeronify(tSec));
	
	//Elapsed time
	var sec = Math.floor(t / 10);
	var min = Math.floor(sec / 60);
	sec = sec % 60;
	$('#record-timer > .elapsed').text(min + ':' + zeronify(sec));
	
	if(TimelineSlider.hasClass('ui-slider'))
		TimelineSlider.slider('option', 'value', (t * 100)/(total - 1000));
}

RECORDER.countdown = function(t) {
    if (t==0) {
		$('#record-button').addClass('recording');
        $('#countdown').hide();
		UIChangeState(RECORDER.UiStates.Recording);
    } else {       
        $('#countdown').text(t).show();
    }
}   

RECORDER.stop_recording = function() {
    var rec = RECORDER.getRecorder(); 
    if (rec) {
        rec.stopRecording();
		RECORDER.movePlaybackToPosition(0);
    }
}

RECORDER.preview = function() {
    var rec = RECORDER.getRecorder(); 
    if (rec) {
		UIChangeState(RECORDER.UiStates.Preview);
        rec.preview();
    }
}

RECORDER.stop_preview = function() {
    var rec = RECORDER.getRecorder(); 
    if (rec) {
        rec.stop_preview();
    }
}

RECORDER.preview_ended = function() {
	UIChangeState(RECORDER.UiStates.Finished);
}

RECORDER.redo_recording = function() {
    var rec = RECORDER.getRecorder(); 
    if (rec) {
		UIChangeState(RECORDER.UiStates.CountDown);
        rec.redoRecording();
    }
}


RECORDER.play = function() {
    var rec = RECORDER.getRecorder();
    if (rec) {
        rec.startPlaying();
		UIChangeState(RECORDER.UiStates.Playing);
        $('#stop_button').click(RECORDER.stop_playing);
    }
}

RECORDER.stop_playing = function() {
    var rec = RECORDER.getRecorder();
    if (rec) {
        rec.stopPlaying();
		RECORDER.recording_timer(0, RECORDER.noteLength);
    }
}

RECORDER.stopped_playing = function() {
    $('#stop_button').click(RECORDER.play);
	UIChangeState(RECORDER.UiStates.PlaybackFinished);
}


RECORDER.recording_stopped = function() {
    debug('recorder stopped');
	UIChangeState(RECORDER.UiStates.Encoding);
    $('#rec_indicator').removeClass('red').off('click');
    $('#stop_button').removeClass('red').off('click');
    $('span.check').show();
    $('div.vumeter').hide();
}

RECORDER.cancel_recording = function() {
    debug('canceling recording')
	rec = RECORDER.getRecorder();
	if(rec) { rec.cancelRecording(); }
}

RECORDER.encodingComplete= function() {
	UIChangeState(RECORDER.UiStates.Finished);
	
	//Generate a note object with unique ID
	RecordedNote = { "Title": $('#recorder-title').text() }
	$('#re-record-button-onvideo > img').click(RECORDER.redo_recording);
}
var alpha = 0;
RECORDER.audioLevel=function(level) {
    //RECORDER.vumeter.height(level*3);
	var count = $('#vumeters > div').length;
	level = Math.min(level/50, 1);
	RECORDER.vumeter_values.splice(0, 0, 1 + level* 40);
	
	if(RECORDER.vumeter_values.length > count)
		RECORDER.vumeter_values.splice(count, RECORDER.vumeter_values.length - count);

	var i = 0;
	$('#vumeters > div').each(function() {
		$(this).height(RECORDER.vumeter_values[i]).css('opacity', 1 - i/RECORDER.vumeter_values.length);
		i++;
    });

}

RECORDER.save_note= function() {
	UIChangeState(RECORDER.UiStates.Uploading);
    var rec = RECORDER.getRecorder();
	
    debug('Trying to save a note');
	
	if(!Is_note_new(RecordedNote)) { 
		debug('Note already added!');
		return;
	}
	
	debug('Using upload path: ' + SERVER_URL);
    if (rec) {
        rec.saveRecording(SERVER_URL, User.ID, RecordedNote.Time, User.Email, User.Pin); 
    }        
}


RECORDER.finishedRecording = function(path) {
    // $('#upload-panel').dialog('close');
    // $('div.recorder_panel').hide();
    debug('Received a record:'+path);
	
	
	try{ var note = $.parseJSON(path); }
	catch (e) { debug('Parsing JSON failed: \n' + path); }
	
	AddNote(note);
	SelectNote(note);
}

RECORDER.uploadingRecording= function() {
}

RECORDER.loadNote = function(note, pin) {	

	getJson('loadMedia.php', { id: note.ID, user: User.ID, pin: pin }, function(data) {
		if(data.Success) {
			SelectedNote = note;
			var rec = RECORDER.getRecorder();
			if(rec) {
				
				if(data.Voice)
					rec.loadNote(note.ID, data.Voice, data.Picture, SERVER_URL);
				else
					rec.loadPic(note.ID, data.Picture, SERVER_URL);
					
				if(!data.Voice) {
					UIChangeState(RECORDER.UiStates.NoteTimeSealed);
					
					var t = SelectedNote.Time - new Date().getTime();
			
					if(Math.ceil(t / msInDay) > 1)
						$('#timecapsule-date').text(i18n('opens in') + ' ' + Math.ceil(t / msInDay) + ' ' + i18n('days'));
					else if(Math.ceil(t / msInDay) == 1)
						$('#timecapsule-date').text(i18n('opens tomorrow'));
				}
				else
					UIChangeState(RECORDER.UiStates.NoteSelected);
				
				$('.pincode > div > input').each(function() { $(this).val('').blur(); });
			}
		}
		else
			debug('Media loading failed. PHP responds: \n' + data.Message);
	});

} 

// redirect Flash ExternalInterface calls: 
recorderInitialized=RECORDER.initialized;
recording_stopped=RECORDER.recording_stopped; 
uploadingRecording=RECORDER.uploadingRecording;
finishedRecording=RECORDER.finishedRecording;
encodingComplete=RECORDER.encodingComplete;
audioLevel=RECORDER.audioLevel;
recording_timer=RECORDER.recording_timer;
countdown=RECORDER.countdown;
cameraAccepted=RECORDER.cameraAccepted;
cameraDenied=RECORDER.cameraDenied;
stopped_playing=RECORDER.stopped_playing;
preview_ended = RECORDER.preview_ended;