var SlackBot = require('slackbots');

var events = {}

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.lastIndexOf(str, 0) === 0;
  };
}

// create a bot
var bot = new SlackBot({
    token: 'xoxb-7985790579-QYjz0fU2DN2H5YFs7qgPhM28', // Add a bot https://my.slack.com/services/new/bot and put the token 
    name: 'CatBot'
});

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        icon_emoji: ':cat:'
    };

    bot.postMessageToChannel('bottest', 'meow!', params);
});

bot.on('message', function(data) {
    var params = {
        icon_emoji: ':cat:'
    };

    //console.log(data);

	if (data.type === 'message' && data.subtype != 'bot_message') {
		var args = data.text.trim().toLowerCase().split(' ');
		var userId = data.user;

		if (args[0] === 'catbot') {
			var message;
			var eventTitle = args[2];
			switch (args[1]) {

				case "show":
					if (eventTitle && events[eventTitle]) {
						var e = events[eventTitle];
						message = eventTitle + " - " + e.attendees.length + " attendees:";

						var usernames = [];
						(function(userIds) {
							bot.getUsers().then(function(result) {
								for (var i = 0, ilen = userIds.length; i < ilen; i++) {
									var userId = userIds[i];
									for (var j = 0, jlen = result.members.length; j < jlen; j++) {
										var member = result.members[j];
										if (member.id === userId) {
											usernames.push(" " + member.name);
											break;
										}
									}
								}

								message += usernames.sort().join('');
		    					bot.postMessage(data.channel, message, params);
							}, null);
						}(e.attendees));
					}
					else {
						message = Object.keys(events).join(' ');
						if (!message) {
							message = "There are currently no events.";
						} else {
							message = "Events: " + message;
						}
    					bot.postMessage(data.channel, message, params);
					}
					break;
				
				case "create":
					if (events[eventTitle]) {
						message = "Event " + eventTitle + " already exists.";
					} else {
						events[eventTitle] = {attendees: []};
						message = "Event " + eventTitle + " created.";
					}
    				bot.postMessage(data.channel, message, params);
					break;

				case "delete":
					if (events[eventTitle]) {
						delete events[eventTitle];
						message = "Event " + eventTitle + " deleted.";
					} else {
						message = "No event " + eventTitle + " found.";
					}
    				bot.postMessage(data.channel, message, params);
					break;

				case "attend":
					if (events[eventTitle]) {
						var e = events[eventTitle];
						if (e.attendees.indexOf(userId) == -1) {
							e.attendees.push(userId);
							message = "Attendance registered.";
						} else {
							message = "You have already indicated your attendance.";
						}
					} else {
						message = "No event " + eventTitle + " found.";
					}
    				bot.postMessage(data.channel, message, params);
					break;

				case "withdraw":
					if (events[eventTitle]) {
						var e = events[eventTitle];
						if (e.attendees.indexOf(userId) == -1) {
							message = "You're not attending this event.";
						} else {
							e.attendees.splice(e.attendees.indexOf(userId), 1);
							message = "You have withdrawn from this event.";
						}
					} else {
						message = "No event " + eventTitle + " found.";
					}
    				bot.postMessage(data.channel, message, params);
					break;

				default:
					message = "CatBot usage: \"catbot (show|create|delete|attend|withdraw) (eventname)";
    				bot.postMessage(data.channel, message, params);
			}
		}
	}
});