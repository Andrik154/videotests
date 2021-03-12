// server.js
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const log = require('./logger.js').log;
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var adapter = new FileSync('.data/db.json');
var db = low(adapter);


const scrap = require('./scrap-tests.js');
//
var browser;
puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
    headless: true
  }).then(r=>browser=r);


//API ROUTER

var apiRouter = express.Router();

apiRouter.get("/ping/", (req, res)=>{
  res.sendStatus(200);
});

apiRouter.post("/scoretask/", (req, res)=>{
  let testId = req.body.testId || false;
  let taskId = req.body.taskId || false;
  let answer = req.body.answer || false;
  if (testId && taskId && answer){
    let dbAns = db.get(`answers.task${taskId}`).value();
    if (dbAns && typeof(dbAns)!="string" && typeof(dbAns)!="object"){
      let isEqual = false;
      log(0, `typeof task ${taskId} is available for comparison, comparing`);
      let dbAns_ = String(dbAns).toLowerCase().replace(/[-_]/g, ' ');
      let answer_ = String(answer).toLowerCase().replace(/[-_]/g, ' ');

      dbAns_==answer_?isEqual=true:isEqual=false;
      if(isEqual){
        res.sendStatus(202);
      } else {
        res.sendStatus(204);
      }
    } else {
      let ans = scrap.checkScore(browser, testId, taskId, answer);
      ans.then((r)=>{
        if (r==0){
          db.set(`answers.task${taskId}`, answer).write();
          res.sendStatus(202);
        } else if (r==1){
          res.sendStatus(500);
        } else if (r==2){
          res.sendStatus(204);
        }
      })
    }
  } else{
    res.sendStatus(400);
  }
});

apiRouter.post("/gettest/", (req, res)=>{
  let testId = req.body.testId || false;
  if (testId){
    let ans = scrap.getTest(browser, testId);
    ans.then((r)=>{
      res.send(JSON.stringify(r));
    })
  } else {
  res.sendStatus(400);
  }
});

///Main

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send test.html
app.get("/test/", (request, response) => {
  response.sendFile(__dirname + "/views/test.html");
});

// api router
app.use("/api/", apiRouter);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
