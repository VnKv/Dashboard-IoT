var app = angular.module("sockets",[]);

app.controller("socketsController",function($scope){
	$scope.arduino_elems = [];

	var socket = io.connect('http://localhost:3001');
	//Escucha al evento 'client' que sera llamado desde el servidor web
    //que envia los datos de sensores del arduino
	socket.on('client', function(arduino) { 
		//Verifica si el arduino existe en lista
		if(findArduino(arduino.id)){
			//Si existe, actualiza los valores del mismo
			updateArduino(arduino)
			//Grafica los sensores correspondientes a cada los arduinos
			drawGraphics();
		}else{
			//Si no existe construye un objeto arduino nuevo y lo agrega a la lista
			buildArduino(arduino);
			//Grafica los sensores correspondientes a cada los arduinos
			drawGraphics();
		}
	});
	//Grafica los sensores correspondientes a cada los arduinos
	function drawGraphics(){
		var sensors = [];
		for (var i = $scope.arduino_elems.length - 1; i >= 0; i--) {
			//Obtiene la estructura construida en el formato plotly
			sensors = $scope.arduino_elems[i].sensors;
			console.log(sensors);
			//Llama a la funcion newPlot para graficar los datos
			Plotly.newPlot($scope.arduino_elems[i].id, sensors);
		}
	}
	//Recibe el id del arduino para enviar su modificacion de frecuencia de envio
	$scope.sendDelay = function(id_a){
		console.log(id_a);
		for (var i = $scope.arduino_elems.length - 1; i >= 0; i--) {
			if($scope.arduino_elems[i].id == id_a){
				//Construye el objeto a ser enviado al servidor raspberry
				//Formato frecuencia: {id:"myId",delay:"1000"} 
				var response = {
					id: id_a,
					delay: $scope.arduino_elems[i].delay
				}
				console.log(response);
				//Envia los datos de frecuencia de envio de datos al servidor web
				socket.emit('webServerClient',response);
			}
		}
	};
	//Actualiza los valores de los sensores de un arduino en especifico
	function updateArduino(arduino){
		for (var i = $scope.arduino_elems.length - 1; i >= 0; i--) {
			if($scope.arduino_elems[i].id == arduino.id){
				//Agrega un valor a cada sensor de la lista de sensores
				addSensors($scope.arduino_elems[i].sensors,
							buildSensors(arduino.datetime,arduino.data));
				$scope.$apply()
			}
		}
	}
	//Comprueba la existencia de un arduino a partir de su id
	function findArduino(id_a){
		for (var i = $scope.arduino_elems.length - 1; i >= 0; i--) {
			if($scope.arduino_elems[i].id == id_a){
				return true;
			}
		}
		return false;
	}
	//Construye un nuevo objeto "arduino" para agregarlo a la lista
	//para ser graficado
	//Formato arduino_elem = {id: "myId1", sensors : [], delay: "1000"}
	function buildArduino(arduino){
		
		var arduino_elem = {
			id: arduino.id,
			sensors: buildSensors(arduino.datetime,arduino.data),
			delay: '1000'
		};

		console.log(arduino_elem);
		$scope.arduino_elems.push(arduino_elem);
		$scope.$apply();
	};
	//Agrega un valor a cada sensor de la lista de sensores
	//Si el tamaño de la lista excede el maximo, 
	//se elimina el primer valor para agregar el ultimo (FIFO)
	function addSensors(sensors_old,sensors_new){
		for (var i = sensors_old.length - 1; i >= 0; i--) {
			if(sensors_old[i].x.length > 50){
				sensors_old[i].x.shift();
				sensors_old[i].y.shift();
			}	
			sensors_old[i].x.push(sensors_new[i].x[0]);
			sensors_old[i].y.push(sensors_new[i].y[0]);
		}
	}
	//Formatea los datos de los sensores al requerido por plotly
	function buildSensors(datetime,sensors){
		var arduino_se = [];
		var names = []; i = 0;
		
		for(names[i++] in sensors);

		for (var i = names.length - 1; i >= 0; i--) {
			var sensor = {
				x: [datetime],
				y: [sensors[names[i]]],
				name: names[i] 
			}
			arduino_se.push(sensor);
		}
		return arduino_se;
	}
});

