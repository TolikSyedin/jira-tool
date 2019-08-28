export default function(arr) {

    const $createLink = '#create_link',
          $createBtn  = '#quick-create-button',
          $projectSel = '#quick-pid',
          $summary    = '#summary',
          $assignToMe = '#assignee + a',
          $submit     = '#create_submit',
          $issueSel   = '#quick-issuetype',
          $logWorkBtn = 'a.button.first.last[title="Log work"]',
          $timeInput  = 'input[name="timeLogged"]',
          $dateInput  = '#date_startDate',
          $logSubmit  = '#log_submit'
    console.log('arr from logNewTasks = ', arr);
    return nightmare => {
      arr.forEach(el => {
        nightmare
          .wait($createLink)
          .click($createLink)
          .wait($projectSel)
          .wait($issueSel)
          .select($projectSel, '10580')
          .select($issueSel, '3')
          .click($createBtn)
          .wait($summary)
          .type($summary, el.summary)
          .click($assignToMe)
          .click($submit)
          .wait($logWorkBtn)
          .click($logWorkBtn)
          .wait($timeInput)
          .type($timeInput, `${el.duration}m`)
          .insert($dateInput, '')
          .type($dateInput, `${el.startDate} 12:00 PM`)
          .click($logSubmit)
          .wait(3000)
      })
    }

}