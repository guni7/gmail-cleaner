const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './gmail/token.json';

// Load client secrets from a local file.
const getMessage = () => {
  fs.readFile('./gmail/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), __getMessage);
  });
}


// Load client secrets from a local file.
const listMessages = () => {
  fs.readFile('./gmail/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), __listMessages);
  });
}

// Load client secrets from a local file.
const listAllMessages = () => {
  fs.readFile('./gmail/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), __listAllMessages);
  });
}


// Load client secrets from a local file.
const listLabels = () => {
  fs.readFile('./gmail/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), __listLabels);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const __listLabels = (auth) => {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.lo/g('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

const __listMessages = (auth, nextPage) => {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.messages.list({
        userId: 'me',
        nextPageToken: nextPage,
    }, (err, res) => {
        if(err) return console.log("The listMessages returned an error" + err);

        console.log(res.data);
        nextPage = res.data.nextPageToken;

    });
}

const __listAllMessages = (auth, nextPageToken = '') => {
    const gmail = google.gmail({version: 'v1', auth});
    let options = {
        userId: 'me',
        pageToken: nextPageToken,
    }
    gmail.users.messages.list(options, (err, res) => {
        if (err) return console.log("ListAllMessages returned an error" + err);
        console.log(res.data);
        if(res.data.nextPageToken){
            console.log(res.data.nextPageToken);
            listAllMessages(auth, res.data.nextPageToken);
        }
    })
}

const __getMessage = (auth) => {
    messageId = '14b45f4b4ee73a6c';
    const gmail = google.gmail({version: 'v1', auth})
    var options = {
        userId: 'me',
        id: messageId,
    }
    gmail.users.messages.get(options, (err, res) => {
        if (err) return console.log("getMessage returned an error" + err);

        console.log(res.data.payload.headers);
        res.data.payload.headers.forEach(obj => {
            if(obj.name === "From"){
                console.log(obj);

            }
        })
    })
}


module.exports = {listLabels, getMessage, listMessages, listAllMessages};
