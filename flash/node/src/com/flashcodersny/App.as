package com.flashcodersny
{
import flash.events.EventDispatcher;
import flash.display.Sprite;
import flash.events.Event;
import flash.events.MouseEvent;

public class App extends EventDispatcher
{
	public var model:Model;
	public var ships:Array = [];
	public var target:Sprite;
	
	public function App(target:Sprite)
	{
		super();
		init(target);
	}
	
	public function init(target:Sprite):void
	{
		model = new Model(this);
		this.target = target;		
	}
	
}

}