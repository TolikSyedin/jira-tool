import fs from 'fs';
import path from 'path'
import readline from 'readline';
import Google from 'googleapis';
import moment from 'moment';
import readlineSync from 'readline-sync';
const { google } = Google;
const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = '/credentials/token.json';
const mailAddress = readlineSync.question(`## Enter your FR email address in format [ firstname.lastname@flightright.de ] ::: `);
console.log(`
## Now you have to enter the date range of the meetings that you want to gather
You should enter 2 dates in the format 
[ MM.DD.YYYY ]
F.e. you can type 08.19.2019 - which is gonna be 19th of August 2019.
If you leave the fields empty - the dates are gonna be set by defaults,

  And this will be a starting and ending date of current month
Please notice, that if your start date will be 1st day of the month, it's
gonna start counting from the 00:00am.
Ending date gonna work differently, if you enter 2nd day of the month, it will
capture everything startign from the starting date, till 00:00am, so the meeting
that are scheduled for the 2nd day won't be fetched.

  In other words to grab first 10 days of the month just enter empty string
as a starting date and 11th day of the current month in correct format
`);
const startDate = readlineSync.question('## Please enter the starting date (Press enter to set first day of current month) ::: '),
      endDate = readlineSync.question('## Please enter the ending date (Press enter to set last day current of month) ::: ');

// let mailAddress = 'dmytro.parkhomenko@flightright.de', startDate = '', endDate = '';


// Load client secrets from a local file.
function init() {
  return new Promise( (resolve, reject) => {

    fs.readFile(path.resolve(__dirname + '/credentials/credentials.json'), (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);

      // Authorize a client with credentials, then call the Google Calendar API.
      authorize(JSON.parse(content), listEvents).then(x => resolve(x));

    })
  })

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
  return new Promise( (res, rej) => {
    fs.readFile(path.resolve(__dirname + TOKEN_PATH), (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback, res);
      oAuth2Client.setCredentials(JSON.parse(token));
      return res(callback(oAuth2Client));
    })
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback, resolve) {
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
      fs.writeFile(path.resolve(__dirname + TOKEN_PATH), JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      resolve(callback(oAuth2Client));
    });
  });
}

/**
 * Lists the next 100 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  return new Promise( (resolve, reject) => {

    calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate && new Date(startDate).toISOString() || moment().startOf('month').toISOString(),
      timeMax: endDate && new Date(endDate).toISOString() || moment().endOf('month').toISOString(),
      singleEvents: true,
      alwaysIncludeEmail: false,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;

      if (events.length) {
        // maping and filter all events, to save onle those which pass conditions
        const results = events.map((event, i) => {
          const { summary, status, organizer, attendees } = event,
                start = event.start.dateTime || event.start.date,
                end = event.end.dateTime || event.end.date,
                duration = moment(end).diff(moment(start), 'minutes');

          let accepted = false;

          // in case of vacations of flightright members need to double check if attendees are existing
          typeof attendees !== 'undefined' && attendees.forEach(atndt => {
            if(atndt.email === mailAddress && atndt.responseStatus === 'accepted') {
                accepted = true;
              }
          })

          if((status === 'confirmed' && accepted) || organizer.email === mailAddress && duration <= 480) {
            const eventData = {
              summary,
              status,
              duration,
              startDate: moment(start).format('DD/MMM/YY'),
              startTime: moment(start).format('h:mm')
            };

            return eventData;
          }
        }).filter(e => e !== undefined);

        resolve(results);
      } else {
        reject('err');
        console.log('No upcoming events found.');
      }
    });
  })
}


export default init;