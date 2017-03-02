
var canvas = document.getElementById('section_selector');
var context = canvas.getContext('2d');
var small  = false;
var transitioning = false;
var current_section = 1;
/**
resize function. Called whenever the screen is resized
*/
function resize() {
  var canvas = document.getElementById('section_selector');
  var width = window.innerWidth * 46/100;
  canvas.width = width;
  canvas.height = window.innerWidth / 6;
  canvas.style.width = canvas.width+'px';
  canvas.style.height = canvas.height+'px';
  var x_center = window.innerWidth / 2;
  var y_margin = window.innerWidth/20;
  canvas.style.marginLeft = (x_center - canvas.width / 2) +'px';
  canvas.style.marginTop = y_margin - canvas.height / 2 + 'px';

}

/**
Event listener functions
*/
window.addEventListener('load', grow_canvas, false);
window.addEventListener('resize', resize, false);
// canvas.onmouseover = function(){
//   if (transitioning == false){
//     transitioning = true;
//     grow_canvas();
//     small = false;
//   }
// }
// canvas.onmouseout = function(){
//   if (transitioning == false){
//     transitioning = true;
//     shrink_selector();
//     small = true;
//   }
// }
canvas.addEventListener('click', function(event){
  var canvas = document.getElementById('section_selector');
  var rect = canvas.getBoundingClientRect();  // abs. size of element
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  var center_x = canvas.width / 2;
  var center_y = canvas.height / 2;
  x = x - center_x;
  y = y - center_y;
  if (small == false){
    if (x <= 0 && Math.abs(y) < Math.abs(x)){
      current_section = 3;
    }
    if (x > 0 && Math.abs(y) < Math.abs(x)){
      current_section = 1;
    }
    if (y >= 0 && Math.abs(x) < Math.abs(y)){
      current_section = 2;
    }
    if (y < 0 && Math.abs(x) < Math.abs(y)){
      current_section = 0;
    }
    if (transitioning == false){
      transitioning = true;
      shrink_selector();
      small = true;
    }
  }
});

/**
Draw the section selector symbol. The size of the selector symbol is
with respect to the ratio of the width
*/
function draw_selector(ratio,current_section = 0){
  if (current_section == 1) {
    return;
  }
  var canvas = document.getElementById('section_selector');
  var context = canvas.getContext('2d');
  context.strokeStyle = '#000000';
  context.fillStyle = '#000000';
  context.beginPath();
  var x = canvas.width / 2;
  var y = canvas.height / 2;
  context.moveTo(x - x * ratio, y - x * ratio);
  context.lineTo(x + x *ratio, y + x *ratio);
  context.moveTo(x- x * ratio, y + x * ratio);
  context.lineTo(x + x * ratio, y - x * ratio);
  context.stroke();
}
/**
Draw the line divider between the selector and content.
*/
var drawing_step = 0;
var increasing_step = 0;
function draw_divider(ratio,step){
  var canvas = document.getElementById('section_selector');
  var context = canvas.getContext('2d');
  context.strokeStyle = '#000000';
  context.fillStyle = '#000000';
  context.beginPath();
    draw_selector(selector_ratio);
  var x = canvas.width / 2;
  var y = canvas.height / 2;
  var y_height = y + y * 0.9;
  var x1,x2,y1,y2,x_dist,y_dist = 0;
  context.clearRect(0,0,context.canvas.width,context.canvas.height);
  if (drawing_step ==0){
    increasing_step += 0.04;
    y1 = y_height - x * 0.3;
    y2 = y_height;
    x1 = x + x * 1/5;
    x2 = x - x * 1/10;
    x_dist = x2 - x1;
    y_dist = y2-y1;
    context.moveTo(x1, y1);
    context.lineTo(x1 + x_dist * increasing_step, y1 + y_dist * increasing_step);
    x1 = x-x * 1/5;
    x2 = x + x * 1/10;
    x_dist = x2-x1;
    context.moveTo(x1,y1);
    context.lineTo(x1 + x_dist * increasing_step,y1 + y_dist * increasing_step);
  }
  if (drawing_step == 1) {
    increasing_step += 0.08;
    context.moveTo( x + x * 1/5,y_height - x * 0.3);
    context.lineTo(x - x * 1/10,y_height);
    context.moveTo( x - x * 1/5,y_height - x * 0.3);
    context.lineTo(x + x * 1/10,y_height);
    y1 = y_height;
    y2 = y_height - x * 1/10;
    x1 = x - x * 1/10;
    x2 = x - x * 1/5;
    x_dist = x2 - x1;
    y_dist = y2-y1;
    context.moveTo(x1, y1);
    context.lineTo(x1 + x_dist * increasing_step, y1 + y_dist * increasing_step);
    x1 = x + x * 1/10;
    x2 = x + x * 1/5;
    x_dist = x2 - x1;
    context.moveTo(x1, y1);
    context.lineTo(x1 + x_dist * increasing_step, y1 + y_dist * increasing_step);
  }
  if (drawing_step == 2) {
    increasing_step += 0.06;
    context.moveTo( x + x * 1/5,y_height - x * 0.3);
    context.lineTo(x - x * 1/10,y_height);
    context.lineTo(x - x * 1/5,y_height - x * 1/10);
    context.moveTo( x - x * 1/5,y_height - x * 0.3);
    context.lineTo(x + x * 1/10,y_height);
    context.lineTo(x + x * 1/5,y_height - x * 1/10);
    y1 = y_height - x * 1/10;
    y2 = y_height;
    x1 = x - x * 1/5;
    x2 = x - x * 0.3;
    x_dist = x2 - x1;
    y_dist = y2-y1;
    context.moveTo(x1, y1);
    context.lineTo(x1 + x_dist * increasing_step, y1 + y_dist * increasing_step);
    x1 = x + x * 1/5;
    x2 = x + x * 0.3;
    x_dist = x2 - x1;
    context.moveTo(x1, y1);
    context.lineTo(x1 + x_dist * increasing_step, y1 + y_dist * increasing_step);
  }
  if (drawing_step == 3)  {
    increasing_step += 0.05;
    context.moveTo( x + x * 1/5,y_height - x * 0.3);
    context.lineTo(x - x * 1/10,y_height);
    context.lineTo(x - x * 1/5,y_height - x * 1/10);
    context.lineTo(x - x * 0.3,y_height);
    context.moveTo( x - x * 1/5,y_height - x * 0.3);
    context.lineTo(x + x * 1/10,y_height);
    context.lineTo(x + x * 1/5,y_height - x * 1/10);
    context.lineTo(x + x * 0.3,y_height);
    y1 = y_height;
    y2 = y_height;
    x1 = x - x * 0.3;
    x2 = x - x * 0.9;
    x_dist = x2 - x1;
    y_dist = y2-y1;
    context.moveTo(x1, y1);
    context.lineTo(x1 + x_dist * increasing_step, y1 + y_dist * increasing_step);
    x1 = x + x * 0.3;
    x2 = x + x * 0.9;
    x_dist = x2 - x1;
    context.moveTo(x1, y1);
    context.lineTo(x1 + x_dist * increasing_step, y1 + y_dist * increasing_step);
  }
  context.stroke();
  if (drawing_step >= 4){
    cancelAnimationFrame;
      transitioning = false;
    context.moveTo( x + x * 1/5,y_height - x * 0.3);
    context.lineTo(x - x * 1/10,y_height);
    context.lineTo(x - x * 1/5,y_height - x * 1/10);
    context.lineTo(x - x * 0.3,y_height);
    context.lineTo(x - x * 0.9,y_height);
    context.moveTo( x - x * 1/5,y_height - x * 0.3);
    context.lineTo(x + x * 1/10,y_height);
    context.lineTo(x + x * 1/5,y_height - x * 1/10);
    context.lineTo(x + x * 0.3,y_height);
    context.lineTo(x + x * 0.9,y_height);
    context.stroke();
  }
  else{
    if (increasing_step > 1){
      increasing_step = 0;
      drawing_step += 1;
    }
      transitioning = true;
    requestAnimationFrame(draw_divider);
  }
}

/**
The grow_canvas effect of the section selector
*/
function grow_canvas(){
  var canvas = document.getElementById('section_selector');
  var height = canvas.height * (1 + window.innerWidth / (canvas.height * 50));
  if (height >= window.innerWidth / 2.2) {
    cancelAnimationFrame;
    transitioning = false;
  }
  else {
    canvas.width = window.innerWidth * 46/100;
    canvas.height = height;
    canvas.style.height = height+'px';
    var x_center = window.innerWidth / 2;
    var y_margin =  window.innerWidth/20;
    canvas.style.marginLeft = (x_center - canvas.width / 2) +'px';
    canvas.style.marginTop = y_margin - canvas.height / 2 + 'px';
    draw_selector(0.9);
      transitioning = true;
    requestAnimationFrame(grow_canvas);
    const element = document.getElementById('section_selector');
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2);
    window.scrollTo(0, 1920);
  }
}

var selector_ratio = 0.9;
var curr_rotation_degree = 0;
var original_rotation_degree = 0;
/**
Shink the selector_ratio*/
function shrink_selector(){
  var canvas = document.getElementById('section_selector');
  var context = canvas.getContext('2d');
  if (selector_ratio <= 0.1){
    transitioning = false;
    cancelAnimationFrame;
    shrink_canvas();
  }
  else{
  transitioning = true;
  context.clearRect(0,0,context.canvas.width,context.canvas.height);
  context.save();
  context.translate(canvas.width/2,canvas.height/2);
  context.strokeStyle = '#000000';
  context.fillStyle = '#000000';
  context.beginPath();
  var x = canvas.width / 2;
  var y = canvas.height / 2;
  context.moveTo(- x * selector_ratio, - x * selector_ratio);
  context.lineTo(x *selector_ratio, x *selector_ratio);
  context.moveTo(-x * selector_ratio, x * selector_ratio);
  context.lineTo(x * selector_ratio, -x * selector_ratio);
  context.stroke();
  context.restore();
  selector_ratio -= 0.03;
  requestAnimationFrame(shrink_selector);
  }
}

/**
Shrink the canvas. Activiated after selector is shirinked
*/
function shrink_canvas(){
  var canvas = document.getElementById('section_selector');
  var context = canvas.getContext('2d');
  var height = canvas.height * 0.97;
  if (height <= window.innerWidth /6) {
    context.clearRect(0,0,context.canvas.width,context.canvas.height);
    cancelAnimationFrame;
    transitioning = false;
    draw_divider();
  }
  else {
    canvas.width = window.innerWidth * 46/100;
    canvas.height = height;
    canvas.style.height = height+'px';
    var x_center = window.innerWidth / 2;
    var y_margin =  window.innerWidth/20;
    canvas.style.marginLeft = (x_center - canvas.width / 2) +'px';
    canvas.style.marginTop = y_margin - canvas.height / 2 + 'px';

    context.clearRect(0,0,context.canvas.width,context.canvas.height);
    context.save();
    context.translate(canvas.width/2,canvas.height/2);
    var speed = (current_section * Math.PI /2  - original_rotation_degree) / 30;
    if (current_section == 3){
      speed = ( -Math.PI /2  - original_rotation_degree) / 30;
    }
    curr_rotation_degree = curr_rotation_degree + speed;
    if (curr_rotation_degree >= current_section * Math.PI /2){
      curr_rotation_degree = current_section  * Math.PI /2;
    }
    context.rotate(curr_rotation_degree);
    context.strokeStyle = '#000000';
    context.fillStyle = '#000000';
    context.beginPath();
    var ratio = 0.1;
    var x = canvas.width / 2;
    var y = canvas.height / 2;
    context.moveTo(- x * ratio, - x * ratio);
    context.lineTo(x *ratio, x *ratio);
    context.moveTo(-x * ratio, x * ratio);
    context.lineTo(x * ratio, -x * ratio);
    context.stroke();
    context.restore();
    transitioning = true;
    requestAnimationFrame(shrink_canvas);
  }
}
