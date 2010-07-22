var net = require('net'),
	hashlib = require("hashlib");
	
var clients = {};
var games = [];
var badRequest = {};

// new,ready,place(type,x,y),shoot(type,x,y,vx,vy),win,lose,end
/*
new
	request:waiting||play, player:0
ready
	request:ready, player:0
place(type,x,y)
	request:placed,type:object,x:0,y:0,player:0
shoot(type,x,y,vx,vy)
	request:shoot,type:object,x:0,y:0,vx:0,vy:0,player:0
win
	request:loose,player:0
loose
	request:lost,player:0
end
	request:end,player:0
info(type:client|clients|game|games|bad)
	request:info,data:{}
alert(message:"",player:1,username:"",password:"")
	request:alert,message:""

*/

net.createServer(function (socket) {
	if( badRequest[socket.remoteAddress] && badRequest[socket.remoteAddress].request.length < 5 ) {
		socket.write("You've been blocked.");
		socket.end();
		return;
	}
	var client;
	socket.setEncoding("utf8");
	socket.addListener("connect", function () {
		client = clients[socket.remoteAddress];
		client = client ? client : {wins:0,plays:0,socket:socket};
		socket.write("connected");
	});
	socket.addListener("data", function (data) {
		var input = JSON.parse(data);
		if( input != null && input.request != undefined ) { 
			switch( input.request ){
				case "new":
					var lastGame = games[games.length-1];
					if( lastGame.waiting ) { // if last game is waiting then we need a new game
						lastGame.players.push( socket );
						client.game = lastGame;
						if( lastGame.numOfPlayers == lastGame.players.length ) {
							lastGame.waiting = false;
							for(i=0;i<lastGame.players.length;i++){
								var player = lastGame.players[i];
								player.write(JSON.stringify({request:"play"}));
							}
						}
					}else{
						var newGame = {players:[socket],numOfPlayers:input.numOfPlayers||2,waiting:true};
						games.push(newGame);
						client.game = newGame;
						player.write(JSON.stringify({request:"waiting"}));
					}
					break;
				case "ready": 
					var index = client.game.players.indexOf(socket); // index of member that is ready
					for(i=0;i<client.game.players.length;i++){
						var player = client.game.players[i]; // tell other players that this player lost
						player.write(JSON.stringify({request:"ready",player:index}));
					}
					break;
				case "place":
					var index = client.game.players.indexOf(socket); // index of member that is ready
					for(i=0;i<client.game.players.length;i++){
						var player = client.game.players[i]; // tell other players that something what placed
						player.write(JSON.stringify({request:"placed",x:input.x,y:input.y,type:input.type,player:index}));
					}
					break;
				case "shoot":
					for(i=0;i<client.game.players.length;i++){
						var player = client.game.players[i]; // tell other players that something what shot
						player.write(JSON.stringify({request:"shoot",x:input.x,y:input.y,vx:input.vx,vy:input.vy,type:input.type,player:index}));
					}
					break;
				case "win": 
					var index = client.game.players.indexOf(socket); // index of winner
					client.game.winner = index;
					client.wins++;
					for(i=0;i<client.game.players.length;i++){
						var player = client.game.players[i]; // tell other players that they lost
						player.write(JSON.stringify({request:"loose",player:index}));
					}
					break;
				case "loose": 
					var index = client.game.players.indexOf(socket); // index of looser
					for(i=0;i<client.game.players.length;i++){
						var player = client.game.players[i]; // tell other players that this player lost
						player.write(JSON.stringify({request:"lost",player:index}));
					}
					break;
				case "end": 
					var index = client.game.players.indexOf(socket); // index of player that ended it
					client.plays++;
					for(i=0;i<client.game.players.length;i++){
						var player = client.game.players[i]; // tell other players that this player lost
						player.write(JSON.stringify({request:"end",player:index}));
					}
					if( gameIndex != -1 ) {	
						games.splice(gameIndex,1);
						delete client.game;
					}
					break;
				case "info":
					if( login(input) ) {
						if( input.type="client" ) {
							socket.write(JSON.stringify({request:"info",data:clients[input.client]}));
						}else if( input.type="clients"){
							socket.write(JSON.stringify({request:"info",data:clients}));
						}else if( input.type="game"){
							socket.write(JSON.stringify({request:"info",data:games[input.game]}));
						}else if( input.type="games"){
							socket.write(JSON.stringify({request:"info",data:games}));
						}else if( input.type="bad"){
							socket.write(JSON.stringify({request:"info",data:badRequest}));
						}
					}
					break;
				case "alert":
					if( input.player != undefined ) {
						client.game.players[input.player].write(JSON.stringify({request:"alert",message:input.message}));
					}else if( login(input) ) {
						for(var client in clients){
							clients[client].socket.write(JSON.stringify({request:"alert",message:input.message}));
						}
					}
					break;
				default: 
					var questionable = badRequest[socket.remoteAddress] ? badRequest[socket.remoteAddress] : {request:[]};
					questionable.request.push(data);
					socket.write(JSON.stringify({request:"404"}));
					console.log("?? "+data);
					break;
			}
		}else{
			var questionable = badRequest[socket.remoteAddress] ? badRequest[socket.remoteAddress] : {request:[]};
			questionable.request.push(data);
			console.log("?? "+data);
		}
		
	});
	socket.addListener("end", function () {
		delete clients[socket.remoteAddress];
		socket.end();
	});
}).listen(8081, "127.0.0.1");

function login(input) {
	var users = {
		admin:{
			salt:"th5f4mugubrtraqu5AxaxeugEyaspuxehefespe6Ufr9vunaSez2se7e4acepehu",
			hash:"053411ef0c31df8067791a576ccef215ab8a736590305db22df4d8cbff0f40e9"
		}
	}
	var user = users[input.username];
	if( user.hash == sha256( user.salt+input.password ) ) {
		return true;
	}else{
		return false;
	}
}