'use strict';

const events = require('./events.js');
const snoowrap = require('snoowrap');

const cache = require('./cache.json');

const fs = require('fs');

class Listener extends events.Events {

  constructor(tokens, targets) {
    super();

    this.r = new snoowrap({
      userAgent: 'r/SpaceX newposts slack bot (f9elongated) 0.0.3 (by u/zlsa)',
      
      clientId: tokens.clientId,
      clientSecret: tokens.clientSecret,
      
      username: tokens.username,
      password: tokens.password
    });

    this.r.config({
      debug: false,
      requestDelay: 5000
    });

    this.targets = {};

    this.interval = 5000;

    this.addTargets(targets);
  }

  attach(output) {
    output.attach(this);
  }

  addTargets(targets) {
    
    for(var target_name in targets) {
      let latest = {
        'posts': 0,
        'modqueue': 0
      };

      if(target_name in cache) {
        latest = cache[target_name];
      }

      let target = targets[target_name];
      target.name = target_name;

      if(!('important' in target)) {
        target.important = false;
      }
      
      if(!('poll' in target)) {
        target.poll = 'posts';
      }
      
      if(!('color' in target)) {
        target.color = '#cccccc';
      }
      
      this.targets[target_name] = target;

      this.targets[target_name].latest = latest;
    }
    
  }

  // Given an 'r/subreddit' and a list of posts, determine if there are any new posts
  checkNewPosts(subreddit_name, posts, method) {

    posts = posts.slice(0, 10);

    let subreddit = this.targets[subreddit_name];
    let latest = subreddit.latest[method];

    if(latest != 0) {
      
      for(let i=0; i<posts.length; i++) {
        let p = posts[i];

        if(p.created > latest) {
          this.fire('new-post', {
            method: method,
            target: subreddit,
            latest: latest,
            post: p
          });
        }
        
      }
      
    }
    
    for(let i=0; i<posts.length; i++) {
      latest = Math.max(posts[i].created, latest);
    }

    this.targets[subreddit_name].latest[method] = latest;

    this.cache();
  }

  cache() {
    let latest = {};
    
    for(let i in this.targets) {
      latest[i] = this.targets[i].latest;
    }
    
    fs.writeFileSync('cache.json', JSON.stringify(latest));
  }

  pollTarget(target_name) {
    
    if(target_name.startsWith('r/')) {
      this.pollSubreddit(target_name);
    } else {
      console.warn('cannot poll users yet');
    }
    
  }

  pollSubreddit(subreddit_name) {

    let config = this.targets[subreddit_name];

    if(config.ignore) return;

    if(config.poll == 'posts' || config.poll == 'both') {
      
      this.r.getSubreddit(subreddit_name.replace('r/', '')).getNew().then((posts) => {
        this.checkNewPosts(subreddit_name, posts, 'posts');
      }, (err) => {
        console.error(err);
      });

    }

    if(config.poll == 'modqueue' || config.poll == 'both') {
      
      this.r.getSubreddit(subreddit_name.replace('r/', '')).getModqueue({ only: 'links' }).then((posts) => {
        this.checkNewPosts(subreddit_name, posts, 'modqueue');
      }, (err) => {
        console.error(err);
      });

    }
    
  }

  poll() {

    for(let target_name in this.targets) {
      this.pollTarget(target_name);
    }

    setTimeout(() => { this.poll(); }, this.interval);
  }

  begin() {
    console.log('listening to ' + Object.keys(this.targets).length + ' targets');
    
    this.on('new-post', (data) => {
      console.log(JSON.stringify(data.post));
      //console.log(data.target.name + ': ' +  data.post.title);
    });
    
    this.poll();
  }

}

exports.Listener = Listener;
