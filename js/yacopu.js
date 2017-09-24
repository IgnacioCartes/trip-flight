var YACOPU = (function() {
    'use strict';
    
    /*
     * public constructor(x, y)
     *
     *  sets initial variables for yacopu
     *
     */
    var yacopu = function(x, y) {
        this.x = x || 64;
        this.y = y || 288;
        this.alive = true;
        this.flying = false;
        this.crash = false;
        
        this.level = 0;
        
        this.speedX = 0;
        this.speedY = 0;
    };
    
    
    
    /*
     * public void .render(context, scrollX)
     *
     *  draws Yacopu on the provided canvas context, shifted according to the scroll x value
     *
     */
    yacopu.prototype.render = function (context, scrollX) {
        
        /* display:
         *
         *  to properly "simulate" 2x effect, sprites coords should be rounded to the nearest even number
         *
         *  speaking numbers, 2 canvas pixels = 16 ingame subpixels (sub-units)
         *  ...so 1 canvas pixel = 8 ingame subpixels - this will be reflected in the update method
         *
         */
        
        var thisx = 2 * Math.round((this.x - scrollX) / 2);
        var thisy = 2 * Math.round((this.y) / 2);
        context.fillStyle = "#FFFF00";
        context.fillRect(thisx, thisy, 32, 32);
        
        // debug
        context.font = "12px Arial";
        context.fillStyle = "#000000";
        context.fillText("speed: " + this.speedX.toString() + ", " + this.speedY.toString(), 0, 16);
        context.fillText("position: " + this.x.toString() + ", " + this.y.toString(), 0, 32);
        
    };
    
    
    
    /*
     * public void .update(ticks)
     *
     *  updates yacopu's speed and position on every frame, and handles level interaction
     *
     */
    yacopu.prototype.update = function (ticks) {
        
        // Determine relevant surroundings (tiles below and ahead)
        var tileUnder = this.level.tileAt(this, 16, 32);
        var tileAbove = this.level.tileAt(this, 16, 0);
        var tileAhead = this.level.tileAt(this, 32, 16);
        
        // Horizontal deacceleration every 16 frames
        if ((ticks % 16) === 0) {
            if (this.speedX > 0) this.speedX--;
            if (this.speedX < 0) this.speedX++;
        }
        
        // Gravity
        if (this.speedY < 48) this.speedY++;
        
        // if standing on ground, cancel Y acceleration if positive, deaccelerate in X and "snap to grid"
        if (tileUnder.solid) {
            if (this.speedY > 0) this.speedY = 0;
            if (this.speedX > 0) this.speedX--;
            this.y = 32 * parseInt(this.y / 32);
        };
        
        // If hitting an obstacle face first, stop fully and "snap to grid"
        if (tileAhead.solid) {
            this.speedX = 0;
            this.x = 32 * parseInt(this.x / 32);
        };
        
        // If hitting an obstacle with head, cancel upwards velocity and "snap to grid"
        if (tileAbove.solid) {
            this.speedY = 0;
            this.y = 32 * parseInt(this.y / 32);
        };
        
        // Vertical movement if flying and not on ground (simulates holding right)
        if (this.flying && this.speedX < 24 && !tileUnder.solid) this.speedX++;
        
        // Actually move based on speed
        this.x += (this.speedX / 8);
        this.y += (this.speedY / 8);
        
    };
    
    
    
    /*
     * public void .flap()
     *
     *  activates a "flap", which is yacopu gaining upwards velocity
     *
     */
    yacopu.prototype.flap = function( ) {
        
        // If standing on ground, give uncapped X acceleration
        if (this.level.tileAt(this, 16, 32).solid) this.speedX += 4;
        
        // Iniciate flight
        if (!this.flying) this.flying = true;
        
        // Upwards velocity
        if (this.speedY >= -24) this.speedY -= 16;
        
    };
    
    
    
    // Return object to global namespace
    return yacopu;
    
}());