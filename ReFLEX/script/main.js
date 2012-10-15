var SERVER_URL = '';
var PHP_LIB = 'http://reflex.aalto.fi/php/';
var UserId;
var SelectedNote;
var Notes = [];
var Wrapper;
var timelinewidth = 0.001;
var noteTimelineLeft = 0;
var zoomDragging;
var Zoom;
var weeksShown = 1.5;
var are_notes_draggable = false;
var localizedStrings;

var ScrollSlider;
var ZoomSlider;
var TimelineSlider;

$(function() { Init(); });

//To enable drag'n drop in mobile devices?
$(document).bind('touchmove', function(e) { e.preventDefault(); }, false);


function Init() {
	
	var t = document.URL;
	SERVER_URL = t.substr(0, t.indexOf('?'));
	
	// Focus moves to the next element automatically
	$('.pincode > div > input').keyup(function() {
		if($(this).val().length == 4) 
			OpenNote(SelectedNote);
	});
	var query = getQueryData(document.URL);
	
	if(query['i']) {
		getJson('login.php', { id: query['i'] }, function(object) {
			if(object.Success)
				InitializeUserInterface(object.ID);
			else
				InitializeRegistrationInterface();
		});
	}
	else
		InitializeRegistrationInterface();
	
	localize();
}
function DisplayRatio(o, ratio) {
	if(ratio)
		o.data('display-ratio', ratio);
	else
		o.data('display-ratio', o.width() / o.height());		
	o.css('height', o.width() / o.data('display-ratio') + "px"); 
	$(window).resize(function() { o.css('height', o.width() / o.data('display-ratio') + "px"); }); 
}

function DisplayRatioByHeight(o, ratio) {
	if(ratio)
		o.data('display-ratio', ratio);
	else
		o.data('display-ratio', o.width() / o.height());		
	o.css('width', o.height() * o.data('display-ratio') + "px"); 
	$(window).resize(function() { o.css('width', o.height() * o.data('display-ratio') + "px"); }); 
}

function LosePlaceholder() {
	if($(this).text() == $(this).data('placeholder'))
	{ $(this).text(''); }
}
function InitializeUserInterface(id) {
	debug('User logged in. Displaying basic user interface.');
	$('#user-page').show();
	UserId = id;
	
	ScrollSlider = $('#note-scroll');
	ZoomSlider = $('#note-zoom');
	TimelineSlider = $('#recorder-controls-timeline');
	DisplayRatioByHeight($('#video-recorder-wrapper'), 177/121);
	DisplayRatio($('#record-button'), 1);
	DisplayRatio($('#recorder-controls-timeline'));
	
	InitRecorder();
	
		$('#prev-week').click(PreviousWeek);
		$('#next-week').click(NextWeek);
		$('#toggle-settings').click(function() { $('#settings').toggle(200); });
		$('#privacy').click(function() { 
			if(SelectedNote.Private)
				MakePublic(SelectedNote); 
			else
				MakePrivate(SelectedNote);
		});
		
		$('#pin-reset').click(ResetPin);
	LoadNotes(); //After loading notes the program initializes notebar, weekblock etc.
	SetColorPalette();
}

function InitializeRegistrationInterface() {
	$('#register-page').show();
	debug('User no logged in. Displaying registration screen.');
	$('#newUserAdd').click(RegisterUser);
}

function SetColorPalette() {
	var i = 0;
	var t = $('#color-palette > li').length;
	var color;
	$('#color-palette > li').each(function() {
		color = 'hsl('+ 360 * i/t + ', 50%, 65%)';
		$(this).css('backgroundColor', color).attr('data-color', color).addClass('button');
		i++;
		
		$(this).click(function() {
			SelectedNote.Color = $(this).attr('data-color');
			UpdateNote(SelectedNote);
		});
	});
}

function ResetPin() {
	getJson('resetPin.php', { id: UserId }, function() {
		alert(i18n('Your pin has been reset. Please check your email.'));
	});
}

function RegisterUser() {
	// if(ValidateUserRegistration()) {
		// getJson('user_registration.php', { Username: $('#newUsername').val(), Email: $('#newUserEmail.val() }, function(object) {
			// $('#newUserAdd').hide();
			// // $('#newUserEmail').hide();
			// if(object.Success) {
				// $('#newUsername').remove();	
				// $('#newUserEmail').remove();
				// $('.register-complete').show(200).html(i18n('Registration was successful. You will now get link to your page by email.')); 
			// }
			// else {
				// debug('User Registration failed: ' + result);
				// $('#newUsername').removeAttr('contentEditable').text(i18n('Registration failed. Please try again or contact the administation.')); 
			// }
		// });
	// }
}

function ValidateUserRegistration() {
	return !($('#newUsername').val() == '' || $('#newUserEmail').val() == '');
}


function InitLayout() {
	
	//Default settings
	$('.slider').slider({
		max: 1,
		min: 0,
		step: 0.001,
		animate: 400,
		range: 'min'
	});
	
	//Specific
	ScrollSlider.slider({
		slide: setScroll,
		stop: setScroll,
	});
	ZoomSlider.slider({
		slide: setZoom,
		stop: setZoom
	});
	TimelineSlider.slider({
		stop: playbackPositionScroll,
		disabled: true
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
	if (ms < 10) {ms = "0"+ms;}
	if (ms < 100) {ms = "0"+ms;}
	console.log(hh + ':' + mm + ':' + ss + '.' + ms + '	' + msg); 
} 

function getScrollbarRatio(id) {
	return Clamp(($(id).position().left) / ($(id).parent().width()), 0, 1);
}

function setZoom() {
	Zoom = ZoomSlider.slider('option', 'value');
	if((1 - Zoom) * Notebar.GetWeekCount() > 8)
		zoomDisplayChange('month', 'day', 'week');
	else if((1 - Zoom) * Notebar.GetWeekCount() > 1.5)
		zoomDisplayChange('week', 'day', 'month');
	else
		zoomDisplayChange('day', 'week', 'month');
		
	$('#note-timeline').css('width', (100 * (1 + Clamp(Zoom * (Notebar.WeekCount - 1) * 10, 0, (Notebar.WeekCount - 1) * 10))) + "%");
	setScroll();
}

function zoomDisplayChange(show, hide1, hide2) {
		$('#' + show + '-blocks').show().stop().animate({opacity: 1.0}, 400);
		$('#' + hide1 + '-blocks').stop().animate({opacity: 0.0}, 400, function() { $(this).hide(); });
		$('#' + hide2 + '-blocks').stop().animate({opacity: 0.0}, 400, function() { $(this).hide(); });
		
		$('#zoom-title-' + show + 's').show().stop().animate({opacity: 1.0}, 400);
		$('#zoom-title-' + hide1 + 's').stop().animate({opacity: 0.0}, 400, function() { $(this).hide(); });
		$('#zoom-title-' + hide2 + 's').stop().animate({opacity: 0.0}, 400, function() { $(this).hide(); });
}

function setScroll() {
	scroll = ScrollSlider.slider('option', 'value');
	$('#note-timeline').css('margin-left', -(scroll * ($('#note-timeline').width() - $('#notes').width())) + "px");
}

function playbackPositionScroll() {
	RECORDER.movePlaybackToPosition(TimelineSlider.slider('option', 'value'));
}


function weekBlockWidths(weekCount) {
	$('#note-timeline').css('width', '100%');
	$('#day-blocks').width((Math.ceil(Notebar.DayCount)/Notebar.DayCount) * 100 + '%');
	$('#day-blocks > div').width((1/$('#day-blocks > div').length * 100) + "%");
	$('#week-blocks').width(Math.ceil(Notebar.WeekCount)/Notebar.WeekCount * 100 + '%');
	$('#week-blocks > div').width((1/$('#week-blocks > div').length * 100) + "%");
	$('#month-blocks').width(Notebar.MonthTime/Notebar.Timespan * 100 + '%');
}

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function dateFormat(date) { date = new Date(date); return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(); }
function monthFormat(date) { return i18n(months[new Date(date).getMonth()]); }
function datetimeFormat(date) { 
	var d = new Date();
	d.setTime(date);
	date = d;
	var mins = date.getMinutes();
	var hours = date.getHours();
	if(mins < 10) { mins = '0' + mins; }
	if(hours < 10) { hours = '0' + hours; }
	return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + hours + ':' + mins; 
}

function weekDay(date) { date = new Date(date); return date.getDay(); }
function daysInMonth(month,year) { return new Date(year, month + 1, 0).getDate(); }
function monthInTime(month, year) { return new Date(year, month + 2, 0).getTime() - new Date(year, month + 1, 0).getTime(); }

function NotebarType (obj) { 
	this.Object = obj;
	this.Timespan = 0; 	
	this.Start = 0; 
	this.End = 0; 
	this.DayCount;
	this.WeekCount;
	this.MonthCount;
	
	this.GetRatio = function (time) {
		var t = time - this.Start;
		return Clamp(t/this.Timespan, 0, 1);
	}
	this.GetTime = function (positionX) {
		return this.Start + this.Timespan * (Clamp((positionX - this.Object.offset().left)/this.Object.width(), 0, 1));
	}
	
	this.GetWeekCount = function() {
		return Math.ceil(Notebar.Timespan / msInWeeks);
	}
	
	this.Reset = function() {
		
		Notebar.Timespan = Notebar.End - Notebar.Start;
		// Now
		$('#now-indicator').css('left', Notebar.GetRatio(new Date().getTime()) * 100 + '%');
		
		var weeks = Notebar.GetWeekCount();
		
		var daysElement = $('#day-blocks');
		var weeksElement = $('#week-blocks');
		var monthsElement = $('#month-blocks');
		daysElement.empty();
		weeksElement.empty();
		monthsElement.empty();
		
		
		// day blocks
		var t = Notebar.Start;
		for(var i = 0; i < weeks; i++) {
			for(var d = 0; d < 7; d++) {
				daysElement.append('<div><span>' + dateFormat(t) + '</span></div>');
				t = nextDay(t);
			}
		}
		// week blocks
		t = Notebar.Start;
		for(var i = 0; i < weeks; i++) {
			weeksElement.append('<div><span>' + dateFormat(t) + '</span></div>');
			t += msInWeeks;
		}
		
		// month blocks
		// this is ridiculous
		t = new Date(Notebar.Start).setDate(1);
		var monthDayOffset = Notebar.Start - t;
		var time = -monthDayOffset;
		var months = 0;
		var dayCount = 0;
		while(time <= Notebar.Timespan) {
			var monthTime = monthInTime(new Date(t).getMonth() - 1, new Date(t).getFullYear());
			dayCount += daysInMonth(new Date(t).getMonth(), new Date(t).getFullYear());
			monthsElement.append('<div data-dayCount="' + daysInMonth(new Date(t).getMonth(), new Date(t).getFullYear()) + '"><span>' + monthFormat(t) + '</span></div>');
			t = nextMonth(t);
			time = nextMonth(time);
			months++;
		}
		Notebar.DayCount = Notebar.GetWeekCount() * 7;
		Notebar.WeekCount = Notebar.GetWeekCount();
		Notebar.MonthCount = months;
		
		var monthTimeStart = new Date(Notebar.Start).getTime();
		var monthTimeEnd = new Date(Notebar.Start).setMonth(new Date(Notebar.Start).getMonth() + months + 1, 0);
		Notebar.MonthTime = monthTimeEnd - monthTimeStart;
		monthsElement.css('marginLeft', -(monthDayOffset/Notebar.Timespan) * 100 + '%');
		
		$('#month-blocks > div').each(function() { $(this).css('width', ($(this).attr('data-dayCount') / dayCount) * 100 + '%'); });
		
		//Setting correct week block widths
		weekBlockWidths(Notebar.WeekCount);
		
		// Self-explanatory
		UpdateAllNotePositions();
	}
}
var Notebar;
var msInWeeks = 1000 * 60 * 60 * 24 * 7;
var msInDay = 1000 * 60 * 60 * 24;
function initNotebar(start, end) {
	Notebar = new NotebarType($('#note-timeline'));
	
	//Time of the first note
	Notebar.Start = new Date();
	Notebar.Start.setTime(start);
	Notebar.Start.setHours(0, 0, 0, 0);
	Notebar.Start.setDate(1);
	Notebar.Start = Notebar.Start.getTime() - msInDay * (Math.abs((Notebar.Start.getDay() + 6) % 7));
	
	//Now
	Notebar.End = new Date();
	Notebar.End.setTime(end);
	Notebar.End.setHours(0, 0, 0, 0);
	Notebar.End = Notebar.End.getTime() + msInDay * 3;
	
	Notebar.Timespan = Notebar.End - Notebar.Start;
	
	var weeks = Math.ceil(Notebar.Timespan / msInWeeks);
	Notebar.End = Notebar.Start + weeks * msInWeeks;
	setTimeout(Notebar.Reset, 1);
}

function MakePrivate(note) {
	note.Private = true;
	note.Thumb = 'images/private.png';
	$('#privacy').text(i18n('Make public'));
	UpdateNote(note);
}

function MakePublic(note) {
	note.Private = false;
	note.Thumb = note.Picture;
	$('#privacy').text(i18n('Make private'));
	UpdateNote(note);
}

function nextDay(t) {
	t = new Date(t);
	return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1).getTime();
}

function nextMonth(t) {
	t = new Date(t);
	return new Date(t.getFullYear(), t.getMonth() + 1, t.getDate()).getTime();
}

function PreviousWeek() {
	var t = new Date(Notebar.Start);
	Notebar.Start = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 7).getTime();
	Notebar.Reset();
}

function NextWeek() {
	var t = new Date(Notebar.Start);
	Notebar.Start = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 7).getTime();
	Notebar.Reset();
}

// function wrapperResize() 
// { $('#wrapper').height($(window).outerHeight()); }
 
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
	}
	else
		debug('Note is already added!');
}

function UpdateAllNotePositions() {
	for(var i = 0; i < Notes.length; i++) {
		UpdateNotePosition(Notes[i]);
	}
}

function UpdateNotePosition(note) {
	note.Object.css('left', Notebar.GetRatio(note.Time) * 100 + '%');
}

var verticalOffset = 0;
function AddNoteElement(note) {
	
	note.Object = $('<div class="note button" style="margin-top: ' + (Math.random() * 2 * verticalOffset - verticalOffset) + 'px; background-color: '+note.Color+'"><div class="single-note-background"><div class="single-note-triangle"></div><img src="' + note.Thumb + '" alt /></div></div>');
	note.Object.attr('title', datetimeFormat(note.Time));
	note.Object.css('left', Notebar.GetRatio(note.Time) * 100 + '%');
	
	
	if(are_notes_draggable) {
		note.Object.draggable({ 
			axis: 'x',
			containment: 'parent',
			snap: '#now-indicator',
			snapMode: 'inner',
			snapTolerance: 15,
			zIndex: 9999,
			start: function() {
				$(this).data('noclick', true);
			},
			stop: function(e, ui) { 
				note.Time = Notebar.GetTime(ui.offset.left);
				note.Object.attr('title', datetimeFormat(note.Time));
				UpdateNote(note);
			}
		});
	}
	note.Object.click(function() { SelectNote(note); });
	$('#note-timeline').append(note.Object);
	DisplayRatioByHeight($(note.Object.find('.single-note-background').get(0)), 420/280);
}

function UpdateNote(note) {
	//JSON.stringify doesn't like the Object property as it's a jquery object.
	//It needs to be temporarily removed before stringification 
	var obj = note.Object;
	note.Object.remove();
	delete note.Object;
	getJson('update.php', { Note: JSON.stringify(note) }, function(object) {
		if(!object.Private)
			note.Thumb = object.Picture;
		AddNoteElement(note);
	});
}

function Is_note_new(note) {
	for(var i = 0; i < Notes.length; i++) {
		if(note.ID == Notes[i].ID) 
			return false;
	}
	return true;
}


function SelectNote(note) {
	//Highlighting
	$('.selected').removeClass('selected');
	note.Object.addClass('selected');
	
	$('#video-recorder').css('borderColor', note.Color);
	
	if(RECORDER.CurrentState == RECORDER.UiStates.Playing)
		RECORDER.stop_playing();
	
	RECORDER.recording_timer(0);
	
	SelectedNote = note;
	debug('Selected a note');
	if(SelectedNote.Private) {
		$('#privacy').val(i18n('Make public'));
		UIChangeState(RECORDER.UiStates.NoteSealed);
	} else {
		$('#privacy').val(i18n('Make private'));
		OpenNote(SelectedNote);
	}
}

function OpenNote(note) {
	var pin = "";
	$('.pincode > div > input').each(function() {
		pin += $(this).val();
	});
	
	RECORDER.loadNote(note, pin);
}

function LoadNotes() {
	debug('Preparing to load notes from user ' + UserId + '.');
	getJson('notes.php', { User: UserId }, function(object) {
		//Notebar need to be initialized before any notes are added
		//However we need to know the date of the first note in order to set notebar's timespan
		var start = new Date();
		var end = new Date();
		
		//If there are notes, set the beginning of the notebar's timespan to the date of the first note.
		if(object.length > 0) {
			start = new Date().getTime() > object[0].Time ? object[0].Time : new Date().getTime();
			end = new Date().getTime() > object[object.length - 1].Time ? new Date().getTime() : object[object.length].Time;
		}
		initNotebar(start, end);
		
		//Add notes
		debug('Found ' + object.length + ' notes.');
		for(var i = 0; i < object.length; i++) {
			
			AddNote({ 
				ID: object[i].ID, 
				Time: object[i].Time, 
				Thumb: object[i].Thumb, 
				Student: object[i].Student, 
				Private: (object[i].Private == 'yes'),
				Color: object[i].Color });
		}
		
		//If there are already notes, select the most recent.
		if(object.length > 0)
			SelectNote(Notes[Notes.length - 1]);
		InitLayout();
	}, false, true);
}

function i18n(str, lang){
    if (!localizedStrings || !str) return str;
	
    var locstr = localizedStrings[str];
    
	if (locstr == null || locstr == "") {
		debug('Localization error: ' + str + ' missing in ' + lang);
        locstr = str;
    }
    return locstr;
}


var URL_VARS = { };
var CONTROLLER = { };
CONTROLLER.getLocale = function() { return null; }
function guess_language(){
    return URL_VARS.locale || CONTROLLER.getLocale() || navigator.language || navigator.userLanguage;
}

function localize(){
    // The idea is that some html-entities are marked for translation (class 'i18n'). The content text of these html-entities (= english text) is used as a key in translation dict (localizedStrings) and it is checked for possible translation available and replaced if available. 
    // This is enough for us, but would not scale for larger program. (Homonyms in english would translate identically for differing purposes.)

    // Ensure language code is in the format aa-AA:
	// var lang = OPTIONS.language.replace(/_/, '-').toLowerCase();
	var lang = guess_language();
	debug('Language: ' + lang);
	
	if (lang.length > 3) {
		lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
	} else if (lang.length == 2) {
	    lang = lang+'-'+lang.toUpperCase();   
	}
	if (lang=='en-EN') return;
    jQuery.ajax("i18n/localized_"+lang+".js", {
        dataType: "json",
        isLocal: true,     
        error: function(jqXHR, textStatus, errorThrown){
            debug('i18n failed:jqXHR='+jqXHR+' textStatus:'+textStatus+' errorThrown:'+errorThrown);
            return jqXHR;
                
        },
        complete: function(data) {
            // Change all of the static strings in index.html
            var place;
            localizedStrings=$.parseJSON(data.responseText);
            debug(''+Object.keys(localizedStrings).length+' translation keys available');
            $('.i18n').each(function (i) {
                $(this).html(i18n($(this).html(), lang));
            })
			
            $('.i18n_title').each(function (i) {
                $(this).attr('title', i18n($(this).attr('title'), lang));
            })
			
            $('.i18n_placeholder').each(function (i) {
                $(this).attr('placeholder', i18n($(this).attr('placeholder'), lang));
            })
			
            $('.i18n_value').each(function (i) {
                $(this).attr('value', i18n($(this).attr('value'), lang));
            })
			
            $('input.topic').each(function () {
            if ($(this).val() == 'Enter topic') { 
                $(this).val(i18n('Enter topic'), lang);
            }
            });
            }
        }           
    );
}

function getQueryData(url) {
	
	url = url.split('?');
	url.splice(0,1);
	
	var vars = url.join().split("&");
	var result = [];
	for(v in vars) {
		vars[v] = vars[v].split("=");
		debug(vars[v][0] + ': ' + vars[v][1]);
		result[vars[v][0]] = vars[v][1];
	}
	return result;
}

function getJson(url, post, finished, onError, dontDebugRespond) {
	$.post(PHP_LIB + url, post, function (data) {
		if(!dontDebugRespond) {
			debug('Requested ' + url + ', PHP responds: ' + data);
		}
		var json;
		try { json = $.parseJSON(data); }
		catch(e) { 
			debug("Couldn't parse Json"); 
			if(onError) onError();
			return; 
		}
		
		finished(json);
	});
}