# NCube Jira Autofiller


## Description

This is a tool related to fulfill our jira timestamps automatically, by fetching
the meeting data from the google API, and logging into the jira via nightmare.js.
It is used for transition of all the meetings that you've visited during the month.


## Preparation

First, you have to visit the website of google, and make sure that your API is 
enabled for usage. To do so :
- **1.** Visit [this website](https://developers.google.com/calendar/quickstart/js)
and click `Enable the google calendar api` button. After this you have to 
pick your account from list (if using Google Chrome, and logged in) or enter it
manually (if unauthorised, or using different browser).
- **2.** Once this is done you will see the `Download Client Information` button,
which is gonna provide you the file for downloading, called `credentials.json`.
Please donwload it and put into the credentials folder (`/src/credentials/credentials.json`)
Also in the same pop-up window you can see a link to the [API console](https://console.developers.google.com/?authuser=0&project=quickstart-1565961505121)
Please go there and make sure that you API key is enabled for FLIGHTRIGHT.DE => 
Quickstart. If not - enable it manually and download credentials once again.
Repeat the operation if you see any error regarding OAuth or anything binded to 
googleFetch.js file, while script execution in the console.
The script is gonna generate a token, that is gonna be stored under the same folder,
and used for all next times.
- **3.** Check your calendar, and make sure that you have configured all your meetings
in a proper way. To fetch all your meetings properly you have to make sure that 
you've confirmed your attendance. Check the example on the [screenshot]. Your meetings
would be displayed in two cases - if you accepted if (No, and Maybe gonna be skipped),
or if you organized it yourself, as a blocker for some task or a meeting (should
be not longer then one day, f.e. National Holiday, or Vacation). It this cases 
even if you don't invite yourself to this event - it still gonna be fetched from
Google Api.
- **4.** run 
```
yarn install
```
or
```
npm install
```
to download all dependencies. 

**__IMPORTANT__** Please make sure that you have your **npm** and **nodejs** installed
globally with the latest versions.


When you are finished with the preparations you can proceed further.


## Usage

To start the tool you have to run 
```
yarn start
```
or
```
npm start
```


Then you will see some prompts in your console, that will ask you to provide some
data.

- **1.** Your email address. Needed to fetch your meetings from google calendar.
- **2.** The dates range. Needed to understand which dates you want to fetch, if
you leave this fields empty - it will fetch the meetings of whole current month 
by default. If you are not logged in - it will run the OAuth code by google,
which is gonna  prompt you with the link. Click on the link and choose the FR
google account, it will generate the link, that you should paste back in the
console, where you've executed the starting command.
Once this is done you will store the access token, and never see this again,
untill your token file will be deleted or moved from credentials folder.
- **3.** Your jira credentials. Needed to login into NCube's jira.


Prompts containing hits and required format in **[ square braces ]**


# Additional

You also can edit the commonTasks.js file, which is basically a hash with the 
common tasks. If you have some task meetings that usually repeating from month 
to month you probably better add them to this model with appropriate code.

You can also add some custom events with the names of your tasks that you were 
working.
f.e You can create a custom event for 1 hour, and call it like this

```
TASKCODE-123 The name of task in Jira
```
and set it for 1 hour. After your application finish to run you can manually add
needed amount of time to complete the day with 8hours of work.
Or, if your app already fetched all the meetings for the month, or some 
period of time, f.e you fulfilled the meetings for one sprint, and decided to add
some tasks you were working during this sprint, let's say first 14 days of month.

You can create and add the events manually in your calendar, and name it like
in Flightright Jira, in format shown above.
after you add the tickets, and you need to run the app once again, from 1 to 
14th of August, you will duplicate all the tasks that were logged before. 
To avoid that you can rather set the rest of the meetings to No or Maybe status,
or simply comment **55th** an **61th** line of code in **app.mjs**.

```
    .type('input#usernameinput', username)
    .type('input#os_password', password)
    .click('#login')
    .wait('#tempo_menu')
    .click('#tempo_menu')
    .use(enterExistingMeetings(existingsMeetings))                    <== // 55th
    .then(() => {
      nightmare
        .use(checkForMatches(nonExistingsMeetings))     
        .then(result => {
          nightmare
            .use(enterExistingMeetings(getExistingMeetings(result)))  <==  //61th
            .then(() => {
              nightmare
                .use(logNewTasks(getNonExistingMeetings(result)))
                .end()
                .then(console.log)
                .catch(e => console.log(e))
            })
```
