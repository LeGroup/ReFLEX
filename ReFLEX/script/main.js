var SERVER_URL = 'http://127.0.0.1/reflex/';
var Notes = [];
var Wrapper;
var timelinewidth = 0.001;
var start;
var end;
var noteTimelineLeft = 0;
var zoomDragging;
var Zoom;
var weeksShown = 1.5;
var maxWeeks = 5;

$(function() {
	
	LoadNotes();
	
	start = new Date("September 11, 2012 9:00:00");
	end = new Date("September 11, 2012 17:30:00");
	//end = end.getTime();
	wrapperResize();
	$(window).resize(wrapperResize);
	
	
	initNotebar();
	weekBlockWidths();
	
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
	
	$('#notes').mousemove(function(e, h) {
		if(e.mouseX < 50)
		{ noteTimelineLeft += 4; }
		else if(e.mouseX > $(this).width() - 50)
		{ noteTimelineLeft -= 4; }
		
		$('#note-timeline').css('left', noteTimelineLeft);
	});
	
	setZoom();
});

function debug(msg) { 
	var d = new Date();
	var hh = d.getHours();
	var mm = d.getMinutes();
	var ss = d.getSeconds();
	if (hh < 10) {hh = "0"+hh;}
	if (mm < 10) {mm = "0"+mm;}
	if (ss < 10) {ss = "0"+ss;}
	console.log(hh + ':' + mm + ':' + ss + ' - ' + msg); 
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

function weekBlockWidths() {
	$('#note-timeline').css('width', (maxWeeks * 100) + '%');
	
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

function NotebarType () { 
	this.Timespan = 0; 	
	this.Start = 0; 
	this.End =  0; 
	
	this.GetRatio = function (time) {
		var t = time - this.Start;
		return Clamp(t/this.Timespan, 0, 1);
	}
}
var Notebar;
var msInWeeks = 1000 * 60 * 60 * 24 * 7;
var msInDay = 1000 * 60 * 60 * 24;
function initNotebar() {
	
	Notebar = new NotebarType();
	//Offset of five days
	//Time of the first note
	Notebar.Start = new Date("September 14, 2012 9:00:00");
	Notebar.Start.setHours(0, 0, 0, 0);
	Notebar.Start = Notebar.Start.getTime() - msInDay * (Math.abs((Notebar.Start.getDay() + 6) % 7));
	
	//Now
	Notebar.End = new Date();
	Notebar.End.setHours(0, 0, 0, 0);
	Notebar.End = Notebar.End.getTime() + msInDay * 3;
	
	Notebar.Timespan = Notebar.End - Notebar.Start;
	
	var weeks = Math.ceil(Notebar.Timespan / msInWeeks);
	Notebar.End = Notebar.Start + weeks * msInWeeks;
	Notebar.Timespan = Notebar.End - Notebar.Start;
	
	var t = Notebar.Start;
	
	for(var i = 0; i < weeks; i++)
	{
		for(var d = 0; d < 7; d++)
			$('#week-blocks').append('<div class="week-block">' + (d % 7 == 0 ? '<span>' + dateFormat(t) + '</span>' : '') + '</div>');
		t += msInWeeks;
	}
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
	$('#note-timeline').append(note.Object);
}

function Is_note_new(note) {
	for(var i = 0; i < Notes.length; i++) {
		if(note.ID == Notes[i].ID) 
			return false;
	}
	return true;
}

function SelectNote(note) {
	debug('Selected a note');
	$('#video-player').css('backgroundImage', 'url('+note.Picture+')');
	$('#video-player-ui > audio').attr('src', note.Voice);
}

// noteObject: { Day: 1, Hour: 15, Image: 'images/Desert.jpg', Voice: 'path', Position: (Math.random()), Object: outerHTML }
function LoadNotes() {
	debug('Preparing to load notes.');
	$.post('notes.php', { }, function(data) {
		var noteArray = $.parseJSON(data);
		
		debug('Found ' + noteArray.length + ' notes.');
		for(var i = 0; i < noteArray.length; i++) {
			AddNote({ ID: noteArray[i].ID, Time: noteArray[i].Time, Picture: noteArray[i].Picture, Voice: noteArray[i].Voice });
		}
		SelectNote(Notes[Notes.length - 1]);
	});
}