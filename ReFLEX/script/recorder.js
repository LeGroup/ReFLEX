// **********************************
// Team recorder UI Reflex
$(function() {
	UIChangeState('video-off');
	$('#record-button-onvideo > img').mousedown(RECORDER.prepare_recorder);
	$('#save-recorded-video').draggable({ helper: 'clone', start: dragStarted, stop: dragStopped, zIndex: 9999 });
	$('#note-drag-area').droppable({ startDrag: dragStarted, drop: noteDropped });
});

var RecorderNote;

function dragStarted() { $('#note-drag-area').css('zIndex', 1); }
function dragStopped() { $('#note-drag-area').css('zIndex', -1); }

function noteDropped(event, ui) {
	
	if(ui.draggable.hasClass('note') || ui.draggable.hasClass('save-recorded-video'))
	{
		RECORDER.save_note();
	}
}

function UIChangeState(state) {
	$('.recorder-ui').hide(); 
	$('.' + state).show();	
	debug('UI state changed to "'+state+'"');
}

// **********************************
// Team recorder 
RECORDER = { on:false, vumeter_values:[] }

RECORDER.prepare_recorder=function() {
	if (!RECORDER.getRecorder()) {
        swfobject.embedSWF('recorder/TeamRecorder4.swf', 'TeamRecorder', '420', '280', '10.3.0', 'expressInstall.swf', {},{},{});
    }
	
    debug('record mode on');
	
	var i = 0;
	$('#vumeters > div').each(function() {
		$(this).css('left', ($(this).width() + 3) * i);
		i++;
    });
	
	UIChangeState('recorder-initialized');
	
	$('#record-button-onvideo > img').mouseenter(function() { $(this).stop().animate({ opacity: '0.95' }, 500); }).mouseleave(function () {$(this).stop().animate({ opacity: '0.5' }, 500); }).click(RECORDER.start_recording);
	$('#note_viewer').hide();
    $('#note_photo').hide();
    $('#note_recorder').show();
}


RECORDER.getRecorder=function() {
    var rec=swfobject.getObjectById('TeamRecorder');
    if (rec && rec.initCamera !== undefined) {
        debug('Found recorder');
        return rec;
    } else {
        debug('no recorder available');
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

RECORDER.cameraAccepted=function() {
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
		UIChangeState('record-on');
        $('#recorder_toggle').css('border-color', 'transparent').hide();
        $('#rec_indicator').removeClass('green').addClass('red');
        $('#stop_button').removeClass('green').addClass('red');
        $('#progress_line').show().width(0);
        $('#countdown').text("3").show();
        $('#stop_button').click(RECORDER.stop_recording);         
    }
}
var note_length = 2000;
RECORDER.recording_timer = function(t) {
    // every 10th second, max 600 
	$('#timeline-active').width(((t * 10000)/note_length) + "%");

    var seconds;
    var t=Math.floor(t/10);
    if (t<10) {
        seconds="0"+t.toString();
    } else {
        seconds=t.toString();
    }
    if (t==20) {
            $("#i18n-what-we-did").removeClass('highlight').next('span.check').fadeIn('slow');
            $("#i18n-what-we-will-do").addClass('highlight');
    } else if (t==40) {
            $("#i18n-what-we-will-do").removeClass('highlight').next('span.check').fadeIn('slow');
            $("#i18n-any-problems").addClass('highlight');
    } else if (t==59) {
            $("#i18n-any-problems").removeClass('highlight').next('span.check').fadeIn('slow');
    }

    $('#timer_text').text("0:"+seconds+" / 1:00");
    if (t>200) {

    } else if (t>400) {

    }
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
    }
}


RECORDER.play = function() {
    var rec = RECORDER.getRecorder();
    if (rec) {
        rec.startPlaying();
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
}


RECORDER.recording_stopped = function() {
    debug('recorder stopped');
	UIChangeState('recorder-encoding');
    $('#rec_indicator').removeClass('red').off('click');
    $('#stop_button').removeClass('red').off('click');
    $('span.check').show();
    $('div.vumeter').hide();
}

RECORDER.cancel_recording = function() {
    RECORDER.on=false;
    debug('canceling recording')
}

RECORDER.encodingComplete= function() {
	UIChangeState('recorder-finished');
	
	//Generate a note object with unique ID
	RecordedNote = { "ID": new Date().getTime() }
	
	$('#re-record-button-onvideo > img').click(RECORDER.start_recording);
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
        rec.saveRecording(SERVER_URL, RecordedNote.ID); 
    }        
}


RECORDER.finishedRecording = function(path) {
    // $('#upload-panel').dialog('close');
    // $('div.recorder_panel').hide();
    debug('Received a record:'+path);
	
	try{ var note = $.parseJSON(path); }
	catch (e) { debug('Parsing JSON failed: \n' + path); }
	note.Position = Math.random();
	AddNote(note);
}

RECORDER.uploadingRecording= function() {
    // debug('Uploading recording...');
    // //$('#upload-panel').dialog('open');
    // var notes=$('#available_recordings');
    // $('#record_note img').show();
    // $('#record_note span').hide();
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