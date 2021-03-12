//Imports
const puppeteer = require("puppeteer");
const log = require('./logger.js').log;

//Code
async function checkScore(browser, testId, taskId, answer){
  log(0,`Scoring test #${testId}, question #${taskId}`);

  const page = await browser.newPage();
  await page.goto('https://videouroki.net/tests/'+testId);
  await page.evaluate((selector) => document.querySelector(selector).click(), 'input[type="submit"]');
  await page.type('input[name="firstname"]', 'jubaitcas', {delay: 10});
  await page.type('input[name="lastname"]', 'jubaitcas', {delay: 10});
  await Promise.all([
                     page.$eval('input[type="submit"]', elem => elem.click()),
                     page.waitForNavigation(),
                    ]);
  await  page.evaluate(async function(taskId, answer){
    var member = await window.backend.member;
    var payload = {
      "answer": {
        "id": taskId,
        "variants": answer
      },
      "member": member
    };
    
    //fetching
    await fetch(`https://videouroki.net/tests/api/save/${member.fakeId}/`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(r=> r.status==200?window.statusr=true:window.statusr=false);
  }, taskId, answer);
  //let status = await page.evaluate(function(){return window.statusr});
  //log(0, status);
  if (true){
    let fakeId = await page.evaluate(function(){return window.backend.member.fakeId});
    await page.goto('https://videouroki.net/tests/complete/'+fakeId);
    let num = await page.evaluate(async function(){
      let num = await document.querySelectorAll('div.test_main__results_statitem div span b')[2].innerHTML;
      return parseInt(num);
    });
    //memory optimization - there is a rumor that RAM is cleared only when page is closed on about:blank
    await page.goto('about:blank');
    await page.close();
    //log(0, fakeId, num);
    if (num==0){
      log(0, `Scored test #${testId}, task #${taskId}, answer is NOT right`);
      return 2
    } else if (num>0){
      log(0, `Scored test #${testId}, task #${taskId}, answer is right`);
      return 0
    }
    
  } else {
    log(1, `Something went wrong during scoring (#${testId}, question #${taskId})`);
    return 1
  }
  log(1, `Something went wrong during scoring (#${testId}, question #${taskId})`);
  return 1
}

async function getTest(browser, testId){
  log(0,`Getting test #${testId}`);
  
  const page = await browser.newPage();
  await page.goto('https://videouroki.net/tests/'+testId);
  await page.evaluate((selector) => document.querySelector(selector).click(), 'input[type="submit"]');
  let testName = await page.evaluate(()=>document.querySelector('p.test_header__ui_testname').innerHTML);
  await page.type('input[name="firstname"]', 'jubaitcas', {delay: 10});
  await page.type('input[name="lastname"]', 'jubaitcas', {delay: 10});
  await Promise.all([
                     page.$eval('input[type="submit"]', elem => elem.click()),
                     page.waitForNavigation(),
                    ]);
  let backend = await page.evaluate(function(){return window.backend});
  //memory optimization - there is a rumor that RAM clears only if page is closed on about:blank
  await page.goto('about:blank');
  await page.close();
  let testData = {
    "questions":JSON.parse(backend.questions),
    "testName":testName
  }
  return testData
}

//Exports
exports.checkScore = checkScore;
exports.getTest = getTest;