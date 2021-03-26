const app = new PIXI.Application({
  backgroundColor: 0x1099bb,
  width: 600,
  height: 400
});

//append boids.js to any element named "boids" on the page
document.getElementsByName("boids")[0].appendChild(app.view);

//variables that define the system
numBoids = 25;
sensDist = 50;
//control gains
var kp = 0.1; //control gain on total u(t)
var kn = 0.5; //neighbor influence
var kv = 0.5; //potential field influence

//sliders and other control bits
 var horizonSlider = document.getElementById("horizon");
 var knkvSlider = document.getElementById("knkv");


horizonSlider.oninput = function() {
  sensDist = this.value;
  for (var i = 0; i < numBoids; i++) {
    sensing[i].clear();
    sensing[i].lineStyle(2, 0xffffff);
    sensing[i].arc(0, 0, sensDist, 0, 2*Math.PI);// cx, cy, radius, startAngle, endAngle
  }
}

knkvSlider.oninput = function() {
  kn = this.value / 100.0;
  kv = 1 - kn;
}


var boids = [];
var vel = [];
var vmax = 1;

var sensing = [];


for (var i = 0; i < numBoids; i++) {
    //create sensing circles
    sensing[i] = new PIXI.Graphics();
    sensing[i].lineStyle(2, 0xffffff);
    sensing[i].arc(0, 0, sensDist, 0, 2*Math.PI);// cx, cy, radius, startAngle, endAngle

    app.stage.addChild(sensing[i]);
}


for (var i = 0; i < numBoids; i++) {

    boids[i] = PIXI.Sprite.from('images/boid.png');
    // set anchor point
    boids[i].anchor.set(0.33, 0.5);
    // move the sprite to the center of the screen and give it a random orientation
    boids[i].x = Math.random()*app.screen.width;
    boids[i].y = Math.random()*app.screen.height;

    vel[i] = [(Math.random() - 0.5)*2*vmax, (Math.random() - 0.5)*2*vmax,]


    boids[i].rotation = Math.atan2(vel[i][1], vel[i][0])

    //add it to the canvas
    app.stage.addChild(boids[i]);

    //set position of sensing circles
    sensing[i].position = {x: boids[i].x, y: boids[i].y};

}

//draw a box around the app to hide the popping a little bitmap
var border = new PIXI.Graphics();
lw = 8;
border.lineStyle(lw, 0x000000, 1); // width, color, alpha
border.drawRect(lw/2, lw/2, app.screen.width-lw, app.screen.height-lw);

app.stage.addChild(border);


/* Define the helper potential function */
function potential(r) {
  var rDes = sensDist / 2;
  var d = r - rDes; //0 means we're at the right spot

  //if we're too close
  if (d < -0.01) {
    return -1 * d * d * 0.5;
  }
  else if (d > 0.01) { //if we're too far
    return d * 0.001;
  }
  else {
    return 0;
  }
}




// Listen for animate update
app.ticker.add((delta) => {

    //calculate a vector of new rotations
    var u = [];

    for (var i = 0; i < boids.length; i++) {
        u[i] = [0, 0];
        for (var j = 0; j < boids.length; j++) {
            //check if we're in range of the neighborhood
            dx = boids[i].x-boids[j].x;
            dy = boids[i].y-boids[j].y;
            dist = Math.sqrt( dx*dx + dy*dy);
            if ( dist <= sensDist) {
              //velocity matching
              u[i][0] += kn*(vel[i][0] - vel[j][0]);
              u[i][1] += kn*(vel[i][1] - vel[j][1]);
              //potential field cohesion + collision aboidance
              pF = potential(dist) * kv;
              angle = Math.atan2(dy, dx);
              u[i][0] += pF * Math.cos(angle);
              u[i][1] += pF * Math.sin(angle);
            }
        }
    }

    // delta is 1 if running at 100% performance
    for (var i = 0; i < boids.length; i++) {
      //do the control input part to get the new vx, vy

      vel[i][0] -= kp*u[i][0];
      vel[i][1] -= kp*u[i][1];

      vel[i][0] = Math.min( Math.max(-vmax, vel[i][0]), vmax);
      vel[i][1] = Math.min( Math.max(-vmax, vel[i][1]), vmax);


      boids[i].rotation = Math.atan2(vel[i][1], vel[i][0])

      boids[i].x += vel[i][0] * delta;
      boids[i].y += vel[i][1] * delta;

      //wrap to the screen bounds
      if (boids[i].x > app.screen.width) {
          boids[i].x -= app.screen.width;
      }
      if (boids[i].x < 0) {
          boids[i].x += app.screen.width;
      }
      if (boids[i].y > app.screen.height) {
          boids[i].y -= app.screen.height;
      }
      if (boids[i].y < 0) {
          boids[i].y += app.screen.height;
      }

      //put the sensing circle on the boids
      sensing[i].position = {x: boids[i].x, y: boids[i].y};


    }

});
