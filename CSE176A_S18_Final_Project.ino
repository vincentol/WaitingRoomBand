/*
 * Code for Temperature, Heart Rate, and SPO2 readings from the MAX30105 sensor
 * is inspired by the example code in https://github.com/sparkfun/MAX30105_Breakout
 */

#include <Wire.h>
// These files are from the MAX3010X Particle Sensor Breakout library
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

MAX30105 particleSensor;

#define MAX_BRIGHTNESS 255

uint16_t irBuffer[50];    // infrared LED sensor buffer
uint16_t redBuffer[50];   // red LED sensor buffer

int32_t bufferLength;

int32_t spo2_value;
int8_t spo2_valid;          // indicator if SPO2 calculation is valid
int32_t heartRate_value;    
int8_t heartRate_valid;     // indicator if heartRate calculation is valid

byte pulseLED = 11;         
byte readLED = 13;          // blinks with each data read

float temperatureC;
float temperatureF;

int buzzMotor = 6;

bool alertOn = false;
int buzzAlert = 0;

void setup() {
  Serial.begin(115200);

  pinMode(pulseLED, OUTPUT);
  pinMode(readLED, OUTPUT);
  pinMode(buzzMotor, OUTPUT);

  // Initialize sensor
  if(!particleSensor.begin(Wire, I2C_SPEED_FAST)) // default I2C port at 400kHz
  {
    Serial.println(F("MAX30105 was not found. Please check wiring/power."));
    while(1);
  }

  // Prompt user to begin sensing
  Serial.println(F("Attach sensor to finger. Press any key to start sensing."));
  while(Serial.available() == 0);
  Serial.read();

  // for more information on settings, look at MAX30105.cpp
  byte ledBrightness = 50;    // brightness of IR and red LEDs
  byte sampleAverage = 4;     // number of samples to average
  byte ledMode = 2;           // use red and IR LEDs
  byte sampleRate = 50;       // amount of samples to take per second
  int pulseWidth = 411;       // length of detection
  int adcRange = 4096;        // analog to digital conversion range

  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);

  bufferLength = 50;          // same as size of irBuffer[] and redBuffer[]
 
  CalibrateSensor();
}

void loop() {
  GetVitals();
  SendVitals();

  CheckForAlert();
  if(buzzAlert > 0)   // if we get any data from serial port, turn on buzzer
  {
    if(!alertOn)
    {
      SendAlert();
      alertOn = true;
    }
  }
  else
  {
    if(alertOn)
    {
      StopAlert();
      alertOn = false;
    }
  }
}

// The pulse oximetry sensor needs to be calibrated in order to accurately calculate
// heart rate and pulse oximetry. This is done by collecting 50 samples from the sensor,
// then calculating those vitals.
void CalibrateSensor()
{
  // configuration: read the first bufferLength samples and determine the signal range
  for(byte i = 0; i < bufferLength; i++)
  {
    while(particleSensor.available() == false)
    {
      particleSensor.check(); // Check for new sensor data
    }

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();

    
    
    particleSensor.nextSample();

    Serial.print(F("red="));
    Serial.print(redBuffer[i], DEC);
    Serial.print(F(", ir="));
    Serial.println(irBuffer[i], DEC);
  }

  // calculate SPO2 after first 50 samples (first 4 seconds of samples)
  // this function can be found in spo2_algorithm.cpp from the MAX30105 library
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2_value, &spo2_valid, &heartRate_value, &heartRate_valid);

  // heartRate seems to be doubled, so divide by 2
  heartRate_value = heartRate_value / 2;
}

// Recalculates heart rate and pulse oximetry by dumping the oldest 10 samples
// and getting 10 new samples
void GetVitals()
{
  // dump first 10 sets of samples and shift last 50 sets to the top
  for(byte i = 10; i < 50; i++)
  {
    redBuffer[i - 10] = redBuffer[i];
    irBuffer[i - 10] = irBuffer[i];
  }

  // get 10 new sets of samples
  for(byte i = 40; i < 50; i++)
  {
    while(particleSensor.available() == false)
    {
      particleSensor.check();
    }

    digitalWrite(readLED, !digitalRead(readLED)); // Blink onboard LED with every data read

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();
  }

  // calculate new HR and SpO2 with new sample set
  // this function can be found in spo2_algorithm.cpp from the MAX30105 library
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2_value, &spo2_valid, &heartRate_value, &heartRate_valid);

  heartRate_value = heartRate_value / 2;

  temperatureC = particleSensor.readTemperature();
  temperatureF = particleSensor.readTemperatureF();
}

// Turns temperatureC, temperatureF, heartRate_value, and spo2_value into a string of
// the format: "[temperatureC, temperatureF, heartRate_value, spo2_value]"
// then sends the string over serial
void SendVitals()
{
  String s = String("[" + String(temperatureC) + ", " + String(temperatureF) + ", " + String(heartRate_value) + ", " + String(spo2_value) + "]");
  Serial.println(s);
}

// Checks if the serial is available. If it is, then there is an alert, and it stores
// the read into buzzAlert
void CheckForAlert()
{
  if(Serial.available() > 0)
  {
    buzzAlert = Serial.read();
  }
}

// Starts the vibration motor
void SendAlert()
{
  analogWrite(buzzMotor, 180);
}

// Stops the vibration motor
void StopAlert()
{
  analogWrite(buzzMotor, 0);
}

// Prints the values of temperatureC, temperatureF, heartRate_value, and spo2_value
void PrintVitals()
{
  Serial.print(F("HR="));
  Serial.print(heartRate_value, DEC);

  Serial.print(F(", SPO2="));
  Serial.print(spo2_value, DEC);

  Serial.print(F(", TempC="));
  Serial.print(temperatureC);

  Serial.print(F(", TempF="));
  Serial.println(temperatureF);
}
