#include <SPI.h>
#include <Ethernet.h>
#include <ArduinoJson.h>
#include <Time.h>
#include <TimeLib.h>

//MAC address Arduino
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xAA };
//Direccion IP servidor (Raspberry)
IPAddress server(192, 168, 0, 100);
//Direccion IP estatica Arduino
IPAddress ip(192, 168, 0, 102);
//Objects Json
    
char c;
String date;
String response;
String delay_b;
int delay_h;
int delay_new = 1000;
int len_json;
bool reading;

EthernetClient client;

void setup() {
  Serial.begin(9600);

  // Inicio conexion Ethernet, intenta obtener una direccion IP mediante DHCP
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    //No se pudo obtener una direccion por DHCP
    //configuracion con IP estatica
    Ethernet.begin(mac, ip);
  }
  
  delay(1000);
  Serial.println("connecting...");
  
  // Conexion con el servidor mediante el puerto 3000
  if (client.connect(server, 3000)) {
    Serial.println("connected");
  
  } else {
    Serial.println("connection failed");
  }
}

void loop() {

  delay(delay_new);
  //Si existe conexion con el servidor
  //se procede a realizar el POST
  if(client.connected()){
    
    //Contruccion json a enviar
    
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& jsonArduino = jsonBuffer.createObject();
    JsonObject& data = jsonArduino.createNestedObject("data");

    date = "";
    time_t t = now();
    date += year(t); date += "-"; date += month(t); date += "-"; date += day(t); date += " ";
    date += hour(t); date += ":"; date += minute(t); date += ":";date += second(t);
    Serial.println(date);
    
    jsonArduino["id"] = "myId1";
    jsonArduino["datetime"] = date;
    data["sensor1"] = random(0,20)*5;
    data["sensor2"] = random(0,20)*5;
    //jsonArduino.printTo(Serial);
    len_json = jsonArduino.measureLength();
    
    //Envio de datos a traves de POST
    client.println("POST / HTTP/1.1");
    client.println("Host: 192.168.0.100");
    client.println("Content-Type: application/json");
    client.print("Content-Length: "); client.println(len_json);
    client.println();
    jsonArduino.printTo(client);
  }

  //Si existen datas enviados por el servidor
  //se lee cada uno de estos y se los imprime
  if (client.available()) {
    Serial.println("Reading");
    reading = true;
    while(reading){
      c = client.read();
      Serial.print(c);
    
      response += c;
      if(response.endsWith("Content-Length: ")){
        c = client.read(); 
        delay_h = (int)c - 48;
      }
      if(response.endsWith("\n\r\n")){
        response = "";
        delay_b = "";
        for(int i = 0; i < delay_h; i++){
          c = client.read();
          delay_b += c;
        }
        if(delay_b.length() != 0){
          delay_new = delay_b.toInt(); 
        }
        reading = false;
      }
    }
  }

  //Si el servidor se desconecto se cierra
  //la conexion del cliente 
  if (!client.connected()) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();

    while(true);
  }
}

