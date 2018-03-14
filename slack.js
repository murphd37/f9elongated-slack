'use strict';

const slack = require('slack');
const async = require('async');

class Output {

    constructor(config) {
        this.bot = slack.rtm.client();
        this.token = config.token;

        this.channel = config.channel;
        this.method = config.method;

        this.quiet = config.quiet;

        this.bot.started((payload) => {
            console.log('connected to the "' + payload.team.name + '" slack team');

            this.listener.on('new-post', (data) => {
                this.newPost(data);
            });

        });

        this.posts_seen = [];

        this.bot.listen({
            token: this.token
        });


    }

    attach(listener) {
        this.listener = listener;
    }

    newPost(data) {
        var post = data.post;

        this.sendPostMessage(post, data);
    }

    getSlackLink(text, url) {
        return '<' + url + '|' + text + '>';
    }

    sendPostMessage(post, data) {

        if (data.method != this.method && this.method != 'both') {
            return;
        }

        if (this.posts_seen.indexOf(post.id) >= 0) {
            return;
        }

        this.posts_seen.push(post.id);

        var type = 'link';

        if (post.is_self) type = 'self';

        let link = 'https://redd.it/' + post.id;
        let author_link = 'https://reddit.com/user/' + post.author.name;

        let text = post.selftext;

        if (!post.is_self) {
            text = post.url;
        }

        let attachment = {
            color: data.target.color,
            fallback: 'r/' + post.subreddit.display_name + ': ' + post.title + ' by ' + post.author.name,
            title: 'r/' + post.subreddit.display_name + ': ' + this.getSlackLink(post.title, link),
            author_name: 'u/' + post.author.name,
            author_link: author_link,
            thumb_url: post.thumbnail,
            text: text,
            ts: post.created_utc,
            footer: post.domain
        };

        if (data.target.important && this.quiet == false) {
            attachment.pretext = '<!channel> ' + post.title;
        }

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

        if (msg.attachments)
            message.attachments = JSON.stringify(msg.attachments);

        slack.chat.postMessage(message, function(err, data) {
            if (err) console.log(err);
        });

    }

}

exports.Output = Output;