window.onload = function(){
  var list = document.getElementById('tests');
  var totalSize = 0;
  for (const key of Object.keys(localStorage)){
    if(key!='answers'){
      let li = document.createElement('li');
      let btn = document.createElement('a');
      let rawTest = localStorage.getItem(key);
      let test = JSON.parse(rawTest);
      let html=`<a href="/test?testId=${key}">${test.testName?test.testName:key}</a>`;
      btn.href='#';
      btn.innerHTML='удалить';
      btn.classList.add('removeTest');
      btn.addEventListener('click', (e)=>{e.preventDefault(); if(confirm(`Delete ${test.testName}?`)){localStorage.removeItem(key); li.remove();}});
      list.appendChild(li);
      li.innerHTML=html;
      li.append(`(${((rawTest.length)/512).toFixed(2)} KiB)`);
      li.append(btn);
      
      totalSize+=rawTest.length/512;
    }
  }
  var answers = JSON.parse(localStorage.getItem('answers'));
  (()=>{
    let answersLen = Object.keys(answers).length;
    let answersSize = JSON.stringify(answers).length/512;
    var answersSpan= document.querySelector('#answers');
    answersSpan.innerHTML='';
    answersSpan.append(`Answers Saved: ${answersLen}, Answers Size: ${answersSize.toFixed(2)} KiB`);
    let btn = document.createElement('a');
    btn.href='#';
    btn.innerHTML='удалить';
    btn.classList.add('removeTest');
    btn.addEventListener('click', (e)=>{e.preventDefault(); if(confirm(`Delete ${answersLen} answers?`)){localStorage.setItem('answers', '{}'); window.location.reload();}});
    answersSpan.append(btn)
    
    totalSize+=answersSize;
  })(); 
  
  (()=>{
    let sizeBar = document.querySelector('#size');
    let localStorage = document.querySelector('#localStorage');
    let localStoragePercentage = document.querySelector('#localStoragePercentage');
    console.log(totalSize);
    sizeBar.value = parseInt(totalSize);
    localStorage.innerHTML = `${totalSize.toFixed(2)} KiB`;
    localStoragePercentage.innerHTML = `${(totalSize/(5*1024)*100).toFixed(2)}%`;
  })();
  
}