var Botkit = require('botkit');

	var controller = Botkit.slackbot({
	  debug: false
	});

	// connect the bot to a stream of messages
	controller.spawn({
	  token: "xoxb-22078676368-lBmfX4iPRUUGcnwdaaBqF8DF",
	}).startRTM();

	// give the bot something to listen for.
	controller.hears('hello','direct_message,direct_mention,mention',function(bot,message) {

	  bot.reply(message,'Hello yourself.');

	});
