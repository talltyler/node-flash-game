package
{

import flash.events.Event;
import flash.display.Sprite;
import com.flashcodersny.App;
import com.flashcodersny.Ship;

public class Main extends Sprite
{
	private var app:App;
	public function Main()
	{
		super();
		stage.addEventListener( Event.ENTER_FRAME, initialize );
	}

	private function initialize(event:Event):void
	{
		stage.removeEventListener( Event.ENTER_FRAME, initialize );
		stage.align = "TL";
		stage.scaleMode = "noScale";	
		app = new App(this);
	}
}

}