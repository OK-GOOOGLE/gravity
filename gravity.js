
// var fps, fpsInterval, startTime, now, then, elapsed;
// fps = 60;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var G = 10e-1;
var running = undefined; // flag to check if the simulation is running (prevents multiple animations at the same time).
var startInteraction = false; // if this flag is false - draw only bodies itself (without calculating their accelerations)
var speed = 1;

var isMousePressed = false;

var
    cursorX = 0,
    cursorY = 0,
    scaleX, scaleY;
var preCursorX, preCursorX; // store coordinates at the moment of 'mousedown'
var rect = canvas.getBoundingClientRect();
var correctX = Math.floor(rect.left);
var correctY = Math.floor(rect.top);

function correctXY(){
    rect = canvas.getBoundingClientRect();
    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
}

function Body(id, x, y, r, m, vx, vy) {
   this.x = x;
   this.y = y;
   this.r = r;
   this.r_canvas = r; // scaling effect
   this.m = m;
   this.vx = vx;
   this.vy = vy;
   this.ax = 0.0;
   this.ay = 0.0;
   this.id = id;    //  for ignoring current body when calculating resultant force
   this.x_canvas = x; // scaling effect
   this.y_canvas = y; // scaling effect
   this.vx_canvas
};
var bodies = [];


function hasMin(attrib) {
    return bodies.reduce(function(prev, curr){ 
        return prev[attrib] < curr[attrib] ? prev : curr; 
    });
 }
function hasMax(attrib) {
    return bodies.reduce(function(prev, curr){ 
        return prev[attrib] > curr[attrib] ? prev : curr; 
    });
 }

function setNormCanvasCoord () {
    for (var i = 0; i < bodies.length; i++){
        bodies[i].x_canvas = bodies[i].x;
        bodies[i].y_canvas = bodies[i].y;
        bodies[i].r_canvas = bodies[i].r;
    }
}

Body.prototype.updatePos = function() {
          this.x += this.vx;
          this.y += this.vy;
          this.vx += this.ax;
          this.vy += this.ay;
};
Body.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc((this.x_canvas), (this.y_canvas), this.r, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
};

function rescale(xmax, ymax, xmin, ymin){
    for (var i = 0; i < bodies.length; i++){
        bodies[i].x_canvas = canvas.width * (bodies[i].x - xmin) / (xmax - xmin);
        bodies[i].y_canvas = canvas.height * (bodies[i].y - ymin) / (ymax - ymin);
        bodies[i].r_canvas = bodies[i].r * (xmax - xmin) * (ymax - ymin);
    }
}

function updateBodiesAcceler(){
  for (var i = 0; i < bodies.length; i++){ 
        bodies[i].ax = 0.0;
        bodies[i].ay = 0.0;
  }

  for (var cur = 0; cur < bodies.length; cur++){ // For each body ...

    for (var i = 0; i < bodies.length; i++){     // ... calculate resulting acceleration ...
      if (typeof bodies[cur] == "undefined") continue; // ... avoiding situation in which the current body was merged ...
      if(Math.abs(bodies[cur].x) > 5000 ||  Math.abs(bodies[cur].y) > 5000){ 
            bodies.splice(cur, 1);
            continue; // if body is far beyond the canvas
          }
      if (i != cur){                             // ... and not considering the current one 
        var distBase = (bodies[i].x - bodies[cur].x)*(bodies[i].x - bodies[cur].x) + (bodies[i].y - bodies[cur].y)*(bodies[i].y - bodies[cur].y);
        var dist = Math.sqrt(distBase);
        
        if (dist > bodies[cur].r){ 
            bodies[cur].ax += G * bodies[i].m * (bodies[i].x - bodies[cur].x) / Math.pow(dist, 3);
            bodies[cur].ay += G * bodies[i].m * (bodies[i].y - bodies[cur].y) / Math.pow(dist, 3);  
        }
        else /*if collision detected*/{
            bodies[cur].m += bodies[i].m;
            if (bodies[cur].r > bodies[i].r)
              bodies[cur].r += Math.pow(bodies[i].r, 1/3);
            else
              bodies[cur].r = bodies[i].r + Math.pow(bodies[cur].r, 1/3);
            
            // bodies[cur].ax = 0.0;
            // bodies[cur].ay = 0.0;
            bodies[cur].vx = 0.0;
            bodies[cur].vy = 0.0;
            bodies.splice(i, 1);
        }          
      }
    }
  }
}
function bodyVectorOnHold(){
  if (isMousePressed){

      ctx.beginPath();

      ctx.moveTo(preCursorX, preCursorY);
      ctx.strokeStyle = 'white';
      ctx.lineTo(cursorX, cursorY);
      ctx.stroke();

      // ctx.moveTo(cursorX, cursorY);
      var tempBody = new Body(0, preCursorX, preCursorY, 10, 0, 0, 0);
      tempBody.draw();
    }
}

function drawOnCanvas(){
    running = undefined;
    if (startInteraction){ 
      var date = new Date();
      // ctx.clearRect(0, 0, 1000, 1000);
      if (bodies.length > 0) {
      var xmax = hasMax('x').x;
      var ymax = hasMax('y').y;
      var xmin = hasMin('x').x;
      var ymin = hasMin('y').y;
      }

      // if (xmax > 1000 || xmin < 0 || ymax > 1000 || ymin < 0)
      //     rescale(xmax, ymax, xmin, ymin);
      // else 
          setNormCanvasCoord();


      /* before changing bodies' velocities we have to calculate their acceleration*/
      for(var k = 0; k <= speed; k++){ // speed
        updateBodiesAcceler(); 
        for (var i = 0; i < bodies.length; i++){
            bodies[i].updatePos();
        }
      }

      
    }
    
    // var text  = isMousePressed + " govno";
    // var text2 = bodies[1].x_canvas +" " + bodies[1].y_canvas+";; "+bodies[1].x +" " + bodies[1].y;
    // var text3 = bodies[2].x_canvas +" " + bodies[2].y_canvas;
    // var text4 = " xmax : " + xmax + " xmin: " + xmin + " ymax: " + ymax + " ymin: " + ymin;
    // document.getElementById("demo").innerHTML = text; 
    // document.getElementById("demo2").innerHTML = text2; 
    // document.getElementById("demo3").innerHTML = text3; 
    // document.getElementById("demo4").innerHTML = text4; // debugging
    
    for (var i = 0; i < bodies.length; i++){
          bodies[i].draw();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    bodyVectorOnHold(); // visualize the initial velocity of a new body
    updateTextInfo();
    startSimulation(); // loop the animation
}



function updateTextInfo(){
  document.getElementById("speed").innerHTML = "Speed " + speed;
  document.getElementById("numOfBodies").innerHTML ="Number of Bodies " + bodies.length;
}

function startSimulation() {
  if (!running){ 
    running = window.requestAnimationFrame(drawOnCanvas);
   }
}

function fadeOnReset(k){
  if (k < 20){
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    k++;
    var fading = window.requestAnimationFrame(function(){fadeOnReset(k);});
  }
  else 
    window.cancelAnimationFrame(fading);
}

function reset(){
  // if (running){
    window.cancelAnimationFrame(running);
    
    bodies = [];
    running = undefined;
    startInteraction = false;
    updateTextInfo();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    window.requestAnimationFrame(function(){fadeOnReset(0);});
  // }
}


function generateRandBodies(){
  for (var i = 0; i <= 30; i++){
    var newBody = new Body(bodies.length, Math.floor(Math.random() * canvas.width),
                                          Math.floor(Math.random() * canvas.height), 10, 100, 
                                          Math.random() - 0.5, 
                                          Math.random() - 0.5);
    bodies.push(newBody);
  }    
  startSimulation();
}


/* EVENTS */

$("#help").click(function(){
                            document.getElementById("firstDropDown").classList.toggle("show");
                            });

$("#start").click(function(){
                              startInteraction = true;
                              startSimulation();
                            });

$("#reset").click(reset); // #... = id selector

$("canvas").mousemove(function(e) {
    cursorX = (e.clientX - rect.left) * scaleX;
    cursorY = (e.clientY - rect.top) * scaleY;
});

$("#generate").click(generateRandBodies); // #... = id selector

/*MOUSEDOWN: drawing a line representing the velocity of a new body*/
$("canvas").mousedown(function(e) {
    rect = canvas.getBoundingClientRect();
    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
    preCursorX = (e.clientX - rect.left) * scaleX;
    preCursorY = (e.clientY - rect.top) * scaleY;
    isMousePressed = true;
    startSimulation();
});

$("canvas").mouseup(function(e) {
    var newVX = (cursorX - preCursorX) / 100.0;
    var newVY = (cursorY - preCursorY) / 100.0;
    var newBody = new Body(bodies.length, preCursorX, preCursorY, 10, 100, newVX, newVY);
    bodies.push(newBody);

    updateBodiesAcceler();
    for (var i = 0; i < bodies.length; i++){
          bodies[i].draw();
    }

    isMousePressed = false;
    document.getElementById("numOfBodies").innerHTML = "Number of Bodies " + bodies.length;
});

$(document).keydown(function(e) {
    if (e.keyCode == 38){ // arrow up
        speed++;
    } else 
    if (e.keyCode == 40){ // arrow down
      if (speed > 1)
        speed--;
    }
    updateTextInfo();
});



updateTextInfo();
correctXY(); // correct mouse position



