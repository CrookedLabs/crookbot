require('dotenv').config();
var Botkit = require('botkit');
var redis = require('botkit/lib/storage/redis_storage');
var http = require('http');
var url = require('url');

var redisURL = url.parse(process.env.REDISCLOUD_URL);
var redisStorage = redis({
  namespace: 'botkit-example',
  host: redisURL.hostname,
  port: redisURL.port,
  auth_pass: redisURL.auth.split(":")[1]
});

var controller = Botkit.slackbot({
  storage: redisStorage
});

var bot = controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM();

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
  var matches = message.text.match(/call me (.*)/i);
  var name = matches[1];
  controller.storage.users.get(message.user,function(err, user) {
    if (!user) {
      user = {
        id: message.user,
      };
    }
    user.name = name;
    controller.storage.users.save(user,function(err, id) {
      bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
    });
  });
});

controller.hears(['hey crookbot'], 'direct_message, direct_mention, mention, ambient', function(bot, message) {
  bot.reply(message, "Yes, is there something I can do for you assholes? I'm pretty lazy, so make it quick, mmk?");
});

controller.hears(["introduce yourself", "intro yourself"], 'direct_message, ambient', function(bot, message) {
  bot.startConversation(message, function(err, convo) {
    convo.ask('Ugh, wtf. Really?\n',[
      {
        pattern: bot.utterances.yes,
        callback: function(res, convo) {
          convo.say("Hi. I'm Crookbot. I'm here to serve you... people.");
          anythingElse(res, convo);
          convo.next();
        }
      },
      {
        pattern: bot.utterances.no,
        callback: function(res, convo) {
          convo.say("Good. Now let me get back to my bot porn!");
          convo.next();
        }
      },
      {
        default: true,
        callback: function(res, convo) {
          convo.say("Well that made no sense, so no. I guess I won't intrduce myself!");
          convo.next();
        }
      }
    ]);
  });
});

controller.hears(["who the hottest wife ever"], 'direct_message', function(bot, message) {
  bot.reply(message, "That Russian smokeshow Masha, what's who.\n I'd gladly tap that with my robot boner :eggplant:");
});

var anythingElse = function(res, convo) {
  convo.ask("Anything else before I got back to _beep boop beeping?_", [
    {
      pattern: bot.utterances.yes,
      callback: function(res, convo) {
        convo.say("Well before you ask, I'm going to politely tell you to go fuck a goat. Peace bitches.");
        convo.next();
      }
    },
    {
      pattern: bot.utterances.no,
      callback: function(res, convo) {
        convo.say("Good. I was about over this convo anyway. :middle_finger:");
        convo.next();
      }
    }
  ]);
};

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot, message) {

  controller.storage.users.get(message.user,function(err, user) {
    if (user && user.name) {
      bot.reply(message,'Your name is ' + user.name);
    } else {
      bot.reply(message,'I don\'t know yet!');
    }
  });
});


// To keep Heroku's free dyno awake
http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Ok, dyno is awake.');
}).listen(process.env.PORT || 5000);
