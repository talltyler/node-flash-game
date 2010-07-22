package com.flashcodersny
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.ui.Keyboard;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import com.flashcodersny.App;
	
	public class Ship extends Sprite
	{
		public var thrust:Number = 0;
		public var vr:Number = 0;
		public var vx:Number = 0;
		public var vy:Number = 0;
		private var friction:Number = 0.97;
		private var pos:Array;
		private var app:App;
		
		public function Ship(app:App=null,pos:Array=null)
		{
			super();
			this.app = app;
			this.pos = pos;
			addEventListener(Event.ADDED_TO_STAGE,init);
		}
		
		private function init(event:Event):void
		{
			if( pos != null ) {
				x = pos[0]; // x
				y = pos[1]; // y
				vx = pos[2]; // vx
				vy = pos[3]; // vy
				vr = pos[4]; // vr
				thrust = pos[5]; // thrust
				rotation = pos[6]; // rotation
			}else{
				x = stage.stageWidth / 2;
				y = stage.stageHeight / 2;
				stage.addEventListener(KeyboardEvent.KEY_DOWN, onKeyDown);
				stage.addEventListener(KeyboardEvent.KEY_UP, onKeyUp);
			}
			addEventListener(Event.ENTER_FRAME, onEnterFrame);
			draw(false);
		}
		
		public function draw(showFlame:Boolean):void
		{
			graphics.clear();
			graphics.lineStyle(1, 0xFF00ff);
			graphics.moveTo(10, 0);
			graphics.lineTo(-10, 10);
			graphics.lineTo(-5, 0);
			graphics.lineTo(-10, -10);
			graphics.lineTo(10, 0);
			
			if(showFlame)
			{
				graphics.moveTo(-7.5, -5)
				graphics.lineTo(-15, 0);
				graphics.lineTo(-7.5, 5);
			}
		}
		
		private function onKeyDown(event:KeyboardEvent):void
		{
			var send:Boolean = false;
			switch(event.keyCode)
			{
				case Keyboard.LEFT :
					vr = -5;
					send = true;
					break;
				
				case Keyboard.RIGHT :
					vr = 5;
					send = true;
					break;
				
				case Keyboard.UP :
					thrust = 0.2;
					draw(true);
					send = true;
					break;
			}
			if(send){
				app.model.send('{"request":"action","pos":['+[x,y,vx,vy,vr,thrust,rotation].toString()+']}')
			}
		}
		
		private function onKeyUp(event:KeyboardEvent):void
		{
			vr = 0;
			thrust = 0;
			draw(false);
		}
		
		private function onEnterFrame(event:Event):void
		{
			rotation += vr;
			var angle:Number = rotation * Math.PI / 180;
			var ax:Number = Math.cos(angle) * thrust;
			var ay:Number = Math.sin(angle) * thrust;
			vx += ax;
			vy += ay;
			vx *= friction;
			vy *= friction;
			x += vx;
			y += vy;
			var left:Number = 0;
			var right:Number = stage.stageWidth;
			var top:Number = 0;
			var bottom:Number = stage.stageHeight;
			if (x - width / 2 > right)
			{
				x = left - width / 2;
			}
			else if (x + width / 2 < left)
			{
				x = right + width / 2;
			}
			if (y - height / 2 > bottom)
			{
				y = top - height / 2;
			}
			else if (y < top - height / 2)
			{
				y = bottom + height / 2;
			}
		}
	}
}