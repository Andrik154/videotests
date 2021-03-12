class Test {
    constructor(testId) {
        let testNameContainer = document.getElementById('testName');
        let header = document.getElementById('h');
        let title = document.querySelector('title');
        this.testId = testId;

        let testData = JSON.parse(localStorage.getItem(testId)) || false;
        if(testData){
          this.testData = testData;
          this.testName = testData.testName;
          
          this.testQuestions = testData.questions;
          this.testData = testData;

          let copycode = document.querySelector('#copycode');
          copycode.addEventListener('click', (e)=>{
            e.preventDefault();
            let text = String(this.getAnswers());
            (async()=>{await navigator.clipboard.writeText(text).then(e=>alert('The code was copied'));})();
          });
          header.innerHTML = `Test #${this.testId}`;
          testNameContainer.innerHTML=String(this.testName);
          title.innerHTML = `${String(this.testName)} | SolveTheTest`;
          

          this.toggleScoring = false;
          this.answers = [];
          this.localStorageAnswers = JSON.parse(localStorage.getItem('answers'));
          this.tasks = [];

          this.#selfRender();
        } else if (testData==false && window.location.search!=''){
          header.innerHTML=`Test not found in localStorage`;
          let btn = document.createElement('button');
          btn.innerHTML='Download the test';
          document.querySelector('main').append(btn);
          btn.addEventListener('click', (e)=>{e.preventDefault(); e.target.setAttribute('disabled',''); this.getTest()});
        } else {
          window.location=window.location.origin;
        }
        
    }
    #selfRender(){
      let answers = this.localStorageAnswers;
      let questions = this.testQuestions;
      for (let i=0; i<questions.length; i++){
        let answer = answers[`task${questions[i].id}`] || false;
        if (answer!=false && answer !=undefined){
		  this.answers.push({"taskId":questions[i].id, "answer":answer})
        }
        let task = new Task(questions[i], i+1, answer, this);
        this.tasks.push(task);
      }
    }
    wait(){
      function dot(){
        setTimeout(()=>{h2.innerHTML+='.'}, 400);
        setTimeout(()=>{h2.innerHTML+='.'}, 800);
        setTimeout(()=>{h2.innerHTML+='.'}, 1200);
        setTimeout(()=>{h2.innerHTML='Wait'; check();}, 1600);
        
      }
      function check(){
        if(window.test.toggleWait){
          dot();
        } else {
          window.test.toggleWait=false;
        }
      }
      this.toggleWait=true;
      let h2 = document.getElementById('wait');
      h2.style.display='inline-block';
      dot();
    }
    unwait(){
      this.toggleWait=false;
      let h2 = document.getElementById('wait');
      h2.style.display='none';
    }
    getAnswers(){
      var code = 
      `//${this.testName}
      var answers = ${JSON.stringify(this.answers)};
      var member = window.backend.member;
      var payload = {"answer":{"id": 0,"variants": 0},"member": member};
      (async ()=>{for (const ans of answers){payload.answer.id=ans.taskId;payload.answer.variants=ans.answer;await fetch(\`https://videouroki.net/tests/api/save/\${member.fakeId}/\`,{method:"POST",headers:{"content-type": "application/json"},body: JSON.stringify(payload)}).then(r=> r.status==200?console.log('Done'):console.log('Error!'));}})().then(()=>{console.log('Завершить тест: '+'https://videouroki.net/tests/complete/'+member.fakeId);});
      `
      return code;
    }

    blockAll(){
      this.tasks.forEach(t=>{
        t.selfBtnBlock();
      })
    }
    unblockAll(){
      this.tasks.forEach(t=>{
        t.selfBtnUnblock();
      })
    }

    async getTest() {
      this.wait();
      await fetch(window.location.origin+'/api/gettest/', {
        method: 'POST',
          headers: {
            'content-type': "application/json"
          },
        body: JSON.stringify({'testId':this.testId})
      }).then(r=>r.json()).then(d=>{
        this.unwait();
        localStorage.setItem(String(this.testId), JSON.stringify(d));
        window.location.reload();
      })
    }

}
class Task {
    constructor (question, n, answer, parent) {
        this.parent = parent;

        this.type = question.type;
        this.id = question.id;
        this.task = question.description;
        this.annotation = question.annotation;
        this.n = n;
        let qa = [];
        question.answers.forEach(q=>{
          qa.push({"id":q.id, "text":q.text.replace(/<\/?[^>]+(>|$)/g, "")})
        })
        this.answers = qa;
        this.blockInstances = [];
		this.scored = false;
		(async ()=>await this.#selfRender())();  

        if (answer!=false && answer!=undefined){
		  this.answer = answer;
		  this.renderAnswers();
        }
            
    }
    #selfRender(){
        let div = document.createElement('div');
        div.setAttribute('class', 'question');
        document.querySelector('main').appendChild(div);
        let header = document.createElement('h3');
        header.innerHTML=`Вопрос ${this.n}.`;
        let task = document.createElement('div');
        task.innerHTML=this.task;
        let form = document.createElement('form');
        form.setAttribute('type', this.type);
        form.setAttribute('id', this.id);
        form.setAttribute('name', 'task');
        form.setAttribute('taskId', this.id);
        let btn = document.createElement('button');
        btn.addEventListener('click', (e)=>{e.preventDefault(); this.selfScore();});
        btn.setAttribute('class', 'submit_task');
        btn.innerHTML = 'Отправить';
        
        if (this.type==3){
            let input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('placeholder', 'Ответ...');
            this.blockInstances.push(input);
            form.append(document.createElement('label').innerHTML='Ответ:');
            form.append(input);  
            
          } else if (this.type==1){
            this.answers.forEach(q=>{
              let div = document.createElement('div');
              let radio = document.createElement('input');
              let label = document.createElement('label');
              radio.setAttribute('type', 'radio');
              radio.setAttribute('id', q.id);
              radio.setAttribute('name', this.id);
              this.blockInstances.push(radio);
              label.setAttribute('for', q.id);
              label.innerHTML=q.text;
              label.prepend(radio);
              div.append(label);
              form.append(div);
            })
          } else if (this.type==2 || this.type==6){
            this.answers.forEach(q=>{
              let div = document.createElement('div');
              let radio = document.createElement('input');
              let label = document.createElement('label');
              radio.setAttribute('type', 'checkbox');
              radio.setAttribute('id', q.id);
              radio.setAttribute('name', this.id);
              this.blockInstances.push(radio);
              label.setAttribute('for', q.id);
              label.innerHTML=q.text;
              label.prepend(radio);
              div.append(label);
              form.append(div);
            })
          } else if (this.type==4){
            let div = document.createElement('div');
            let select = document.createElement('select');
            let option = document.createElement('option');
            option.setAttribute('value', '');
            select.append(option);
            JSON.parse(this.annotation).forEach(el=>{
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
            this.answers.forEach(q=>{
              let div = document.createElement('div');
              let label = document.createElement('label');
              label.innerHTML=q.text;
              let newSelect = select.cloneNode(true);
              newSelect.setAttribute('id', q.id);
              this.blockInstances.push(newSelect);
              label.prepend(newSelect);
              div.append(label);
              form.append(div);
            })
          } else if (this.type==5){
            let select = document.createElement('select');
            let option = document.createElement('option');
            option.setAttribute('value','');
            select.append(option);
            for (let i=1; i<=this.answers.length; i++){
              let opt = option.cloneNode();
              opt.setAttribute('value', i);
              opt.innerHTML=String(i);
              select.append(opt);
            }
            this.answers.forEach(q=>{
              let label = document.createElement('label');
              let newSelect = select.cloneNode(true);
              newSelect.setAttribute('id',q.id);
              this.blockInstances.push(newSelect);
              label.append(newSelect);
              label.append(q.text);
              form.append(label);
            })
          }
          form.append(btn);
          div.append(header);
          div.append(task);
          div.append(form);

          this.form = form;
          this.btn = btn;
	}
	
	renderAnswers() {
		console.log(this.answer);
		if(this.type==3){
			this.blockInstances[0].value = this.answer;
			this.#selfSuccessBlock();
		}
		this.blockInstances.forEach(i=>{

		})

		
	}

    selfBtnBlock() {
      if (!this.scored){
        this.btn.setAttribute('disabled', '');
      }
    }
    selfBtnUnblock() {
      if (!this.scored){
		this.btn.removeAttribute('disabled');
      }
    }
    selfBlock() {
        if(!this.scored){
            this.blockInstances.forEach(i=>i.setAttribute('disabled', ''));
            this.btn.setAttribute('disabled', '');
        }
    }
    selfUnblock() {
        if(!this.scored){
            this.blockInstances.forEach(i=>i.removeAttribute('disabled'));
			this.btn.setAttribute('disabled', '');
        }
    }
    #selfSuccessBlock(){
        this.scored=true;
        this.btn.innerHTML = '✅ Верно';
		this.btn.setAttribute('disabled', '');
        this.blockInstances.forEach(i=>i.setAttribute('disabled', ''));
    }
    selfScore(){
        if(this.parent.toggleScoring){
          return false;
        } else {
          this.parent.toggleScoring = true;
        }
        let type = this.type;
        let form = this.form;

        this.parent.blockAll();
        this.parent.wait();

        this.selfBlock();

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
                      body: JSON.stringify({"testId":this.parent.testId,"taskId":this.id,"answer":answer})
                    }).then((r)=>{
                      this.parent.unwait();
                      this.parent.unblockAll();
                      this.selfUnblock();
                      this.selfUnblock();
                      this.selfBtnUnblock();
                      if(r.status==202){
                        this.answer = answer;
                        this.parent.answers.push({taskId:this.id, answer:answer});
                        this.parent.localStorageAnswers[`task${this.id}`] = answer;
                        localStorage.setItem('answers', JSON.stringify(this.parent.localStorageAnswers));
                        this.#selfSuccessBlock();
                      } else if(r.status==204){
                        alert('Неверно');
                      } else {
                        alert('Error');
                      }
                     this.parent.toggleScoring = false;
                    });
              }
          });
    }
}


window.onload = function(){
  window.test = new Test((new URL(window.location.href)).searchParams.get("testId"));
}