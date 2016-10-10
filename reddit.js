'use strict';

const events = require('./events.js');
const snoowrap = require('snoowrap');

const tokens = require('./tokens.json');

const cache = require('./cache.json');

const fs = require('fs');

class Listener extends events.Events {

  constructor(subreddits) {
    super();

    this.r = new snoowrap({
      userAgent: 'r/SpaceX newposts slack bot (f9elongated) 0.0.2 (by u/zlsa)',
      clientId: tokens.reddit.clientId,
      clientSecret: tokens.reddit.clientSecret,
      username: tokens.reddit.username,
      password: tokens.reddit.password
    });

    this.r.config({
      requestDelay: 5000
    });

    this.subreddits = {};

    this.addSubreddits(subreddits);

    this.listen();
  }

  attach(output) {
    output.attach(this);
  }

  addSubreddits(subreddits) {
    for(var i in subreddits) {
      let latest = 0;
      
      if(subreddits[i] in cache) {
        latest = cache[subreddits[i]].latest;
      }
      
      this.subreddits[subreddits[i]] = {latest: latest};
    }
  }

  checkNewPosts(subreddit, posts) {

    posts = posts.slice(0, 5);

    let s = this.subreddits[subreddit];
    let latest = s.latest;

    if(latest != 0) {
      
      for(let i=0; i<posts.length; i++) {
        let p = posts[i];

        if(p.created > latest) {
          this.fire('new-post', {
            subreddit: subreddit,
            latest: latest,
            post: p
          });
        }
      }
      
    }
    
    for(let i=0; i<posts.length; i++) {
      latest = Math.max(posts[i].created, latest);
    }

    this.subreddits[subreddit].latest = latest;

    this.cache();
  }

  cache() {
    fs.writeFileSync('cache.json', JSON.stringify(this.subreddits));
  }

  listen() {
    
    for(var i in this.subreddits) {
      this.r.getSubreddit(i).getNew().then((posts) => {
        this.checkNewPosts(i, posts);
      }, (err) => {
        console.log(err);
      });
    }

    setTimeout(() => { this.listen() }, 5000);
    
  }

}

exports.Listener = Listener;
