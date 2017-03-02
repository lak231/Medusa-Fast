
var canvas = document.getElementById('section_selector');
var context = canvas.getContext('2d');
width = window.innerWidth* 46/100 ;
canvas.width = width;
canvas.height = width;
canvas.style.width = width+'px';
canvas.style.height = width+'px';

function resize() {
  var width = window.innerWidth * 46/100 ;
  canvas.width = width;
  canvas.height = width;
  canvas.style.width = width+'px';
  canvas.style.height = width+'px';
}
window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);
resize();
//the click event on object

canvas.addEventListener('click', function(event){
  var canvas = document.getElementById('section_selector');
  var rect = canvas.getBoundingClientRect();  // abs. size of element
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  var center_x = canvas.width / 2;
  var center_y = canvas.height / 2;
  x = x - center_x;
  y = y - center_y;
  if (x <= 0 && Math.abs(y) < Math.abs(x)){
    alert("dont-know");
  }
  if (x > 0 && Math.abs(y) < Math.abs(x)){
    alert('CS-related' + x + ' ' + y);
  }
  if (y >= 0 && Math.abs(x) < Math.abs(y)){
    alert('Collections' + x + ' ' + y);
  }
  if (y < 0 && Math.abs(x) < Math.abs(y)){
    alert('personal');
  }
});
context.strokeStyle = '#0CF0F5';
context.fillStyle = '#0CF0F5';
context.beginPath();
context.moveTo(canvas.width * 0.15, canvas.height * 0.15);
context.lineTo(canvas.width * 0.85, canvas.height * 0.85);
context.moveTo(canvas.width * 0.85, canvas.height * 0.15);
context.lineTo(canvas.width * 0.15, canvas.height * 0.85);
context.stroke();
