/*
    REMIO - MCU

    A MCU experiment made with remio.

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
#include <AccelStepper.h>

/* =====================================  PINS AREA  ===================================== */

const int motorInterfaceType = 1;
const int dirPin = 6;
const int stepPin = 7;
const int enablePin = 8;
const int lightPin = 9;

/* =================================  VARIABLES FOR SERIAL  ================================ */

String serialMessage = ""; 
String event = "";
bool serialMessageReceived = false; 

/* ================================  VARIABLES FOR EXPERIMENT  ============================== */

// INITIALIZE A JSON OBJECT -------------------<

StaticJsonDocument<512> variables;

// DEFINE CONTROL VARIABLES -------------------<

bool play = false;
bool direction = true;
bool lightState = false;



// DEFINE INTERNAL VARIABLES ------------------<

bool isInUse = false;
bool speedReady = true;
int stepSpeedSetPoint = 20;
int stepSpeed = 0;
int stepsMeasured = 0;

const int stepJump = 20;
AccelStepper stepper = AccelStepper(motorInterfaceType, stepPin, dirPin);
/* =====================================  TIMERS AREA  ===================================== */

// STOP TIMER ---------------------------------<

const long STOP_TIMER_INTERVAL = 60000; //ms
const int TIME_MINUTES_LIMIT = 5; 
SimpleTimer stopTimer(STOP_TIMER_INTERVAL);
int stopMinutes = 0;

/*
* When some time pass (TIME_MINUTES_LIMIT), call to the stop function.
*/
void autoStop(){

  if(stopTimer.isReady()){
    stopMinutes++;
    stopTimer.reset();
  }

  if(stopMinutes >= TIME_MINUTES_LIMIT){
    stop();
    stopMinutes = 0;
    isInUse = false;
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
  variables["play"] = play;
  variables["direction"] = direction;
  variables["speed"] = stepSpeed;
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

  play = variables["play"];
  direction = variables["direction"];
  stepSpeed = variables["speed"];

  configureExperiment();
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
SimpleTimer speedControlTimer(2000);

void speedWasSet() {
  Serial.println("$speedReady");  
}

void speedControl(){
    if(speedControlTimer.isReady()){
      setSoftSpeed();
      speedControlTimer.reset();
    }
 
}

void setSoftSpeed(){
  //
   if(speedReady == false && play == true){
      // setteo de subida
      if(stepSpeed < stepSpeedSetPoint){ //si velocidad actual es menor que el setpoint
       stepSpeed += stepJump; // incrementar velocidad actual N pasos
 
       if(stepSpeed >= stepSpeedSetPoint){ // Si se superó o igualó el setpoint
        stepSpeed = stepSpeedSetPoint; // Settear velocidad en el setPoint
        speedReady = true; // Velocidad Setteada
        speedWasSet();
        return;
       }
  
     }  
      
      // setteo de bajada
      if(stepSpeed >= stepSpeedSetPoint){
        stepSpeed -= stepJump;

        if(stepSpeed <= stepSpeedSetPoint){
          stepSpeed = stepSpeedSetPoint;
          speedReady = true;
          speedWasSet();
          return;
        }  
     }
     
   }    
}

void stop(){
  lightState = false;
  play = false;
  speedReady = true; 
  stepSpeed=0;
  sendControlVariables();
  stopTimer.reset();
  //Serial.println("$stopped");
}

void lightControl(){
  digitalWrite(lightPin, lightState); 
}

void motorControl(){
  // Enable or disable Motor
  digitalWrite(enablePin, !play);
 
  //choose direction
  if(!direction)
    stepper.setSpeed(stepSpeed);
    
  if(direction)
    stepper.setSpeed(-stepSpeed);
    
  //move motor  
  stepper.runSpeed();  
}

/* ================================  SETUP SYSTEM =================================== */

void configurePins(){
  pinMode(lightPin, OUTPUT);
  digitalWrite(lightPin, LOW);
}

void configureStepper() {
  stepper.setMaxSpeed(200);
  stepper.setAcceleration(400);
}

void configureExperiment(){
  speedReady = false;
  isInUse = true;
  stopMinutes = 0;
  if(!play)
    stepSpeed = 0;
  stopTimer.reset();
}

void setup() {
  // Configure Serial
  Serial.begin(9600);

  // Configure serial buffer (Strings)
  serialMessage.reserve(256);
  event.reserve(256);

  // Configure Pins
  configurePins();

  // Stepper
  configureStepper();
}

void loop() {
  autoStop();
  speedControl();
  lightControl();
  motorControl();

}
