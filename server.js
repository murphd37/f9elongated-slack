
const reddit = require('./reddit.js');
const slack = require('./slack.js');

const listener = new reddit.Listener(['spacex']);

listener.attach(new slack.Output());

