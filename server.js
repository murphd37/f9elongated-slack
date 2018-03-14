'use strict';

const reddit = require('./reddit.js');
const slack = require('./slack.js');

const tokens = require('./tokens.json');

const listener = new reddit.Listener(
    tokens.reddit, {
        'r/spacex': {
            poll: 'both',
            color: '#2266ff',
            important: true
        },
        'r/spacexlounge': {
            poll: 'posts',
            color: '#ccaaff',
            important: false
        },
        'r/spacexmasterrace': {
            poll: 'posts',
            color: '#dddddd',
            important: false
        }
    });

for (let team_name in tokens.slack) {
    let team = tokens.slack[team_name];

    listener.attach(new slack.Output(team));
}

listener.begin();