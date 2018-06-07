/*
 * Code for Temperature, Heart Rate, and SPO2 readings from the MAX30105 sensor
 * is inspired by the example code in https://github.com/sparkfun/MAX30105_Breakout
 */

#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

MAX30105 particleSensor;

float temperatureC;
float temperatureF;

const byte HR_SAMPLE_SIZE = 4;  // Increase this for more averaging. 4 is good
byte heartrates[HR_SAMPLE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;              // Time at which the last beat occured

float beatsPerMinute;
int beatAvg;
long irValue;

int buzzMotor = 6;

bool alertOn = false;
int buzzAlert = 0;

void setup()
{
  Serial.begin(115200);
  Serial.println("Initializing...");

  pinMode(buzzMotor, OUTPUT);

  // Initialize sensor
  if(!particleSensor.begin(Wire, I2C_SPEED_FAST)) // Use default I2C port, 400kHz speed
  {
    Serial.println("Sensor was not found. Please check wiring/power.");
    while(1);
  }

  Serial.println("Place your index finger on the sensor with steady pressure.");

  particleSensor.setup();                     // Configure sensor with default settings
  particleSensor.setPulseAmplitudeRed(0x0A);  // Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0);   // Turn off Green LED
}

void loop()
{
  getTemperature();
  getHeartRate();

  sendVitals();
  
  checkForAlert();
  if(buzzAlert > 0)
  {
    if(!alertOn)
    {
      sendAlert();
      alertOn = true;
    }
  }
  else
  {
    if(alertOn)
    {
      stopAlert();
      alertOn = false;
    }
  }
}

// Gets the temperature from the particle sensor
void getTemperature()
{
  Serial.println("Here1");
  temperatureC = particleSensor.readTemperature();
  Serial.println("Here2");
  temperatureF = particleSensor.readTemperatureF();
  Serial.println("Here3");
}

// Prints the values of temperatureC and temperatureF
void printTemperature()
{
  Serial.print("temperatureC=");
  Serial.print(temperatureC, 4);
  Serial.print(", temperatureF=");
  Serial.print(temperatureF, 4);
}

void getHeartRate()
{
  Serial.println("Here4");
  irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true)
  {
    // Sensed a beat
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20)
    {
      heartrates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot = rateSpot % HR_SAMPLE_SIZE; // wrap variable

      // Take average of readings
      beatAvg = 0;
      for (byte i = 0; i < HR_SAMPLE_SIZE; i++)
      {
        beatAvg += heartrates[i];
      }
      beatAvg = beatAvg / HR_SAMPLE_SIZE;
    }
  }
  Serial.println("Here5");
}

void printHeartRate()
{
  Serial.print("IR=");
  Serial.print(irValue);
  Serial.print(", BPM=");
  Serial.print(beatsPerMinute);
  Serial.print(", Avg BPM=");
  Serial.print(beatAvg);

  if (irValue < 50000)
  {
    Serial.print(" No finger?");
  }
}

void getSPOData()
{
  
}

void sendVitals()
{
  String s = String("[" + String(temperatureC) + ", " + String(temperatureF) + ", " + String(beatsPerMinute) + ", " + String(beatAvg) + "]");
  Serial.println(s);
}

/*
bool checkForAlert()
{
  if(Serial.available() > 0)
  {
    buzzAlert = Serial.read();
    Serial.print("value sent is:");
    Serial.println(buzzAlert);
    return true;
  }
  return false;
}
*/

void checkForAlert()
{
  if(Serial.available() > 0)
  {
    buzzAlert = Serial.read();
    Serial.print("value sent is:");
    Serial.println(buzzAlert);
  }
}

void sendAlert()
{
  Serial.println("Sending Alert...");
  analogWrite(buzzMotor, 180);
}

void stopAlert()
{
  Serial.println("Stopping Alert...");
  analogWrite(buzzMotor, 0);
}

