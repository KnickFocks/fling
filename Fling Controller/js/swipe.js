
// Knick Focks
var Swipe = function(opt){
	var self = this;
	self.options = opt;

	self.init = function(){
		document.getElementById(self.options.id).addEventListener('touchstart',self.onTouchStart);
		document.getElementById(self.options.id).addEventListener('touchmove', self.onTouchMove);
		document.getElementById(self.options.id).addEventListener('touchend', self.onTouchEnd);
	}

	self.remove = function(){
		document.getElementById(self.options.id).removeEventListener('touchstart', self.onTouchStart);
		document.getElementById(self.options.id).removeEventListener('touchmove', self.onTouchMove);
		document.getElementById(self.options.id).removeEventListener('touchend', self.onTouchEnd);
	}

	self.onTouchStart = function(event){
		var touch = event.touches[0];
		self.options.touchStartY = touch.screenY;
		self.options.touchStartX = touch.screenX;
		self.options.touchMoveY = touch.screenY;
		self.options.touchMoveX = touch.screenX;
		if(self.options.touchStartFunction != null) self.options.touchStartFunction(self.options);
	}

	self.onTouchMove = function(event){
		//event.preventDefault();
		var touch = event.touches[0];
		self.options.touchMoveY = touch.screenY;
		self.options.touchMoveX = touch.screenX;
		if(self.options.touchMoveFunction != null) self.options.touchMoveFunction(self.options);
	}

	self.onTouchEnd = function(event){
		if(self.options.touchEndFunction != null) self.options.touchEndFunction(self.options);
		if((Math.abs(self.options.touchStartX - self.options.touchMoveX)) > self.options.threshold && self.options.touchStartX < self.options.touchMoveX && Math.abs(self.options.touchStartX - self.options.touchMoveX) > Math.abs(self.options.touchStartY - self.options.touchMoveY)){
			if(self.options.swipeRightFunction != null) self.options.swipeRightFunction(self.options);
			return;
		}
		if((Math.abs(self.options.touchStartX - self.options.touchMoveX)) > self.options.threshold && self.options.touchStartX > self.options.touchMoveX && Math.abs(self.options.touchStartX - self.options.touchMoveX) > Math.abs(self.options.touchStartY - self.options.touchMoveY)){
			if(self.options.swipeLeftFunction != null) self.options.swipeLeftFunction(self.options);
			return;
		}
		if((Math.abs(self.options.touchStartY - self.options.touchMoveY)) > self.options.threshold && self.options.touchStartY > self.options.touchMoveY && Math.abs(self.options.touchStartY - self.options.touchMoveY) > Math.abs(self.options.touchStartX - self.options.touchMoveX)){
			if(self.options.swipeUpFunction != null) self.options.swipeUpFunction(self.options);
			return;
		}
		if((Math.abs(self.options.touchStartY - self.options.touchMoveY)) > self.options.threshold && self.options.touchStartY < self.options.touchMoveY && Math.abs(self.options.touchStartY - self.options.touchMoveY) > Math.abs(self.options.touchStartX - self.options.touchMoveX)){
			if(self.options.swipeDownFunction != null) self.options.swipeDownFunction(self.options);
			return;
		}
		self.options.noSwipeFunction(self.options);
	}

}
