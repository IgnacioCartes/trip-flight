/*
 * HYNE.js
 *
 *      Small canvas display manager for web games.
 *      This is meant to be a lightweight library to encapsulate the most barebones display logic 
 (create an interval to draw to a canvas) allowing the actual game logic to be completely separated.
 *
 *  Usage:
 *      var display = new HYNE(canvas-width, canvas-height);
 *
 *          Create new display object. This initializes the canvas and its buffer.
 *
 *
 *      display.appendTo(id);
 *
 *          Appends the main canvas inside the element with a specific id.
 *
 *
 *      display.setUpdate(method);
 *
 *          Passes an update function to be called on every frame - passes inputs to the method as
 argument.
 *
 *
 *      display.setRender(method);
 *
 *          Passes a render function to be called on every frame - passes buffer context to the method
 as argument.
 *          Everything drawn to the buffer context will be drawn automatically to the main canvas 
 before the next frame.
 *
 *
 *      display.run();
 *
 *          Starts running the interval that will update the canvas n times per second (according to 
 specified FPS).
 *
 *
 *      display.stop();
 *
 *          Kills the interval.
 *
 */
(function(window, undefined) {
    'use strict';
    
    // Private methods
    var ENV = [];
    
    // Library class - constructor
    var HYNE = function(width, height) {
        
        // Define new environment for this instance
        this.__id = ENV.length;
        this.animation = null;
        
        var newENV = {};
        
        // Environment variables
        newENV.game = this;
        newENV.width = width;
        newENV.height = height;
        newENV.canvas = {
            main: createCanvas(width, height),
            buffer: createCanvas(width, height),
        };
        newENV.canvas.mainCtx = newENV.canvas.main.getContext('2d');
        newENV.canvas.bufferCtx = newENV.canvas.buffer.getContext('2d');
        
        newENV.touchScaling = {x: 1, y: 1};
        
        newENV.canvas.main.id = this.__id;
        
        newENV.fps = 60;
        
        newENV.ticks = 0;
        
        newENV.input = {
            touch: {}
        };
        
        // Create touch listeners
        if (navigator.isCocoonJS) {
            newENV.canvas.main.addEventListener('touchstart', touchstart);
            newENV.canvas.main.addEventListener('touchend', touchend);
        } else {
            newENV.canvas.main.addEventListener('mousedown', mousedown);
            newENV.canvas.main.addEventListener('mouseup', touchend);
        }
        
        // mouse/touch functions
        function mousedown(e) {
            ENV[this.id].input.touch = {
                x: e.x,
                y: e.y,
                tick: ENV[this.id].ticks,
                active: true,
                click: true
            };
            e.preventDefault();
        }
        
        function touchstart(e) {
            ENV[this.id].input.touch = {
                x: e.touches[0].pageX * ENV[this.id].touchScaling.x,
                y: e.touches[0].pageY * ENV[this.id].touchScaling.y,
                tick: ENV[this.id].ticks,
                active: true,
                click: true
            };
            //console.log(e.touches[0].pageX * ENV[this.id].touchScaling.x)
            e.preventDefault();
        }
        
        
        function touchend(e) {
            ENV[this.id].input.touch.active = false;
            e.preventDefault();
        }
        
        // Push new environment
        ENV.push(newENV);
        
        // create 
        
        return this;
    };
    
    // Export module
    window.HYNE = HYNE;
    
    // Public methods
    HYNE.prototype.appendTo = function(element) {
        var el;
        
        if (typeof element === "string") {
            if ((el = document.getElementById(element)) === undefined) {
                this.error("Element \"" + element + "\" was not found!");
                return null;
            }
        } else if ((typeof element === "object") && (element.nodeType)) {
            el = element;
        }
        
        // Update for Cocoon - stretch canvas to screen, adjust scaling
        if (navigator.isCocoonJS) {
            ENV[this.__id].touchScaling.x = ENV[this.__id].width / window.innerWidth;
            ENV[this.__id].touchScaling.y = ENV[this.__id].height / window.innerHeight;
            
            //console.log(ENV[this.__id].touchScaling.x.toString());
            //console.log(ENV[this.__id].touchScaling.y.toString());
            
            ENV[this.__id].canvas.main.style.width = window.innerWidth.toString() + "px";
            ENV[this.__id].canvas.main.style.height = window.innerHeight.toString() + "px";
        }
            
        el.appendChild(ENV[this.__id].canvas.main);
        
        
        return this;
    };
    
    /*
    HYNE.prototype.setFPS = function(fps) {
        if (typeof fps !== 'number') {
            this.error("You must specify a number!");
            return null;
        }
        ENV[this.__id].fps = fps;
        return this;
    };
    */
    
    HYNE.prototype.setUpdate = function(updateMethod) {
        if (typeof updateMethod !== 'function') {
            this.error("You must specify a function!");
            return null;
        }
        ENV[this.__id].update = updateMethod;
        return this;
    };
    
    HYNE.prototype.setRender = function(renderMethod) {
        if (typeof renderMethod !== 'function') {
            this.error("You must specify a function!");
            return null;
        }
        ENV[this.__id].render = renderMethod;
        return this;
    };
    
    HYNE.prototype.run = function() {
        
        if (ENV[this.__id].update === undefined) {
            this.warn("on render method has not been defined!");
        };
        
        this.animation = window.requestAnimationFrame(frame.bind(this, ENV[this.__id]));
        return this;
    };
    
    HYNE.prototype.stop = function() {
        if (this.animation) {
            window.cancelAnimationFrame(this.animation);
            this.animation = null;
        }
        return this;
    };
    
    HYNE.prototype.getTicks = function() {
        return ENV[this.__id].ticks;
    };
    
    HYNE.prototype.clearBuffer = function() {
        ENV[this.__id].canvas.bufferCtx.clearRect(
            0,
            0,
            ENV[this.__id].width,
            ENV[this.__id].height
        );
    };
    
    HYNE.prototype.error = function(message) {
        console.log("ERROR", message);
    };
    
    HYNE.prototype.warn = function(message) {
        console.log("WARNING", message);
    };
    
    // Private methods
    function createCanvas(width, height) {
        var newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        return newCanvas;
    };
    
    function frame(env) {
        env.canvas.mainCtx.clearRect(0, 0, env.width, env.height);
        env.canvas.mainCtx.drawImage(env.canvas.buffer, 0, 0);
        env.ticks++;
        //env.render(env.canvas.bufferCtx);
        env.update.bind(env.game, env.input)();
        env.render.bind(env.game, env.canvas.bufferCtx)();
        
        env.input.touch.click = false;
        
        // rerequest a new animation frame
        if (this.animation) window.requestAnimationFrame(frame.bind(this, env));
    };
    
    
}(window));








