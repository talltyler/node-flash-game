package com.flashcodersny
{
import flash.events.Event;
import flash.events.DataEvent;
import flash.net.XMLSocket;
import com.adobe.serialization.json.JSON;
import flash.events.TimerEvent;
import flash.utils.Timer;
import flash.external.ExternalInterface;

public class Model
{
	private var socket:XMLSocket;
	private var app:App;
	private var _setup:Boolean;
	
	public function Model(app:App)
	{
		super();
		init(app);
	}
	
	public function init(app:App):void
	{
		this.app = app;
		socket = new XMLSocket();
		socket.addEventListener(Event.CONNECT, onConnect);
		socket.addEventListener(DataEvent.DATA, onData);
		socket.connect("127.0.0.1", 3002);
	}
	
	public function send(data:String):void
	{
		if( data != "" && socket != null && socket.connected) {
			trace("send",data);
			socket.send(data);
		}
	}

	public function close():void
	{
		if( socket != null && socket.connected) {
	    	socket.close();
		}
	}
	
	private function onConnect(event:Event):void
	{
		send('{"request":"setup"}');
	}
	
	private function onData(event:DataEvent):void
	{         
		_setup = true;
		trace("get",event.data)
		var input:Object = JSON.decode(event.data);
		var ship:Ship;
		if( input.request ) {
			switch(input.request){
				case "setup":
					for each( var pos:Array in input.positions ){
						ship = new Ship(app,pos);
						app.ships.push(ship);
						app.target.addChild(ship);
						trace(ship,ship.x,ship.y)
					}
					ship = new Ship(app,null);// we create one more for ourself
					app.ships.push(ship); 
					app.target.addChild(ship)
					send('{"request":"create","pos":['+[ship.x,ship.y,ship.vx,ship.vy,ship.vr,ship.thrust,ship.rotation].toString()+']}');
					break;
				case "create":
					app.ships.push(new Ship(app,input.pos));
					app.ships.push(ship); 
					app.target.addChild(ship)
					break;
				case "action":
					ship = app.ships[input.player];
					ship.x = input.pos.x;
					ship.y = input.pos.y;
					ship.vx = input.pos.vx;
					ship.vy = input.pos.vy;
					ship.vr = input.pos.vr;
					ship.thrust = input.pos.thrust;
					ship.rotation = input.pos.rotation;
					break;
				case "alert":
					trace(input.message);
					break;
			}
		}else{
			trace("error:",event.data)
		}
		// ExternalInterface.call("alert('data')")
	}
	
}

}