// client-side js, loaded by index.html
// run by the browser each time the page is loaded
window.app={};
window.onload = function(){
  let testId = (new URL(window.location.href)).searchParams.get("testId");
  let testData = JSON.parse(localStorage.getItem(testId)) || false;
  
  let testNameContainer = document.getElementById('testName');
  let header = document.getElementById('h');
  let title = document.querySelector('title');
  
  let copycode = document.querySelector('#copycode');
  let copycodeText = document.querySelector('#copycode_text');
  
  
  window.app.testId=parseInt(testId);
  window.app.answers=JSON.parse(localStorage.getItem('answers')) || {};
  
  
  window.app.copycode = copycode;
  window.app.copycodeText = copycodeText;
  window.app.copycode.addEventListener('click', (e)=>{
    e.preventDefault();
    let text = String(window.app.getAnswers());
    (async()=>{await navigator.clipboard.writeText(text).then(e=>alert('The code was copied'));})();
  });
  
  if (testData){
      let testName = (new URL(window.location.href)).searchParams.get("testName") || testData.testName || undefined;
      header.innerHTML=`Test #${testId}`;
      if(testName!=undefined){
        testNameContainer.innerHTML=String(testName);
        title.innerHTML = `${String(testName)} | SolveTheTest`;
        testData.testName = testName;
        localStorage.setItem(testId, JSON.stringify(testData));
      }
      window.app.testData = {"questions":testData.questions, "testName":testData.testName};
      renderTest(window.app.testData.questions);
  } else if (testData==false && window.location.search!=''){
      header.innerHTML=`Test not found in localStorage`;
      let btn = document.createElement('button');
      btn.innerHTML='Download the test';
      document.querySelector('main').append(btn);
      btn.addEventListener('click', (e)=>{e.preventDefault(); e.target.setAttribute('disabled',''); getTest(window.app.testId)});
  } else if (testData==false && !testId){
      window.location=window.location.origin;
  }
}

function renderTest(questions){
  for (let i=0; i<questions.length; i++){
    renderQuestion(questions[i], i+1);
  }
}

function renderQuestion(question, n){
  if(question.type!=3){
    let qa = [];
    question.answers.forEach(q=>{
      qa.push({"id":q.id, "text":q.text.replace(/<\/?[^>]+(>|$)/g, "")})
    })
    question.answers=qa;
  }
  
  let div = document.createElement('div');
  div.setAttribute('class', 'question');
  document.querySelector('main').appendChild(div);
  let header = document.createElement('h3');
  header.innerHTML=`Вопрос ${n}.`;
  let task = document.createElement('div');
  task.innerHTML=question.description;
  let form = document.createElement('form');
  form.setAttribute('type', question.type);
  form.setAttribute('id', question.id);
  form.setAttribute('name', 'task');
  form.setAttribute('taskId', question.id);
  let btn = document.createElement('button');
  btn.addEventListener('click', (e)=>{e.preventDefault(); scoreQuestion(question.id);});
  btn.setAttribute('class', 'submit_task');
  btn.innerHTML = 'Отправить';
  if (question.type==3){
    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Ответ...');
    form.append(document.createElement('label').innerHTML='Ответ:');
    form.append(input);  
    
  } else if (question.type==1){
    question.answers.forEach(q=>{
      let div = document.createElement('div');
      let radio = document.createElement('input');
      let label = document.createElement('label');
      radio.setAttribute('type', 'radio');
      radio.setAttribute('id', q.id);
      radio.setAttribute('name', question.id);
      label.setAttribute('for', q.id);
      label.innerHTML=q.text;
      label.prepend(radio);
      div.append(label);
      form.append(div);
    })
  } else if (question.type==2 || question.type==6){
    question.answers.forEach(q=>{
      let div = document.createElement('div');
      let radio = document.createElement('input');
      let label = document.createElement('label');
      radio.setAttribute('type', 'checkbox');
      radio.setAttribute('id', q.id);
      radio.setAttribute('name', question.id);
      label.setAttribute('for', q.id);
      label.innerHTML=q.text;
      label.prepend(radio);
      div.append(label);
      form.append(div);
    })
  } else if (question.type==4){
    let div = document.createElement('div');
    let select = document.createElement('select');
    let option = document.createElement('option');
    option.setAttribute('value', '');
    select.append(option);
    JSON.parse(question.annotation).forEach(el=>{
      let p = document.createElement('div');
      p.innerHTML=`<b>${el.id}</b> - ${el.text}`
      p.classList.add('option');
      div.append(p);
      let opt = option.cloneNode();
      opt.setAttribute('value', el.id);
      opt.innerHTML=el.id;
      select.append(opt);
    })
    form.append(div);
    question.answers.forEach(q=>{
      let div = document.createElement('div');
      let label = document.createElement('label');
      label.innerHTML=q.text;
      let newSelect = select.cloneNode(true);
      newSelect.setAttribute('id', q.id);
      label.prepend(newSelect);
      div.append(label);
      form.append(div);
    })
  } else if (question.type==5){
    let div = document.createElement('div');
    let select = document.createElement('select');
    let option = document.createElement('option');
    option.setAttribute('value','');
    select.append(option);
    for (let i=1; i<=question.answers.length; i++){
      let opt = option.cloneNode();
      opt.setAttribute('value', i);
      opt.innerHTML=String(i);
      select.append(opt);
    }
    question.answers.forEach(q=>{
      let label = document.createElement('label');
      let newSelect = select.cloneNode(true);
      newSelect.setAttribute('id',q.id);
      label.append(newSelect);
      label.append(q.text);
      form.append(label);
    })
  }
  form.append(btn);
  div.append(header);
  div.append(task);
  div.append(form);
}

async function getTest(testId, testName){
  wait();
  await fetch(window.location.origin+'/api/gettest/', {
    method: 'POST',
      headers: {
        'content-type': "application/json"
      },
    body: JSON.stringify({'testId':testId})
  }).then(r=>r.json()).then(d=>{
    unwait();
    localStorage.setItem(String(testId), JSON.stringify(d));
    window.location.reload();
  })
}

function scoreQuestion(taskId){
  function blockall(){
    document.querySelectorAll('button.submit_task').forEach(node=>{if(!(node.getAttribute('disabled')=='scored')){node.setAttribute('disabled','')}});
    form.querySelectorAll(`input`).forEach(node=>node.setAttribute('disabled',''));
    form.querySelectorAll(`select`).forEach(node=>node.setAttribute('disabled',''));
  }
  function unblockall(){
    document.querySelectorAll('button.submit_task').forEach(node=>{if(!(node.getAttribute('disabled')=='scored')){node.removeAttribute('disabled');}});
    form.querySelectorAll(`input`).forEach(node=>node.removeAttribute('disabled'));
    form.querySelectorAll(`input`).forEach(node=>node.removeAttribute('disabled',''));
  }
  function blockself(){
    form.querySelectorAll('button.submit_task').forEach(node=>{node.setAttribute('disabled','scored'); node.innerHTML='✅ Верно'});
    form.querySelectorAll(`input`).forEach(node=>node.setAttribute('disabled',''));
    form.querySelectorAll(`input`).forEach(node=>node.setAttribute('disabled',''));
  }
  if (!window.app.toggleScoring){
    wait();
    window.app.toggleScoring=true;
    var form = document.getElementById(taskId);
    blockall();
    var type = form.getAttribute('type');
    if (type==3){
      var answer = form.querySelector('input[type=text]').value;
    } else if (type==1){
      var answer = 0;
      form.querySelectorAll('input[type=radio]').forEach(el=>el.checked?answer=parseInt(el.id):answer=answer);
    } else if (type==2){
      var answer = [];
      form.querySelectorAll('input[type=checkbox]').forEach(el=>el.checked?answer.push(parseInt(el.id)):'');
    } else if (type==6){
      var answer = [];
      form.querySelectorAll('input[type=checkbox]').forEach(el=>answer.push({"answer_id":parseInt(el.id), "answer":el.checked?1:0}));
    } else if (type==4){
      var answer = [];
      form.querySelectorAll('select').forEach(el=>answer.push({"answer_id":parseInt(el.id), "answer":parseInt(el.value)}));
    } else if (type==5){
      var answer = [];
      form.querySelectorAll('select').forEach(el=>answer.push({"answer_id":parseInt(el.id), "answer":parseInt(el.value)}));
    }
    fetch(window.location.origin+'/api/ping/').then(
      r=>{
        if(r.status==200){
              fetch(window.location.origin+'/api/scoretask/', {
                method: 'POST',
                headers:{
                  'content-type':'application/json'
                },
                body: JSON.stringify({testId:window.app.testId,taskId:taskId,answer:answer})
              }).then((r)=>{
                unwait();
                unblockall();
                if(r.status==202){
                  window.app.answers[`${taskId}`]=answer;
                  localStorage.setItem('answers', JSON.stringify(window.app.answers));
                  blockself();
                } else if(r.status==204){
                  alert('Неверно');
                } else {

                }
               window.app.toggleScoring=false;
              });
        }
    });

  }
  else {
    alert('Other scoring is in progress');
  }
}

function wait(){
  function dot(){
    setTimeout(()=>{h2.innerHTML+='.'}, 400);
    setTimeout(()=>{h2.innerHTML+='.'}, 800);
    setTimeout(()=>{h2.innerHTML+='.'}, 1200);
    setTimeout(()=>{h2.innerHTML='Wait'; check();}, 1600);
    
  }
  function check(){
    if(window.app.toggleWait){
      dot();
    } else {
      window.toggleWait=false;
    }
  }
  window.app.toggleWait=true;
  let h2 = document.getElementById('wait');
  h2.style.display='inline-block';
  dot();
}

function unwait(el){
  window.app.toggleWait=false;
  let h2 = document.getElementById('wait');
  h2.style.display='none';
}

window.app.getAnswers = function(){
  var answers = [];
  document.querySelectorAll('form[name=task]').forEach((form)=>{
    answers.push({"taskId":parseInt(form.id), "answer":window.app.answers[parseInt(form.id)]});
  })
  var code = `
  //${window.app.testData.testName}
  var answers = ${JSON.stringify(answers)};
  var member = window.backend.member;
  var payload = {"answer":{"id": 0,"variants": 0},"member": member};
  (async ()=>{for (const ans of answers){payload.answer.id=ans.taskId;payload.answer.variants=ans.answer;await fetch(\`https://videouroki.net/tests/api/save/\${member.fakeId}/\`,{method:"POST",headers:{"content-type": "application/json"},body: JSON.stringify(payload)}).then(r=> r.status==200?console.log('Done'):console.log('Error!'));}})().then(()=>{console.log('Завершить тест: '+'https://videouroki.net/tests/complete/'+member.fakeId);});
  `
  return code;
}