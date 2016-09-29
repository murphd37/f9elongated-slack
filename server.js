'use strict'

const reddit = require('./reddit.js');

const slack = require('slack');
const async = require('async');

const tokens = require('tokens');

const bot = slack.rtm.client();
const token = process.env.SLACK_TOKEN || tokens.slack.token;

const channel = '#newposts';

const listener = new reddit.Listener(['spacex']);

bot.started(function(payload) {
  console.log('connected to the "' + payload.team.name + '" slack team');

  listener.on('new-post', (data) => {
    let p = data.post;
    console.log(p.id + ' creation at ' + p.created + ' is ' + (data.latest-p.created) + ' seconds after the newest post');

    let type = 'link';

    if(p.is_self) type = 'self';

    sendMessage({
      text: 'New ' + type + 'post: <https://redd.it/' + p.id + '|' + p.title + '>'
    }, channel);
    
  });
  
});

function sendMessage(msg, channel) {

  var message = {
    token: token,
    as_user: true,
    channel: channel,
    text: msg.text || '',
  };

  if(msg.attachments)
    message.attachments = JSON.stringify(msg.attachments);
  
  slack.chat.postMessage(message, function(err, data) {
    if(err) console.log(err);
  });
  
}

bot.listen({
  token: token
});

