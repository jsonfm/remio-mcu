/*
    Base Arduino - Remio

    An example of an Arduino Experiment to be used with REMIO python library.

    By Jason Francisco Macas Mora
*/

/*
    Here the list of available serial events:

    Serial Events:
      To receive:
        $stop: it will stop experiment
        $status: it asks for the current state (VARIABLES)

      To send: 
        $recived -> it notifies the data were recived
        $status, ok -> response status of the system is ok
        $status, error:msg  -> response system has some error
*/

#include <ArduinoJson.h>
#include <SimpleTimer.h>

/* =====================================  PINS AREA  ===================================== */

// Sensors Pins
const int sensor1Pin = A0;
const int sensor2Pin = A1;
const int sensor3Pin = A2;

/* =================================  VARIABLES FOR SERIAL  ================================ */

String serialMessage = ""; 
String event = "";
bool serialMessageReceived = false; 

/* ================================  VARIABLES FOR EXPERIMENT  ============================== */

// INITIALIZE A JSON OBJECT -------------------<

StaticJsonDocument<512> variables;

// DEFINE CONTROL VARIABLES -------------------<

bool running = false;
bool btn1 = false;
bool btn2 = false;
bool btn3 = false;

// DEFINE INTERNAL VARIABLES ------------------<

bool isInUse = false;

/* =====================================  TIMERS AREA  ===================================== */

// STOP TIMER ---------------------------------<

const long STOP_TIMER_INTERVAL = 10000; //ms
const int TIME_MINUTES_LIMIT = 2; 
SimpleTimer stopTimer(STOP_TIMER_INTERVAL);
int stopMinutes = 0;

/*
* When some time pass (TIME_MINUTES_LIMIT), call to the stop function.
*/
void autoStop(){

  if(stopTimer.isReady()){
//    stopMinutes++;
    sendControlVariables();
    stopTimer.reset();
  }

  if(stopMinutes >= TIME_MINUTES_LIMIT){
    stop();
    stopMinutes = 0;
  }

}

/*
* It resets the auto stop timer.
*/
void resetStopTimer(){
  stopMinutes = 0;
  stopTimer.reset();
}

/* ================================  SERIAL CALLBACKS / AUX FUNCTIONS =================================== */

/*
* It sends the control variables as JSON object thorugh the serial.
*/
void sendControlVariables(){
  variables["btn1"] = btn1;
  variables["btn2"] = btn2;
  variables["btn3"] = btn3;
  serializeJson(variables, Serial);  
  Serial.println();
}

/*
* It notifies some data were received.
*/
void notifyDataWereReceived(){
  Serial.println("$received");
}

/*
* It reads control variables received from the serial port.
*/
void readControlVariables(){
  DeserializationError error = deserializeJson(variables, serialMessage);

  if(error){
    return;
  }

  btn1 = variables["btn1"];
  btn2 = variables["btn2"];
  btn3 = variables["btn3"];

  notifyDataWereReceived();
}

/*
* Serial event interrupt.
*/
void serialEvent() {
  while (Serial.available()) {

    char inChar = (char) Serial.read();
    serialMessage += inChar;

    if (inChar == '\n') {

      if(serialMessage[0] == '$'){
        readEvents();
      }

      if(serialMessage[0] == '{'){
        readControlVariables();
      }
      
      serialMessageReceived = true;
      serialMessage = "";
      event = "";

    }

  }
}

/*
* Reads an event coming from serial.
* 
* ++++++++ Events ++++++++
* stop: it calls to the stop function.
* status: it calls to the emit status function.
* 
*/
void readEvents(){
    event = serialMessage.substring(1);
    event.trim();

    if(event == "stop"){
      stop();
      return;
    }

    if(event == "status"){
      emitStatus();
      return;
    }
}

/* ===========================  FUNCTIONS FOR CHECK SYSTEM =========================== */

void emitStatus(){
  bool ok = true;
  String error = "";
  
  // check if are there any error on the system
  if(ok){
    Serial.println("$status,ok");
  }else{
    Serial.println("$status, error: " + error);
  }
}

/* ================================  CONTROL FUNCTIONS =================================== */

void configureExperiment(){
  isInUse = true;
  resetStopTimer();
  // Do somehting...
}

void stop(){
  // Do something...
}

void readSensors() {
  // Do something...
}

void motorControl(){
  // Do something...
}

void magnetControl() {
  // Do something...
}

void runExperiment(){
  // Do something...
}

/* ================================  SETUP SYSTEM =================================== */

void configurePins(){
  pinMode(sensor1Pin, INPUT_PULLUP);
  pinMode(sensor2Pin, INPUT_PULLUP);
  pinMode(sensor3Pin, INPUT_PULLUP);
}

void setup() {
  // Configure Serial
  Serial.begin(9600);

  // Configure serial buffer (Strings)
  serialMessage.reserve(256);
  event.reserve(256);

  // Configure Pins
  configurePins();
}

void loop() {
  autoStop();
  magnetControl();
  readSensors();
  runExperiment();
  motorControl();
}
