'use strict';

const slack = require('slack');
const async = require('async');

const tokens = require('./tokens.json');

class Output {

  constructor() {
    this.bot = slack.rtm.client();
    this.token = tokens.slack.token;

    this.channel = '#newposts';

    this.bot.started((payload) => {
      console.log('connected to the "' + payload.team.name + '" slack team');

      this.listener.on('new-post', (data) => {
        this.newPost(data);
      });
      
    });

    this.bot.listen({
      token: this.token
    });


  }

  attach(listener) {
    this.listener = listener;
  }

  newPost(data) {
    var post = data.post;
    console.log(post.id + ' ' + (post.created - data.latest) + ' seconds after the newest post');

    this.sendPostMessage(post);
  }

  getSlackLink(text, url) {
    return '<' + url + '|' + text + '>';
  }
  
  sendPostMessage(post) {
    var type = 'link';

    if(post.is_self) type = 'self';

    var link = 'https://redd.it/' + post.id;
    var author_link = 'https://reddit.com/user/' + post.author.name;

    var text = post.selftext;

    if(!post.is_self) {
      text = post.url;
    }

    var attachment = {
      fallback: post.domain + ': ' + post.title + ' by ' + post.author.name,
      title: post.title,
      title_link: link,
      author_name: 'u/' + post.author.name,
      author_link: author_link,
      thumb_url: post.thumbnail,
      text: text,
      ts: post.created_utc,
      footer: post.domain
    };
    
    this.sendMessage({
      attachments: [attachment]
    });
    
  }
  
  sendMessage(msg) {

    var message = {
      token: this.token,
      as_user: true,
      channel: this.channel,
      text: msg.text || ''
    };

    if(msg.attachments)
      message.attachments = JSON.stringify(msg.attachments);
    
    slack.chat.postMessage(message, function(err, data) {
      if(err) console.log(err);
    });
    
  }

}

exports.Output = Output;
