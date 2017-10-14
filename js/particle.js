GAME.PARTICLE = (function() {
    'use strict';
    
    /*
     * Global variables and constants
     */
    var image;
    
    // templates
    var templates = {
        // touchsparkles -- are created when the player taps on the screen during play mode
        "touchsparkle": function() {
            // random initial speeds
            this.speedX = (Math.random() * 8) - 4;
            this.speedY = (Math.random() * 8) - 4;
            
            // constant acceleration
            this.accelX = 0;
            this.accelY = 0.25;
            
            // kill when they reach the bottom of the screen
            this.killCondition = function() {
                if (this.y > 360) return true;
            };
            
            // display
            this.color = "#ffe740";
        }
    };
    
    
    
    /*
     * public constructor(x, y)
     *
     *  sets initial variables for the particle
     *
     */
    var particle = function(x, y, args) {
        this.x = x;
        this.y = y;
        this.alive = true;
        
        // if there was a valid template provided, use it
        // otherwise initialize everything to null
        if (args.template && (typeof templates[args.template] === "function")) {
            templates[args.template].bind(this)();
        } else {
            this.speedX = 0;
            this.speedY = 0;
            this.accelX = 0;
            this.accelY = 0;
        
            this.killCondition = function() {
                if (this.lifespan >= 60) return true;
            };
            
            this.color = "#000000";
        }
        
        this.evenOnly = true;
    
        // lifespan to 0
        this.lifespan = 0;
    };
    
    
    
    /*
     * public void .render(context, scrollX)
     *
     *  draws the particle on the provided canvas context, shifted according to the scroll x value
     *
     */
    particle.prototype.render = function (context, scrollX) {
        
        // do nothing if particle is dead
        if (!this.alive) return null;
        
        var thisx = this.x - scrollX;
        var thisy = this.y
        
        // calculate coordinates
        if (this.evenOnly) {
            thisx = 2 * Math.round((thisx) / 2);
            thisy = 2 * Math.round((thisy) / 2) + 2;
        }
        
        // don't bother drawing if they're offscreen
        if ((thisx < -8) || (thisy < -8)) return null;
        
        // draw
        context.fillStyle = this.color || "#000000";
        context.fillRect(thisx, thisy, 8, 8);
        
    };
    
    
    
    /*
     * public void .update(ticks)
     *
     *  updates the particle movement
     *
     */
    particle.prototype.update = function (game) {
        
        // do nothing if particle is dead
        if (!this.alive) return null;
        
        // move
        this.x += this.speedX;
        this.y += this.speedY;
        
        // accelerate
        this.speedX += this.accelX;
        this.speedY += this.accelY;
        
        // increase lifespan
        this.lifespan++;
        
        // kill particle one its kill condition is true
        if (this.killCondition()) this.alive = false;
        
    };
    
    
    
    // Return object to global namespace
    return particle;
    
}());