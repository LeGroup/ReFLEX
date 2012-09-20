var SERVER_URL = 'http://127.0.0.1/ReFLEX/';
var UserId;
var SelectedNote;
var Notes = [];
var Wrapper;
var timelinewidth = 0.001;
var noteTimelineLeft = 0;
var zoomDragging;
var Zoom;
var weeksShown = 1.5;
var maxWeeks = 5;
var are_notes_draggable = true;

$(function() { Init(); });

function Init() {
	UserId = $('#user-data').data('id');
	
	if(typeof UserId != 'undefined') {
		debug('User logged in. Displaying basic user interface.');
		InitializeUserInterface();
	}
	else {
		debug('User no logged in. Displaying registration screen.');
		$('#newUsername').focus(LosePlaceholder).blur(SetPlaceholder);
		$('#newUserEmail').focus(LosePlaceholder).blur(SetPlaceholder);
		$('#newUserAdd').click(RegisterUser);
	}
}

function SetPlaceholder() {
	if($(this).text() == '')
	{ $(this).text($(this).data('placeholder')); }
}
function LosePlaceholder() {
	if($(this).text() == $(this).data('placeholder'))
	{ $(this).text(''); }
}
function InitializeUserInterface() {
	LoadNotes(); //After loading notes the program initializes notebar, weekblock etc.
}

function RegisterUser() {
	if(ValidateUserRegistration()) {
		$.post('user_registration.php', { Username: $('#newUsername').text(), Email: $('#newUserEmail').text() }, function(result) { 
			debug('PHP respond from user registration: ' + result);
			var value = $.parseJSON(result);
			$('#newUserAdd').hide();
			// $('#newUserEmail').hide();
			if(value.Success) {
				$('#newUsername').removeAttr('contentEditable').text('Registration was successful. You will now get an email with link to your page.'); 
				$('#newUserEmail').removeAttr('contentEditable').text("Actually you won't and the link is here: " + value.Uri); 
			}
			else {
				debug('User Registration failed: ' + result);
				$('#newUsername').removeAttr('contentEditable').text('Registration failed. Please try again or contact the administation'); 
			}
		});
	}
}

function ValidateUserRegistration() {
	return !($('#newUsername').text() == '' || $('#newUsername') == 'Your username' || $('#newUserEmail').text() == '' || $('#newUserEmail').text() == 'Your email address');
}


function InitLayout() {
	//end = end.getTime();
	wrapperResize();
	$(window).resize(wrapperResize);
	
	
	$('#note-zoom-cursor').draggable({
		axis: 'x',
		containment: 'parent',
		drag: setZoom,
	});
	$('#note-scroll-cursor').draggable({
		axis: 'x',
		containment: 'parent',
		drag: setScroll,
	});
	
	
	setZoom();
}

function debug(msg) { 
	var d = new Date();
	var hh = d.getHours();
	var mm = d.getMinutes();
	var ss = d.getSeconds();
	var ms = d.getMilliseconds();
	if (hh < 10) {hh = "0"+hh;}
	if (mm < 10) {mm = "0"+mm;}
	if (ss < 10) {ss = "0"+ss;}
	console.log(hh + ':' + mm + ':' + ss + '.' + ms + '	- ' + msg); 
} 

function setZoom() {
	Zoom = Clamp(($('#note-zoom-cursor').position().left - 30) / ($('#note-zoom-cursor').parent().width() - 17), 0, 1);
	$('#note-timeline').css('width', (100 * Clamp(Zoom * maxWeeks, 1, maxWeeks)) + "%");
	weekShown = Zoom * 5;
	setScroll();
}

function setScroll() {
	var scroll;
	scroll = Clamp(($('#note-scroll-cursor').position().left - 30) / ($('#note-scroll-cursor').parent().width()), 0, 1);
	
	$('#note-timeline').css('margin-left', -(scroll * ($('#note-timeline').width() - $('#notes').width())) + "px");
	
}

function weekBlockWidths(weekCount) {
	$('#note-timeline').css('width', (weekCount * 100) + '%');
	
	$('#week-blocks > .week-block').each(function() {
		$(this).width((1/$('#week-blocks > .week-block').length * 100) + "%");
	});
}

function dateFormat(date) { date = new Date(date); return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(); }
function datetimeFormat(date) { 
	var d = new Date();
	d.setTime(date);
	date = d;
	return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(); 
}
function weekDay(date) { date = new Date(date); return date.getDay(); }

function NotebarType (obj) { 
	this.Object = obj;
	this.Timespan = 0; 	
	this.Start = 0; 
	this.End =  0; 
	
	this.GetRatio = function (time) {
		var t = time - this.Start;
		return Clamp(t/this.Timespan, 0, 1);
	}
	this.GetTime = function (positionX) {
		return this.Start + this.Timespan * Clamp((positionX - this.Object.position().left)/this.Object.width(), 0, 1);
	}
}
var Notebar;
var msInWeeks = 1000 * 60 * 60 * 24 * 7;
var msInDay = 1000 * 60 * 60 * 24;
function initNotebar(start, end) {
	
	
	Notebar = new NotebarType($('#note-timeline'));
	//Offset of five days
	//Time of the first note
	Notebar.Start = new Date();
	Notebar.Start.setTime(start);
	Notebar.Start.setHours(0, 0, 0, 0);
	Notebar.Start = Notebar.Start.getTime() - msInDay * (Math.abs((Notebar.Start.getDay() + 6) % 7));
	
	//Now
	Notebar.End = new Date();
	Notebar.End.setTime(end);
	Notebar.End.setHours(0, 0, 0, 0);
	Notebar.End = Notebar.End.getTime() + msInDay * 3;
	
	Notebar.Timespan = Notebar.End - Notebar.Start;
	
	var weeks = Math.ceil(Notebar.Timespan / msInWeeks);
	Notebar.End = Notebar.Start + weeks * msInWeeks;
	Notebar.Timespan = Notebar.End - Notebar.Start;
	
	var t = Notebar.Start;
	
	debug('Weeks: ' + weeks);
	for(var i = 0; i < weeks; i++)
	{
		for(var d = 0; d < 7; d++)
			$('#week-blocks').append('<div class="week-block">' + (d % 7 == 0 ? '<span>' + dateFormat(t) + '</span>' : '') + '</div>');
		t += msInWeeks;
	}
	weekBlockWidths();
}


function wrapperResize() 
{ $('#wrapper').height($(window).outerHeight()); }
 
function Clamp(val, min, max)
{ return Math.max(min, Math.min(val, max)); }

// noteObject: { Day: 1, Hour: 15, Image: 'images/Desert.jpg', Voice: 'path', Position: (Math.random()), Object: outerHTML }
// Missing: some link to the recording for opening the video
// Day and hour need to be saved as a date
function AddNote(note) {
	//Check if note is already added
	if(Is_note_new(note))
	{
		AddNoteElement(note);
		Notes.push(note);
		debug('Added a note. Notes.length = ' + Notes.length);
		//debug(typeof(JSON.stringify(note)));
	}
	else
		debug('Note is already added!');
}

function AddNoteElement(note) {
	note.Object = $('<div class="note button"><img src="' + note.Picture + '" alt /></div>');
	note.Object.attr('title', datetimeFormat(note.Time));
	note.Object.css('left', Notebar.GetRatio(note.Time) * 100 + '%');
	note.Object.click(function() { SelectNote(note); });
	if(are_notes_draggable) {
		note.Object.draggable({ 
			containment: 'parent',
			zIndex: 9999,
			stop: function(e, ui) { 
				note.Time = Notebar.GetTime(ui.offset.left);
				UpdateNote(note);
			}
		});
	}
	$('#note-timeline').append(note.Object);
}

function UpdateNote(note) {
	//JSON.stringify doesn't like the Object property as it's a jquery object.
	//It needs to be removed before stringification then/However we need to keep it for other features to use
	var noteToSave = note;
	delete noteToSave.Object;
	$.post('update.php', { Note: JSON.stringify(note) });
}

function Is_note_new(note) {
	for(var i = 0; i < Notes.length; i++) {
		if(note.ID == Notes[i].ID) 
			return false;
	}
	return true;
}


function SelectNote(note) {
	SelectedNote = note;
	debug('Selected a note');
	$('#video-player').css('backgroundImage', 'url('+note.Picture+')');
	$('#video-player-ui > audio').attr('src', note.Voice);
	$('#player-title').text(note.Title).unbind('blur').blur(function() { TestNewTitle(note); });
}

function TestNewTitle(note) {
	debug('Updating title...');
	if(note.Title != $('#player-title').text())
		SaveTitle(note);
	else
		debug('New title and old title are same. No need for updating.');
}

function SaveTitle(note) {
	$.post('title_save.php', { ID: note.ID, Title: $('#player-title').text() }, function (data) { 
			debug('PHP respond on updating title: ' + data);
			note.Title = $('#player-title').text();
		});
}

// noteObject: { Day: 1, Hour: 15, Image: 'images/Desert.jpg', Voice: 'path', Position: (Math.random()), Object: outerHTML }
function LoadNotes() {
	debug('Preparing to load notes from user ' + UserId + '.');
	$.post('notes.php', { User: UserId }, function(data) {
		var noteArray = $.parseJSON(data);
		debug('Notes loaded.');
		//Notebar need to be initialized before any notes are added
		//However we need to know the date of the first note in order to set notebar's timespan
		var start = new Date();
		
		//If there are notes, set the beginning of the notebar's timespan to the date of the first note.
		if(noteArray.length > 0)
			start.setTime(noteArray[0].Time);
			
		initNotebar(start, new Date());
		
		//Add notes
		debug('Found ' + noteArray.length + ' notes.');
		for(var i = 0; i < noteArray.length; i++) {
			AddNote({ ID: noteArray[i].ID, Time: noteArray[i].Time, Picture: noteArray[i].Picture, Voice: noteArray[i].Voice, Title: noteArray[i].Title, Student: noteArray[i].Student });
		}
		
		//If there are already notes, select the most recent.
		if(noteArray.length > 0)
			SelectNote(Notes[Notes.length - 1]);
		InitLayout();
	});
}