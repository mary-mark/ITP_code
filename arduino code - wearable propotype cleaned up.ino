
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_LIS3DH.h>
#include <Adafruit_Sensor.h>
#include <ArduinoBLE.h>
#include <CapacitiveSensor.h>

CapacitiveSensor cs_3_21 = CapacitiveSensor(12, 16);  // 10M resistor between pins 4 & 2, pin 2 is sensor pin, add a wire and or foil if desired
CapacitiveSensor cs_3_20 = CapacitiveSensor(12, 15);


Adafruit_LIS3DH lis = Adafruit_LIS3DH();

//use tap
#define CLICKTHRESHHOLD 125

// Define button pins
//int rightArmUpPin = 2;
//int rightArmSmoothCirclePin = 3;
//int rightArmUpValue = 1;
//int rightArmSmoothValue = 1;
int print_flag = 0;
int tapped = 0;
long cap_total1 = 0;
long cap_total2 = 0;
long prev_cap_total1 = 0;
long prev_cap_total2 = 0;
int speed_up_thresh = 4000;//14000;
int slow_down_thresh = 3000;//16000;


const int readingLength = 50;
// string for readings:
String readingString;

// Define bluetooth service
BLEService accelService("DE777100-22F4-11EB-ADC1-0242AC120002");  // create service
BLECharacteristic stringCharacteristic("DE777101-22F4-11EB-ADC1-0242AC120002", BLERead | BLENotify, readingLength);



void setup(void) {
  cs_3_20.set_CS_AutocaL_Millis(0xFFFFFFFF);  // turn off autocalibrate on channel 1 - just as an example
  cs_3_21.set_CS_AutocaL_Millis(0xFFFFFFFF);  // turn off autocalibrate on channel 1 - just as an example
  
  cs_3_21.set_CS_Timeout_Millis(100);  // turn off autocalibrate on channel 1 - just as an example
  cs_3_20.set_CS_Timeout_Millis(100);  // turn off autocalibrate on channel 1 - just as an example
 
  //Serial.begin(9600);
  //while (!Serial) delay(10);     // will pause Zero, Leonardo, etc until serial console opens

  //if(print_flag) Serial.println("LIS3DH test!");

  if (!lis.begin(0x18)) {  // change this to 0x19 for alternative i2c address
    // if(print_flag) Serial.println("Couldnt start");
    while (1) yield();
  }
  //if(print_flag) Serial.println("LIS3DH found!");

  // lis.setRange(LIS3DH_RANGE_4_G);   // 2, 4, 8 or 16 G!

  //  if(print_flag) Serial.print("Range = ");
  //  if(print_flag) Serial.print(2 << lis.getRange());
  // if(print_flag)  Serial.println("G");

  lis.setClick(1, CLICKTHRESHHOLD);

  // SET UP BLUETOOTH
  // begin initialization
  if (!BLE.begin()) {
    // if(print_flag)    Serial.println("starting BLE failed!");
    while (true)
      ;
  }

  // set the local name peripheral advertises
  BLE.setLocalName("ACCEL_BLE");
  // set the UUID for the service this peripheral advertises:
  BLE.setAdvertisedService(accelService);

  // add the characteristics to the service
  accelService.addCharacteristic(stringCharacteristic);

  // add the service
  BLE.addService(accelService);

  // start advertising
  BLE.advertise();

  //if(print_flag)  Serial.println("BLE peripheral advertising...");

  // readingString will need 50 bytes for all values:
  readingString.reserve(readingLength);

  // Define buttons
  //pinMode(rightArmUpPin, INPUT);
 // pinMode(rightArmSmoothCirclePin, INPUT);

}

void loop() {
  /* Display the results (acceleration is measured in m/s^2) */
  // Serial.print("\t\tX: "); Serial.print(event.acceleration.x);
  // Serial.print(" \tY: "); Serial.print(event.acceleration.y);
  // Serial.print(" \tZ: "); Serial.print(event.acceleration.z);
  //Serial.println(" m/s^2 ");


  // Serial.print(event.acceleration.x);
  // Serial.print(",");
  // Serial.print(event.acceleration.y);
  // Serial.print(",");
  // Serial.println(event.acceleration.z);

  delay(10);

  // instance of BLE central to listen for connections:
  BLEDevice central = BLE.central();

  if (central) {
    // turn on LED to indicate connection:
    //  if(print_flag)
    //  {Serial.println("Got a central");
    //  Serial.println(central.address());
    //  }
    while (central.connected()) {
      // if both accelerometer & gyrometer are ready to be read:
      // update the sensor characteristics:
      updateOrientation();
    }

    // when the central disconnects, print it out:
    //  if(print_flag){
    // Serial.print("Disconnected from central: ");
    // Serial.println(central.address());
    //  }
  }

}

void updateOrientation() {

  lis.read();  // get X Y and Z data at once
  // Then print out the raw data
  //Serial.print("X:  "); Serial.print(lis.x);
  //Serial.print("  \tY:  "); Serial.print(lis.y);
  //Serial.print("  \tZ:  "); Serial.print(lis.z);

  /* Or....get a new sensor event, normalized */
  sensors_event_t event;
  lis.getEvent(&event);

  uint8_t click = lis.getClick();
  //if (click == 0) tapped = 0;
  //if (! (click & 0x30)) tapped = 0;
  if (click & 0x10) tapped = 1;

  //rightArmUpValue = digitalRead(rightArmUpPin);
  //rightArmSmoothValue = digitalRead(rightArmSmoothCirclePin);

// SPEED CONTROLS
  cap_total1 = cs_3_21.capacitiveSensor(25);
  cap_total2 = cs_3_20.capacitiveSensor(25);
  
  //  Serial.println(cap_total1);  // print sensor output 1
  //Serial.print("\t");
  //Serial.println(cap_total2);  // print sensor output 2'

int speedUp = 0;
long cap_diff1 = cap_total1-prev_cap_total1;
if(cap_total1-prev_cap_total1>speed_up_thresh){
  speedUp = 1;
  //Serial.println("UP");
}

int slowDown = 0;

long cap_diff2 = cap_total2-prev_cap_total2;
if(cap_total2-prev_cap_total2>slow_down_thresh){
  slowDown = 1;
  //Serial.println("down");
}
 prev_cap_total1 = cap_total1;
 prev_cap_total2 = cap_total2;
  

  readingString = "";
  readingString += String(event.acceleration.x);
  readingString += ",";
  readingString += String(event.acceleration.y);
  readingString += ",";
  readingString += String(event.acceleration.z);
  readingString += ",";
  readingString += String(speedUp);//(cap_total1);//
  readingString += ",";
  readingString += String(slowDown);//(cap_total2);//
  readingString += ",";
  readingString += String(cap_diff1);
  readingString += ",";
  readingString += String(cap_diff2);
  readingString += ",";
  readingString += String(event.acceleration.z);
  readingString += ",";
  readingString += String(0);
  readingString += ",";
  //readingString += String(0);
  readingString += String(tapped);
  tapped = 0;
  //if(1)  Serial.println(readingString);

  stringCharacteristic.writeValue(readingString.c_str());
  delay(50);
}
