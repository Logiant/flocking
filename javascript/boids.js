const app = new PIXI.Application({ backgroundColor: 0x1099bb });

//append boids.js to any element named "boids" on the page
document.getElementsByName("boids")[0].appendChild(app.view);

numBoids = 25;
sensDist = 50;

var boids = [];
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
    boids[i].anchor.set(0.5, 0.66);
    // move the sprite to the center of the screen and give it a random orientation
    boids[i].x = Math.random()*app.screen.width;
    boids[i].y = Math.random()*app.screen.height;
    boids[i].rotation = Math.random() * 2 * Math.PI
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

// Listen for animate update
app.ticker.add((delta) => {

    //calculate a vector of new rotations
    var newRots = [];
    for (var i = 0; i < boids.length; i++) {
        newRots[i] = 0;
        var counter = 0;
        for (var j = 0; j < boids.length; j++) {

            if ( (boids[i].x-boids[j].x)**2 + (boids[i].y - boids[j].y)**2 <= sensDist * sensDist) {
                counter++;
                newRots[i] += boids[j].rotation;
            }
        }
        newRots[i] /= counter;
    }


    // delta is 1 if running at 100% performance
    for (var i = 0; i < boids.length; i++) {
        sensing[i].position = {x: boids[i].x, y: boids[i].y};

        boids[i].rotation = newRots[i];

        boids[i].x += 1 * delta * Math.cos(boids[i].rotation);
        boids[i].y += 1 * delta * Math.sin(boids[i].rotation);

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


    }

});
