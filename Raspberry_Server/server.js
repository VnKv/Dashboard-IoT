//Lista de frecuencias de envio en espera a ser enviadas
var arduinos = [];
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var io = require('socket.io-client')('http://192.168.0.105:3001');

app.use(bodyParser.json());

app.post('/', function (request, response) {
	console.log(request.body);
	var delay = "";
	var index = findArduino(request.body.id);
	if(index >= 0){
		delay = arduinos[index].delay
		arduinos.splice(index,1);	
		printArduinos();	
	}
	//Envia los datos de sensores del arduino al servidor web
	io.emit('webServer',request.body);
	response.send(delay);
});
//Escucha al evento 'raspberry' que sera llamado desde el servidor web
//que envia los datos de actualizacion de freciencia de envio
io.on('raspberry',function(data){
	console.log(data);
	var index = findArduino(data.id);
	//Si existe una actualizacion reemplaza con el nuevo valor recibido
	if(index >= 0){
		arduinos[index].delay = data.delay;
	}else{
		//Si no existe agrega un nuevo objeto a la lista de actualizaciones 
		arduinos.push(data);	
	}
	printArduinos();
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});	
//Retorna la actualizacion para determinado arduino por id, si existe
function findArduino(id_a){
	for (var i = arduinos.length - 1; i >= 0; i--) {
		if(arduinos[i].id == id_a){
			return i;
		}
	}
	return -1;
}
//Muestra la lista de actualizaciones en espera
function printArduinos(){
	console.log("Arduinos: " + arduinos.length);
	for (var i = arduinos.length - 1; i >= 0; i--) {
		console.log(arduinos[i].id + ": " + arduinos[i].delay);
	}
}