function Particle() {
  this.pos = createVector(random(width), random(height));
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.maxspeed = 3;
  this.prevPos = this.pos.copy();
  this.stroke_weight_i = 3;
  this.stroke_weight = this.stroke_weight_i;
  

  this.update = function () {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  };

  this.applyForce = function (force) {
    this.acc.add(force);
  };

  this.follow = function (vectors,controlRandom) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    
    if(controlRandom === 'r') {
      var force = createVector(random(-1,1),random(-1,1))
      this.stroke_weight = this.stroke_weight_i*1.5;
    }
    
    else{
      var force = vectors[index];
      if (controlRandom === 'c') this.stroke_weight = this.stroke_weight_i*1.5;
      else this.stroke_weight = this.stroke_weight_i;
    }
    this.applyForce(force);
  };

  this.show = function (background_sub) {
    stroke(background_sub, 10);
    strokeWeight(this.stroke_weight);
    

    //point(this.pos.x,this.pos.y);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  };

  this.updatePrev = function () {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  };
  this.edges = function () {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  };
  
  this.updateSpeed = function(sign){
    this.maxspeed = this.maxspeed +sign* 1;
    this.maxspeed = max(0.1,min(this.maxspeed,15))
  }
}
