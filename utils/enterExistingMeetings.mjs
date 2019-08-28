export default function(arr) {

  const $logWorkBtn     = 'input[name="addhoursButton"]',
        $issueInput     = '#linkKey',
        $dateInput      = '#add-dateField',
        $descInput      = '#add-comment',
        $timeInput      = '#add-time',
        $estimateInput  = '#add-remainingEstimate',
        $addBtn         = '#add-button-not-close',
        $addAndCloseBtn = '#add-button',
        $dropDownItem   = '.suggestions';


  return nightmare => {
    arr.forEach(el => {
      nightmare
        .wait($logWorkBtn)
        .click($logWorkBtn)
        .insert($issueInput, '')
        .type($issueInput, el.taskCode)
        .wait(`${$dropDownItem} [id$="${el.taskCode}"]`)
        .click(`${$dropDownItem} [id$="${el.taskCode}"]`)
        .insert($dateInput, '')
        .type($dateInput, `${el.startDate}`)
        .type($descInput, '.')
        .type($timeInput, `${el.duration}m`)
        .insert($estimateInput, '')
        .type($estimateInput, '0')
        .click($addBtn)
    })
  }


}