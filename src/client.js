var GraphicsWorld = require("goom-graphics-js").World;

/**
	Creates a new Client.
	@class Client is used to do all the render & world updates on the client.
	@param {json} config Client configuration.
	@param {Function} send_to_server_callback The function to be called in order to send events to the server.
	@property {Function} sendToServerCallback The function to be called in order to send events to the server.
	@property {WebGLContext} gl the context to draw on.
	@property {Number} viewportWidth the viewport width.
	@property {Number} viewportHeight the viewport height.
	@property {Boolean} isReady If the client ir ready to render this flag is true, otherwise it is false.
	@property {Graphics.World} world The render scene world.
	@property {Function} drawCallback the callback used for rendering. Should always call Client#update.
	@exports Client.
*/
function Client (config, send_to_server_callback) {
	this.sendToServerCallback = send_to_server_callback;
	this.storedEvents = [];
	this.isReady = false;
	this.world = null;
	var canvas_holder = document.getElementById(config.canvas_holder_id);
	//Create the canvas
	var canvas = document.createElement('canvas');
	this.viewportWidth = canvas.width = config.width;
	this.viewportHeight = canvas.height = config.height;
	//canvas.style.display = 'none'; TODO
	canvas_holder.appendChild(canvas);
	//Get webgl context
	this.gl = canvas.getContext("experimental-webgl") || canvas.getContext("webgl");
	//Check for webgl
	if (!this.gl) throw "Your browser does not support webgl.";
	//Initialize the webgl viewport.
	this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
	this.drawCallback = null;
}

/**
	Stores and processes an event form the server.
	@param event The event to be processed.
*/
Client.prototype.receiveEvent = function(event) {
	if (event.type !== "init" && !this.world) {
		if (event.type === "new_player") { this.storedEvents.push(event); }
		return;
	}

	switch(event.type) {
		case "init":
			this.initWorld(event.config);
			this.sendToServerCallback({"type": "ready"});

			//Process the stored events.
			for (var i = 0, len = this.storedEvents.length; i < len; i++) {
				this.receiveEvent(this.storedEvents.shift());
			}

			break;
		case "update_world":
			this.world.updateInstancesFromRemote(event.bodies);
			break;
		case "new_player":
			event.model = event.appearance.model;
			this.world.pause();
			this.world.addInstance(event);
			this.world.resume();
			break;
	}
};

/**
	Initializes the world with the given description.
*/
Client.prototype.initWorld = function(config) {
	var that = this;
	this.world = new Graphics.World(config, this.gl, this.viewportWidth, this.viewportHeight, function() { requestAnimationFrame(that.drawCallback); });
};

/**
	Updates the client scene.
	@param {Number} elapsed milliseconds elapsed since last frame.
*/
Client.prototype.update = function(elapsed) {
	requestAnimationFrame(this.drawCallback);
	//TODO: Update anims?
	this.world.integrateIntances(elapsed * 0.001);//Integration works in seconds :-(
	this.world.draw();
};

Client.prototype.setDrawCallback = function(callback) {
	this.drawCallback = callback;
};

//Export the class
if (window) window.Client = Client;
module.exports = Client;