import initCalendar from './src/googleFetch.mjs';
import readlineSync from 'readline-sync';
import Nightmare from 'nightmare';
import commonTasks from './src/models/commonTasks.mjs';
import enterExistingMeetings from './src/utils/enterExistingMeetings.mjs';
import checkForMatches from './src/utils/checkForMatches.mjs';
import logNewTasks from './src/utils/logNewTasks.mjs';


const getExistingMeetings = arr => arr.filter(el => el.taskCode);

const getNonExistingMeetings = arr => arr.filter(el => !el.taskCode);


initCalendar().then(meetings => {

  meetings.forEach(el => el.taskCode = commonTasks[el.summary] || null);

  let existingsMeetings = getExistingMeetings(meetings)
  let nonExistingsMeetings = getNonExistingMeetings(meetings)

  console.log('meetings = ', meetings);

  // get jira credentials
  let username = readlineSync.question(`## Enter your login to NCube\'s jira. Should be in format like [ asyedin ] `);

  let password = readlineSync.question('## Your password for NCube\'s jira ', {
    hideEchoBack: true
  });



  // nightmare configuration
  const nightmare = Nightmare({
    gotoTimeout: 10000,
    openDevTools: {
      mode: 'detach'
    },
    show: true
  })


  nightmare
    .viewport(1000, 1000)
    .goto('http://jira.n-cube.co.uk:8099/secure/Dashboard.jspa')
    // going around the login process by accessing the login form from iframe to the main page, to execute the js code
    .wait('iframe#gadget-0')
    // change the url programmatically
    .evaluate(() => window.location.href = document.querySelector('#gadget-0').getAttribute('src'))
    .wait(2000)
    .wait('#usernameinput')
    // enter your credentials to login into jira.
    .type('input#usernameinput', username)
    .type('input#os_password', password)
    .click('#login')
    .wait('#tempo_menu')
    .click('#tempo_menu')
    .use(enterExistingMeetings(existingsMeetings))
    .then(() => {
      nightmare
        .use(checkForMatches(nonExistingsMeetings))
        .then(result => {
          nightmare
            .use(enterExistingMeetings(getExistingMeetings(result)))
            .then(() => {
              nightmare
                .use(logNewTasks(getNonExistingMeetings(result)))
                .end()
                .then(console.log)
                .catch(e => console.log(e))
            })
            .catch(e => console.log(e))
        })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
});

