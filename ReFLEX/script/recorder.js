// **********************************
// Team recorder UI Reflex
RECORDER = { on:false, vumeter_values:[] }

// UIChangeState function changes the current UI state
// This means hiding UI elements that shouldn't be displayed in the current state
// Technically this means hiding all ui elements except the ones which have the current state as a class
RECORDER.CurrentState;
RECORDER.UiStates = {
	VideoOff: 'video-off',
	RecorderInitialized: 'recorder-initialized',
	Recording: 'record-on',
	Playing: 'note-playing',
	PlaybackFinished: 'note-playback-finished',
	Encoding: 'recorder-encoding',
	Finished: 'recorder-finished',
	NoteSelected: 'note-selected',
	NoteSealed: 'note-sealed'
};

var StatesWhenNoteOptionsAvailable = [RECORDER.UiStates.NoteSelected, RECORDER.UiStates.Playing, RECORDER.UiStates.PlaybackFinished];


$(function() {
	UIChangeState(RECORDER.UiStates.VideoOff);
	RECORDER.prepare_recorder();
	$('#record-video-drag').draggable({ 
	helper: function() { 
		return $('<div class="note"><div></div></div>');
	}, 
	cursorAt: {
		top: 30,
		left: 0
	},
	start: dragStarted, 
	stop: dragStopped, 
	zIndex: 9999 
	}).dblclick(function() {
		RecordedNote.Time = (new Date).getTime(); 
		RECORDER.save_note();
		});
	$('#note-drag-area').droppable({ startDrag: dragStarted, drop: noteDropped });
	$('#timecapsule-wrapper').droppable({ drop: noteDroppedToTimeCapsule });
	$('#play-button-onvideo').click(RECORDER.play);
	$('#stop-button-onvideo').click(RECORDER.stop_playing);
	$('#record-button').click(RECORDER.prepare_recorder);
	
	$('#video-recorder').mouseenter(function() {
		if(RECORDER.CurrentState == RECORDER.UiStates.Playing)
			$('#stop-button-onvideo').stop().animate({opacity: 1.0}, 500);
		}).mouseleave(function() {
		if(RECORDER.CurrentState == RECORDER.UiStates.Playing)
			$('#stop-button-onvideo').stop().animate({opacity: 0.0}, 500);
	});
});

function resizeFix(rec) {
	if(rec) {
		rec.resizeFix();
	}
}

var RecorderNote;

function dragStarted() { $('#note-drag-area').css('zIndex', 1); }
function dragStopped() { $('#note-drag-area').css('zIndex', -1); }

function noteDropped(event, ui) {
	
	if(ui.draggable.hasClass('save-recorded-video'))
	{
		if(are_notes_draggable) {
			RecordedNote.Time = Notebar.GetTime(ui.offset.left);
		}
		else
			RecordedNote.Time = (new Date()).getTime();
		RECORDER.save_note();
	}
}

function noteDroppedToTimeCapsule(e, ui) {
	if(ui.draggable.hasClass('save-recorded-video')) {
		debug('Time capsule initialized');
	}
}

function UIChangeState(state) {
	if(state == RECORDER.UiStates.PlaybackFinished || state == RECORDER.UiStates.NoteSelected)
		$('#timeline-cursor').draggable('enable');
	else
		$('#timeline-cursor').draggable('disable');
	debug('Changing from ' + RECORDER.CurrentState + ' to ' + state);
	
	if($.inArray(state, StatesWhenNoteOptionsAvailable) >= 0) 
		$('#note-options').show(200);
	else 
		$('#note-options').hide(50);
	
	
	// Cancel recording if Ui state changed
	// Eg. another note has been selected
	if(RECORDER.CurrentState == RECORDER.UiStates.Recording && state != RECORDER.UiStates.Recording) 
		RECORDER.cancel_recording();
	
	if(false && RECORDER.CurrentState == RECORDER.UiStates.Playing && state != RECORDER.UiStates.Playing) {
		RECORDER.CurrentState = state;
		RECORDER.stop_playing();
	}
	
	RECORDER.CurrentState = state;
	$('.recorder-ui').stop().animate({ opacity: 0.0 }, 300, function() { $(this).hide(); }); 
	$('.' + state).stop().show(0, function() { $(this).animate({ opacity: 1.0 }, 300) }); 	
	resizeFix(RECORDER.getRecorder());
}

// **********************************
// Team recorder 

RECORDER.prepare_recorder=function() {
	$('#record-button-onvideo > img').hide();
	if (!RECORDER.getRecorder()) {
        swfobject.embedSWF('recorder/TeamRecorder4.swf', 'TeamRecorder', '100%', '100%', '10.3.0', 'expressInstall.swf', {},{ scale: 'exactfit', wmode: 'transparent' },{});
    }
	
    debug('record mode on');
	
	var i = 0;
	$('#vumeters > div').each(function() {
		$(this).css('left', ($(this).width() + 3) * i);
		i++;
    });
	
	UIChangeState(RECORDER.UiStates.RecorderInitialized);
	
	$('#record-button-onvideo > img').show().mouseenter(function() { $(this).stop().animate({ opacity: '0.95' }, 500); }).mouseleave(function () {$(this).stop().animate({ opacity: '0.5' }, 500); }).click(RECORDER.start_recording);
	$('#note_viewer').hide();
    $('#note_photo').hide();
    $('#note_recorder').show();
}


RECORDER.getRecorder=function() {
    var rec=swfobject.getObjectById('TeamRecorder');
    if (rec && rec.initCamera !== undefined) {
        // debug('Found recorder');
		resizeFix(rec);
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
	$('#record-button-onvideo > img').show();
        $('#recorder_toggle').show().css('border-color', '#33aa33').off('click').click(RECORDER.start_recording);
        debug('camera accepted');
}
RECORDER.cameraDenied=function() {
    debug('camera denied');
}

RECORDER.start_recording = function() {
    var rec = RECORDER.getRecorder(); 
    if (rec) {
        rec.startRecording();
		UIChangeState(RECORDER.UiStates.Recording);
        $('#recorder_toggle').css('border-color', 'transparent').hide();
        $('#rec_indicator').removeClass('green').addClass('red');
        $('#stop_button').removeClass('green').addClass('red');
        $('#progress_line').show().width(0);
        $('#countdown').text("3").show();
        $('#stop_button').click(RECORDER.stop_recording);         
    }
}
var note_length = 10000;
RECORDER.recording_timer = function(t) {
    // every 10th second, max 600 
	$('#timeline-active').width(((t * 10000)/note_length) + "%");
	$('#timeline-cursor').css('left', Clamp((t * 10000)/note_length, 0, 97.442143727162) + "%");

}

RECORDER.countdown = function(t) {
    if (t==0) {
        $('#countdown').hide();
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

RECORDER.redo_recording = function() {
    var rec = RECORDER.getRecorder(); 
    if (rec) {
		UIChangeState(RECORDER.UiStates.Recording);
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
	rec = RECORDER.getRecorder();
	if(rec) { rec.cancelRecording(); }
    debug('canceling recording')
}

RECORDER.encodingComplete= function() {
	UIChangeState(RECORDER.UiStates.Finished);
	
	//Generate a note object with unique ID
	RecordedNote = { "Title": $('#recorder-title').text() }
	$('#record-video-drag').draggable('enable');
	$('#re-record-button-onvideo > img').click(RECORDER.redo_recording);
}

RECORDER.audioLevel=function(level) {
    //RECORDER.vumeter.height(level*3);
	var count = $('#vumeters > div').length;
	level = Math.min(level/30, 1);
	RECORDER.vumeter_values.splice(0, 0, 3 + level* 50);
	
	if(RECORDER.vumeter_values.length > count)
		RECORDER.vumeter_values.splice(count, RECORDER.vumeter_values.length - count);
	
	var i = 0;
	$('#vumeters > div').each(function() {
		$(this).height(RECORDER.vumeter_values[i]);
		i++;
    });

}

RECORDER.save_note= function() {
    var rec = RECORDER.getRecorder();
	
    debug('Trying to save a note');
	
	if(!Is_note_new(RecordedNote)) { 
		debug('Note already added!');
		return;
	}
	
	debug('Using upload path: ' + SERVER_URL);
    if (rec) {
        rec.saveRecording(SERVER_URL, RecordedNote.Title, UserId, RecordedNote.Time); 
    }        
}


RECORDER.finishedRecording = function(path) {
    // $('#upload-panel').dialog('close');
    // $('div.recorder_panel').hide();
    debug('Received a record:'+path);
	
	$('#record-video-drag').draggable('disable');
	
	try{ var note = $.parseJSON(path); }
	catch (e) { debug('Parsing JSON failed: \n' + path); }
	note.Private =  note.Private == 'yes';
	AddNote(note);
	SelectNote(note);
}

RECORDER.uploadingRecording= function() {
    // debug('Uploading recording...');
    // //$('#upload-panel').dialog('open');
    // var notes=$('#available_recordings');
    // $('#record_note img').show();
    // $('#record_note span').hide();
}

RECORDER.loadNote = function(note, pin) {	

	$.post('php/loadMedia.php', { id: note.ID, user: UserId, pin: pin }, function(data) {
		try{ var loadedNote = $.parseJSON(data); }
		catch(e) { debug(data); }
		if(loadedNote.Success) {
			var rec = RECORDER.getRecorder();
			if(rec) {
				rec.loadNote(note.ID, loadedNote.Voice, loadedNote.Picture);
				UIChangeState(RECORDER.UiStates.NoteSelected);
				$('.pincode > div > input').each(function() { $(this).val('').blur(); });
			}
		}
		else
			debug('Media loading failed. PHP responds: \n' + data);
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