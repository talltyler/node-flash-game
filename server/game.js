var net = require('net');
var users = [];
var games = [{users:[],positions:[]}];
var user_games = [];
var badRequest = {};
var server = net.createServer(function (stream) {
	if( badRequest[stream.remoteAddress] && badRequest[stream.remoteAddress].request.length < 3 ) {
		stream.write("You've been blocked.");
		stream.end();
		return;
	}
  stream.setEncoding('utf8');
  stream.addListener('connect', function () {
		var game;
		if( games[games.length-1].users.length < 2 ) {
			game = games[games.length-1];
		}else{
			game = {users:[],positions:[]};
			games.push(game);
		}
		users.push(stream);
		game.users.push(stream);
		user_games.push(game);
		stream.write(JSON.stringify({request:"setup",positions:game.positions}));
  });
  stream.addListener('data', function (data) {
		console.log(data);
		try{
			var input = JSON.parse(data.replace("\0",""));
		}catch(error){
			console.log(error);
			return
		}
		console.log(input.request);
		var game = user_games[users.indexOf(stream)];
		switch( input.request ){
			case "setup":
				console.log( JSON.stringify({request:"setup",positions:game.positions}) );
				stream.write( JSON.stringify({request:"setup",positions:game.positions})+"\0" );
				break;
			case "create":
				for(i=0;i<game.users.length;i++){ 
						game.users[i].write( // tell other players about me
							JSON.stringify({request:"create",pos:input.pos})+"\0"
						);
				}
				break;
			case "action":
				// console.log( "action "+input.type+" "+input.rotation+" "+input.x+" "+input.y+" "+input.vx+" "+input.vy+" "+input.vr+" "+input.thrust+" "+users.indexOf(stream) );
				for(i=0;i<game.users.length;i++){ 
					if(game.users[i] != stream){
						game.users[i].write( // tell other players that something what shot
							JSON.stringify({request:"action",pos:input.pos, player:users.indexOf(stream)})+"\0"
						);
					}
				}
				game.positions[users.indexOf(stream)] = input.pos;
				break;
			case "admin":
				if( login(input) ) {
					if( input.type="user" ) {
						stream.write(JSON.stringify({request:"info",data:users[input.user]}));
					}else if( input.type="game"){
						stream.write(JSON.stringify({request:"info",data:games[input.game]}));
					}else if( input.type="badRequest"){
						stream.write(JSON.stringify({request:"info",data:badRequest}));
					}else if( input.type="alert"){
						for(i=0;i<users.length;i++){ 
							users[i].write(JSON.stringify({request:"alert",message:input.message}));
						}
					}
				}
				break;
			default:
				saveBadRequest(stream);
				break;
		}
  });
  stream.addListener('end', function () {
		var game = user_games[users.indexOf(stream)];
		game.users.splice(game.users.indexOf(stream),1);
		delete users[stream];
    stream.end();
  });
});
server.listen(3002, '127.0.0.1');
console.log("hey what's up!");

function saveBadRequest(stream) {
	var questionable =  badRequest[stream.remoteAddress] ? badRequest[stream.remoteAddress] : {request:[]};
	questionable.request.push(1);
}

function login(input) {
	return true; // TODO: login
}