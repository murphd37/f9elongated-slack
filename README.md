
# Setup

Copy `tokens-template.json` to `tokens.json` and follow these steps to fill in the blanks:

## Reddit App Setup

To set up a reddit app, go to https://www.reddit.com/prefs/apps/ and click "create another app..." at the bottom of the screen.
Set `name` to your app's name, set `type` to script (heh) and set the `redirect uri` to 'http://localhost'

You will then find the Client ID under the new app's name, and the Client Secret next to the word  `secret`.

### The account that creates this reddit app must not have 2FA enabled on their account. 
### It also needs to be a moderator account since modqueue permissions are required.

## Slack Bot Setup

Under the top Slack menu, choose "Administration", then "Manage apps".
Under "Custom Integrations", create a new integration.
Set the bot name, and then retrieve the API Token for the `slack[SpaceX Mods].token` field in `tokens.json`.

## Future Development

From the creator, u/zlsa:

`
The "correct" solution is to add ElongatedMuskrat as a moderator that can't do anything
One feature I really wanted to add but never got around to is:
Instead of using the :approve: and :remove: emoji, update the message with "Approved by u/zlsa at 14:32"
That message could also be "Waiting in modqueue", "Auto-approved (approved submitter)", "Removed by u/zlsa at 14:32", "Deleted by user", etc.
`

