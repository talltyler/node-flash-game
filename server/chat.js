var net = require('net');
var users = [];
var rooms = [{users:[]}];
var user_rooms = [];
var server = net.createServer(function (stream) {
  stream.setEncoding('utf8');
  stream.addListener('connect', function () {
	var room;
	if( rooms[rooms.length-1].users.length < 3 ) {
		room = rooms[rooms.length-1];
	}else{
		room = {users:[]};
		rooms.push(room);
	}
	room.users.push(stream);
	users.push(stream);
	user_rooms.push(room);
	stream.write("Welcome to room " + rooms.length + " -> ");
  });
  stream.addListener('data', function (data) {
	console.log(data);
	var room = user_rooms[users.indexOf(stream)];
	for(var i=0;i<room.users.length;i++){
		if( room.users[i] != stream ) {
			room.users[i].write(data);
		}
	}
  });
  stream.addListener('end', function () {
	var room = user_rooms[users.indexOf(stream)];
	room.users.splice(room.users.indexOf(stream),1);
	delete users[stream];
    stream.end();
  });
});
server.listen(3000, '127.0.0.1');
console.log("hey what's up!");