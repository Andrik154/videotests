if(localStorage.getItem('answers')==undefined){
  localStorage.setItem('answers', '{}'); 
}

if (location.protocol != 'https:') {
 location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}