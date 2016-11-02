//Paquetes
var express = require('express');  
var app = express();  
var server = require('http').Server(app);  
var io = require('socket.io')(server); 

app.use(express.static('public'));

io.on('connection', function(socket) {  
    //Escucha al evento 'webServer' que sera llamado desde el servidor raspberry
    //que envia los datos de sensores del arduino
    socket.on('webServer',function(data){
    	console.log(data); //Formato sensores: {"id" :"myId2", "datetime" :"2016-10-2014:20:01", data: { "sensor1": 100, "sensor2":200}}
    	//Envia los datos recibidos del raspberry al cliente (index.html)
    	io.sockets.emit('client',data);
    });
    //Escucha al evento 'webServerClient' que sera llamado desde el cliente (index.html) 
    //que envia las actualizaciones en frecuencia de envio al arduino correspondiente
    socket.on('webServerClient',function(data){
    	console.log(data); //Formato frecuencia: {id:"myId",delay:"1000"} 
    	//Envia los datos de frecuencia de envio de datos al servidor raspberry
    	io.sockets.emit('raspberry', data);
    });
});

server.listen(3001, function() {  
    console.log('Servidor corriendo en http://localhost:3001');
});