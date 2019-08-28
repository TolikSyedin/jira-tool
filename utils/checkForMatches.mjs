export default function(arr, results) {

  const $logWorkBtn     = 'input[name="addhoursButton"]',
        $issueInput    = '#linkKey',
        $suggestions   = '.suggestions';

  return nightmare => {
    arr.forEach( (el, i) => {
      nightmare
        .wait($logWorkBtn)
        .click($logWorkBtn)
        .wait($issueInput)
        .insert($issueInput, '')
        .type($issueInput, el.summary)
        .wait($suggestions)
        .wait(1000)
        .evaluate( (arr, i) => {
          const hsFirstElement      = '.suggestions ul > li + li > div[id*="linkKey_i_hs_FLR-"]',
                csFirstElement      = 'li > div[id*="linkKey_i_cs_FLR-"]',
                csHeading           = '.suggestions  #linkKey_s_cs';

          let csTaskId,
              hsTaskId,
              csFirstItemFound,
              results = JSON.parse(localStorage.getItem('results')) || [];

          const storeResults = () => {
            results.push(arr[i])
            localStorage.setItem('results', JSON.stringify(results));
          }

          try {
            // get the first element of history search
            hsTaskId = document.querySelector(hsFirstElement).getAttribute('id');

            /**
             * We may have two cases, in which we may match the case, which is
             * created before. We may have it as a first option in Current Search,
             * or it would appear as a first suggestion in both History and
             * Current search. Some times the history search is too big, and does
             * not contain the current seach siggestion list, in this case we need
             * this additional check, to avoid errors exceptions during try-catch
             * if the first elements of the current search does not exist.
             */
            if(document.querySelector(csHeading) !== null && document.querySelector(csFirstElement) !== null) {
              // set new id to the current search first line to be able to get first element of cs and compare it
              // document.querySelector(firstCsItem).parentElement.setAttribute('id', curentSearchHeader);
              // get first element of current search
              csTaskId = document.querySelector(csFirstElement).getAttribute('id');

              csFirstItemFound = document.querySelector(`#${csTaskId} table td[style]`).innerHTML.replace(/<\/?b>/g, '') === arr[i].summary
              console.log('csFirstItem matches the text of meeting ?', csFirstItemFound)
            }

            let hsFirstItemFound  = document.querySelector(`#${hsTaskId} table td[style]`).innerHTML.replace(/<\/?b>/g, '') === arr[i].summary,
                textIsMatching    = hsFirstItemFound || csFirstItemFound,
                codeIsMatching    = (!!hsTaskId && !!csTaskId) && hsTaskId.match(/\d+/g)[0] === csTaskId.match(/\d+/g)[0];


            console.log(arr[i].summary);
            console.log('textIsMatching', textIsMatching);
            console.log('codeIsMatching', codeIsMatching);

            if(textIsMatching || codeIsMatching) {
              arr[i].taskCode = `FLR-${csTaskId.match(/\d+/g)[0]}`;
            }

            storeResults();
          } catch(e) {
            console.error(e);
            storeResults();
          }

          console.log('results =  ', results)

          return results;
        }, arr, i)

      })
    }
}