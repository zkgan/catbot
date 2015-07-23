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
//    token: 'xoxb-7985790579-0ijHLT98hBny2ctzYQg3YoW9',
    token: 'xoxb-7985790579-QYjz0fU2DN2H5YFs7qgPhM28', // Add a bot https://my.slack.com/services/new/bot and put the token 
    name: 'CatBot'
});

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        icon_emoji: ':cat:'
    };
    console.log("nyaa~");
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
	        organiseOuting(args, userId, data.channel, params);
		}
	}
});

function getUsernames(userIds) {
    var promise = bot.getUsers();
    while (promise._status === 0) { // Probably should implement timeout instead
    }

    var members = promise._value.members;
    var users = {};
    for (var i = 0, ilen = members.length; i < ilen; i++) {
        var member = members[i];
        users[member.id] = member.name;
    }
    var usernames = [];
    for (var i = 0, ilen = userIds.length; i < ilen; i++) {
        var userId = userIds[i];
        if (userId in users) {
            usernames.push(users[userId]);
        } else {
            console.log("Nyaa~ Could not find user " + userId);
        }
    }
    return usernames;
}

function organiseOuting(args, userId, channel, params) {
    var message;
    var eventTitle = args[2];
    switch (args[1]) {
        case "show":
            showOuting(eventTitle, channel, params);
        break;

        case "create":
        if (events[eventTitle]) {
		    message = "Event " + eventTitle + " already exists.";
        } else {
            events[eventTitle] = {attendees: []};
            message = "Event " + eventTitle + " created.";
		}
        bot.postMessage(channel, message, params);
        break;

        case "delete":
            if (events[eventTitle]) {
                delete events[eventTitle];
                message = "Event " + eventTitle + " deleted.";
            } else {
                message = "No event " + eventTitle + " found.";
            }
            bot.postMessage(channel, message, params);
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
            bot.postMessage(channel, message, params);
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
            bot.postMessage(channel, message, params);
            break;

        default:
            message = "CatBot usage: \"catbot (show|create|delete|attend|withdraw) (eventname)";
            bot.postMessage(channel, message, params);
    }
}

function showOuting(eventTitle, channel, params) {
    if (eventTitle && events[eventTitle]) {
        var e = events[eventTitle];
        var usernames = getUsernames(e.attendees);
        message = eventTitle + " - " + e.attendees.length + " attendees: ";
        message += usernames.sort().join(', ');
    } else {
        message = Object.keys(events).join(' ');
        if (!message) {
            message = "There are currently no events.";
        } else {
            message = "Events: " + message;
        }
    }
    bot.postMessage(channel, message, params);
}
