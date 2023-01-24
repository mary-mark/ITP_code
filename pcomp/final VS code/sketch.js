// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "de777100-22f4-11eb-adc1-0242ac120002";
let myCharacteristic;
let myValue = 0;
let myBLE;
let incoming_data = []
let n_samples = 1;

let sample_counter = 0;
let bluetoothConnected = false;

// EXTRA CODEn TO BE DELETED AFTER ML
let handIsNotUp = true;
let handIsNotDown = true;
let noPunch = true;
let tapped = false;
let slowDown = false;
let spedUp = false;
let clapped = false;
let still = false;
let still2 = false;
let clapStill =0;
let clapTime = 0;


// THE FOLLOWING ARE VISUALIZATION VARIABLES
let xoff = 0;
let yoff = 0;
let zoff = 0;
let xscale_i = 0.05;
let yscale_i = 0.05;
let zscale_i = 0.0005;
let xscale = xscale_i;
let yscale = yscale_i;
let zscale = zscale_i;
let n_PIs_i = 2;
let n_PIs = n_PIs_i;
let vMag_i = 0.5;
let vMag = vMag_i;

let xoff_i;
let yoff_i;
let xoff_r;
let yoff_r;
let xscale_r = 0.01;
let yscale_r = 0.01;

let counter_x = 0;
let counter_y = 0;
let counter_speed = 0;

let scl = 200;
let cols, rows;
let background_a = 0.5;
let background_sub = 0;

let fr;

let controlRandom = "p";

var particles = [];
let nParticlesToAdd_i = 10;
let nParticlesToAdd = 200;
let flowfield = [];


function setup() {

  // Create a p5ble class
  myBLE = new p5ble();

  // createCanvas(400, 400);
  // textSize(20);
  // textAlign(CENTER, CENTER);

  // Create a 'Connect' button
  const connectButton = createButton('Connect')
  connectButton.mousePressed(connectToBle);
}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  console.log('I connected to bluetooth')
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);
  myCharacteristic = characteristics[0];
  // for(let i = 0; i<characteristics.length;i++){
    
   myBLE.startNotifications(myCharacteristic,readChar,'string')
  // }
  // Read the value of the first characteristic
  //myBLE.read(myCharacteristic, 'string',gotValue);

  // THIS IS THE VISUALIZATION
  createCanvas(windowWidth, windowHeight);

  //createCanvas(400, 400);

  cols = floor(width / scl);
  rows = floor(height / scl);

  pixelDensity(1);
  xoff_i = random(100);
  yoff_i = random(100);
  xoff_r = xoff_i;
  yoff_r = yoff_i;
  
  //frameRate(25);
  //fr = createP("");

  flowfield = new Array(cols * rows);

  background(255-background_sub);
  
}

// A function that will be called once got values
function gotValue(error, value) {
  if (error) console.log('error: ', error);
  console.log('value: ', value);
  myValue = value;
  // After getting a value, call p5ble.read() again to get the value again
  myBLE.read(myCharacteristic, 'string',gotValue);
  // You can also pass in the dataType
  // Options: 'unit8', 'uint16', 'uint32', 'int8', 'int16', 'int32', 'float32', 'float64', 'string'
  // myBLE.read(myCharacteristic, 'string', gotValue);
}

function readChar(data){
  bluetoothConnected = true
  myValue = data;
  //console.log('data:',data)
  if (sample_counter==n_samples){
    incoming_data = []
    sample_counter = 0
  }
  if(myValue){
  parseData(myValue)
  }
  checkForControlMoves(incoming_data);
 // myBLE.startNotifications(myCharacteristic,readChar,'string')
}

function parseData(str){
  let temp_str_array = splitTokens(str,',');
  let temp_array = []
  for(el in temp_str_array){
    temp_array.push(parseFloat(temp_str_array[el]))
  }
  incoming_data.push(temp_array)
  sample_counter++
  //console.log(incoming_data)
}


function draw() {
  // THIS IS DEBUGGING CODE
  // if(myValue || myValue === 0){
  //   background(myValue, 255, 255);
  //   // Write value on the canvas
  //   text(myValue, 100, 100);
  //}

  // THIS IS THE SKETCH
  if(bluetoothConnected==true){
      if (frameCount % 10 == 0) background(255-background_sub, background_a);
      if (0) {
        xscale_r = random(0.005, xscale_r);
        yscale_r = random(0.005, yscale_r);
        //      xscale_r = random(0.005,0.01);
        //yscale_r = random(0.005,0.01);
        //    xscale = random(0.0099,0.0101);
        //  yscale = random(0.0099,0.0101);
      }
    
      xoff = 0 + counter_x;
      xoff_r = xoff_i + counter_x;
    
      for (var x = 0; x < cols; x++) {
        yoff = 0 + counter_y;
        yoff_r = yoff_i + counter_y;
        for (var y = 0; y < rows+1; y++) {
          var index = (x + y * cols) * 4;
          var index_vector = x + y * cols;
    
          // var r = noise(xoff_r, yoff_r) * 255;
          //var per_n = noise(xoff, yoff) * 255;
          var angle = noise(xoff, yoff, zoff) * TWO_PI * n_PIs;
          if (controlRandom === "d") {
            angle = noise(xoff, yoff, zoff) * TWO_PI * random(-n_PIs, n_PIs);
          }
          var v = p5.Vector.fromAngle(angle);
          v.setMag(vMag);
          flowfield[index_vector] = v;
    
          // let fill_color= color(r,per_n,per_n,255);
          stroke(0, 50);
          strokeWeight(1);
          push();
          translate(x * scl, y * scl);
          rotate(v.heading());
          //line(0, 0, scl, 0);
          pop();
          //rect(x*scl,y*scl,scl,scl)
          yoff += yscale;
          yoff_r += yscale_r;
        }
        xoff += xscale;
        xoff_r += xscale_r;
        zoff += zscale;
      }
      // counter_x += random(counter_speed);
      // counter_y += random(counter_speed);
    
      for (let i = 0; i < particles.length; i++) {
        particles[i].follow(flowfield, controlRandom);
        particles[i].update();
        particles[i].edges();
        particles[i].show(background_sub);
      }
    
      //fr.html(floor(frameRate()));
  
  }
}

function checkForControlMoves(data){
  let up_thresh = 19;
  let prevHand = handIsNotUp;
  if(data[data.length-1][1]>up_thresh){
    handIsNotUp = false;
  }
  else handIsNotUp = true;

  if(prevHand == true && handIsNotUp == false){
    controlRandom = "w";
    console.log("I WENT UP");
    checkControlChanges()
  }

  let down_thresh = -16;
  let prevDownHand = handIsNotDown;
  if(data[data.length-1][2]<down_thresh){
    handIsNotDown = false;
  }
  else handIsNotDown = true;

  if(prevDownHand == true && handIsNotDown == false){
    controlRandom = "s";
    console.log("I WENT DOWN");
    checkControlChanges()
  }
 
  let punch_thresh = -17;
  //console.log(data[data.length-1][0])
  let prevNoPunch = noPunch;
  if(data[data.length-1][0]<punch_thresh){
    noPunch = false;
  }
  else noPunch = true;

  if(prevNoPunch == true && noPunch == false){
    controlRandom = "c";
    console.log("SHAKE IT UP");
    checkControlChanges()
  }


  let prevTapped= tapped;
  if(data[data.length-1][9]==1){
    tapped = true;
  }
  else tapped = false;

  if(tapped == true && prevTapped == false){
    controlRandom = "=";
    console.log("I ADDED PARTICLES", particles.length);
    checkControlChanges();
  }

  let clap_thresh = -12.5;
  let prevClap= clapped;


  if(still >14){ 
    clapStill = 1;
    clapTime = millis();
  }
  else{
    if(clapTime-millis()>20) clapStill =0;
  }

  if(data[data.length-1][2]< clap_thresh && data[data.length-1][0]>3.5 && clapStill ==1){
    console.log(still,int(data[data.length-1][0]), int(data[data.length-1][1]),int(data[data.length-1][2]))
    clapped= true;
    clapStill =0;
  }
  else clapped = false;

  if(clapped == true && prevClap == false){
    controlRandom = "q";
    console.log("");
    checkControlChanges();
  }

  let spedUpThresh = 2000
  let prevSpedUp= spedUp;
  if(data[data.length-1][5]>spedUpThresh){
    spedUp = true;
  }
  else spedUp = false;

  if(spedUp == true){// && prevSpedUp == false){
    controlRandom = "d";
    console.log("I SPED UP");
    checkControlChanges();
  } 

  let slowDownThresh = 2000;
  let prevSlowDown= slowDown;
  if(data[data.length-1][6]>slowDownThresh){
    slowDown = true;
  }
  else slowDown = false;

  if(slowDown == true){// && prevSlowDown == false){
    controlRandom = "a";
    console.log("I SLOWED DOWN");
    checkControlChanges();
  }

 
  if(data[data.length-1][1]<-8){
    still ++;
    //console.log("still ",still)
  }
  else still = 0;

  if(still > 23 && still % 4 == 0){// && prevSlowDown == false){
    controlRandom = "-";
    console.log("I REMOVED PARTICLES", particles.length);
    checkControlChanges();
  }

  if(data[data.length-1][0]>8){
    still2 ++;
  }
  else still2 = 0;

  if(still2 > 15){// && prevSlowDown == false){
    controlRandom = "p";
    console.log("PERLIN FLOW");
    checkControlChanges();
  }



  //console.log(int(data[data.length-1][3]), int(data[data.length-1][4]),int(data[data.length-1][5]),int(data[data.length-1][6]))

  
}


function keyTyped() {
  let controlKeys = [
    "P",
    "p",
    "C",
    "c",
    "Q",
    "q",
    "W",
    "w",
    "A",
    "a",
    "D",
    "d",
    "S",
    "s",
    "R",
    "r",
    "+",
    "=",
    "-",
    "_",
  ];

  if (controlKeys.includes(key)) {
    controlRandom = key;
    checkControlChanges();
  }
}

function checkControlChanges() {
  if (controlRandom == "p" || controlRandom == "P") {
    background(255 - background_sub, 10);
    controlRandom = "p";
    background_a = 5;
    xscale = xscale_i;
    yscale = yscale_i;
    zscale = zscale_i;
    vMag = vMag_i;
    n_PIs = n_PIs_i;
  }

  if (controlRandom == "c" || controlRandom == "C") {
    controlRandom = "c";
    background_a = 10;
    xscale = 0.15;
    yscale = 0.15;
    zscale = 0.009;
    vMag = 20;
    n_PIs = 6;
  }

  if (controlRandom == "r" || controlRandom == "R") {
    controlRandom = "r";
    background_a = 20;
    zscale = zscale_i;
    vMag = vMag_i;
  }

  if (controlRandom == "d" || controlRandom == "D") {
    background(255 - background_sub, 10);
    controlRandom = "d";

    for (let i = 0; i < particles.length; i++) {
      particles[i].updateSpeed(1);
    }
    // background_a = 5;
    // xscale = xscale_i;
    // yscale = yscale_i;
    // zscale = zscale_i;
    // vMag = vMag_i;
    // n_PIs = 0.5;
  }

  if (controlRandom == "a" || controlRandom == "A") {
    background(255 - background_sub, 10);
    controlRandom = "a";
    for (let i = 0; i < particles.length; i++) {
      particles[i].updateSpeed(-1);
    }
  }

  if (controlRandom == "s" || controlRandom == "S") {
    background(255 - background_sub, 10);
    controlRandom = "s";
    background_a = 5;
    xscale = xscale_i;
    yscale = yscale_i;
    zscale = zscale_i;
    vMag = vMag_i;
    n_PIs = 0.5;
  }
  if (controlRandom == "w" || controlRandom == "W") {
    background(255 - background_sub, 10);
    controlRandom = "p";
    background_a = 5;
    xscale = xscale_i;
    yscale = yscale_i;
    zscale = zscale_i;
    vMag = vMag_i;
    n_PIs = -0.5;
  }

  if (controlRandom === "q" || controlRandom === "Q") {
    background_sub = abs(background_sub - 255);
    background(255 - background_sub);
  }

  if (controlRandom == "+" || controlRandom == "=") {
    addParticles();
  }
  if (controlRandom == "-" || controlRandom == "_") {
    removeParticles();
  }
}
function addParticles() {
  if (particles.length < 2500) {
    for (i = 0; i < nParticlesToAdd_i; i++) {
      particles.push(new Particle());
    }
    nParticlesToAdd_i = nParticlesToAdd;
  }
}

function removeParticles() {
  particles.splice(particles.length - nParticlesToAdd_i, nParticlesToAdd_i);
  background(255 - background_sub, 10);
}
