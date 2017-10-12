GAME.YACOPU = (function() {
    'use strict';
    
    /*
     * Global variables and constants
     */
    var image;
    
    // animation loops
    var animations = {
        "still": [
            {
                "frame": 0,
                "duration": -1
            }
        ],
        "ascending": [
            {
                "frame": 1,
                "duration": 6
            },
            {
                "frame": 2,
                "duration": 6
            },
            {
                "frame": 3,
                "duration": 6
            },
            {
                "frame": 4,
                "duration": 6
            }
        ],
        "descending": [
            {
                "frame": 3,
                "duration": -1
            }
        ],
        "sliding": [
            {
                "frame": 6,
                "duration": -1
            }
        ]
    };
    
    
    
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
        this.goal = false;
        
        this.onGround = 0;
        this.lastOnGround = 0;
        this.thisFrameOnGround = true;
        
        this.level = null;
        
        this.speedX = 0;
        this.speedY = 0;
        
        this.maxSpeed = 0;
        this.bonks = 0;
        
        this.animation = {
            name: "",
            step: 0,
            totalSteps: 0,
            left: 0,
            frame: 0
        };
        
        this.setAnimation("still");
        
        // Preload image if needed
        if (image === undefined) {
            image = new Image();
            image.src = "assets/yacopu.png";
        }
        
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
        
        // Quit inmediately if image has not been loaded
        if (!image.complete) return null;
        
        // Calculate coords to draw image
        var thisx = 2 * Math.round((this.x - scrollX) / 2);
        var thisy = 2 * Math.round((this.y) / 2) + 2;
        
        // Draw yacopu
        var animPos = this.animation.frame * 32;
        context.drawImage(image, animPos, 0, 32, 32, thisx, thisy, 32, 32);
        
        // debug
        context.font = "12px Arial";
        context.fillStyle = "#543210";
        context.fillText("speed: " + this.speedX.toString() + ", " + this.speedY.toString(), 0, 16);
        context.fillText("position: " + this.x.toString() + ", " + this.y.toString(), 0, 32);
        context.fillText("onGround: " + this.lastOnGround.toString(), 0, 192);
        
        // speed
        if (this.speedX > 0) {
            context.fillStyle = "#A03010";
            context.fillRect(0, 352, Math.floor(this.speedX * 8), 359);
        }
        
        
    };
    
    
    
    /*
     * public void .update(ticks)
     *
     *  updates yacopu's speed and position on every frame, and handles level interaction
     *
     */
    yacopu.prototype.update = function (game) {
        
        // get ticks
        var ticks = game.getTicks();
        
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
        if (this.speedY < 24) this.speedY++;
        
        // if standing on ground, cancel Y acceleration if positive
        if (tileUnder.solid) {
            // if going down
            if (this.speedY > 0) {
                
                // determine whether to bounce or fullstop
                if (tileUnder.bounce) {
                    this.speedY = -this.speedY * tileUnder.bounce;
                } else {
                    this.speedY = 0;
                }
            }
            
            // deaccelerate after 2 frames on ground unless floor is slippery
            if (this.speedX > 0 && !tileUnder.slippery && (this.onGround >= 2)) this.speedX--;
            
            // "snap to grid"
            this.y = 32 * parseInt(this.y / 32);
            this.onGround++;
        } else {
            // reset onground counter
            this.onGround = 0;
        }
        
        // detect "special" ground (slopes)
        if (tileUnder.slope) {
            // calculate position within the tile
            var xWithinTile = Math.floor(this.x + 16) % 32;
            var yWithinTile = Math.floor(this.y + 32) % 32;
            // positive acceleration (slope descending forward)
            if (tileUnder.slope === 1) {
                // only consider slope if we're close enough to the actual diagonal
                // (lets avoid snapping the player to the slope just for being within its tile)
                if ((yWithinTile - xWithinTile) >= -16) {
                
                    // keep "snapped to slope" unless we're flapping away (y speed negative)
                    if (this.speedY >= 0)
                        this.y = 32 * parseInt(this.y / 32) + xWithinTile;
                
                    // accelerate fast to 24
                    if (this.speedX < 24) {
                        this.speedX++;
                    } else {
                        // then slow down acceleration (every other frame)
                        if (ticks % 2) this.speedX++;
                    }
                }
            // negative acceleration (slope descending backwards)
            }
        };
        
        // If hitting an obstacle with head, cancel upwards velocity and "snap to grid"
        if (tileAbove.solid) {
            // determine whether to bounce or fullstop
            if (tileAbove.bounce) {
                this.speedY = -this.speedY * tileAbove.bounce;
            } else {
                this.speedY = 0;
            }
            this.y = 32 * Math.round((this.y / 32));
        };
        
        // If hitting an obstacle face first, stop fully and "snap to grid"
        if (tileAhead.solid) {
            // if we were going too fast, count this as a "bonk"
            if (this.speedX >= 16) {
                this.bonks++;
                console.log("bonk!");
            }
            
            // determine whether to bounce or fullstop
            if (tileAhead.bounce) {
                this.speedX = -this.speedX * tileAhead.bounce;
            } else {
                this.speedX = 0;
            }
            
            this.x = 32 * parseInt(this.x / 32);
        };
        
        // Vertical movement if flying and not on ground (simulates holding right)
        if (this.flying && this.speedX < 24 && !(tileUnder.solid || tileUnder.slope)) this.speedX++;
        
        // Actually move based on speed
        this.x += (this.speedX / 8);
        this.y += (this.speedY / 8);
        
        // record max speed
        if (this.speedX > this.maxSpeed) this.maxSpeed = this.speedX;
        
        // Check if goal has been reached
        if (!this.goal) {
            if (this.x >= (this.level.goal * 32)) {
                console.log("GOAL! " + (this.x - (this.level.goal * 32)).toString());
                console.log("max speed: " + this.maxSpeed.toString());
                console.log("bonks: " + this.bonks.toString());
                this.goal = true;
            };
        };
        
        // Determine proper animation
        if (tileUnder.solid || tileUnder.slope) {
            // If standing on something...
            // Set animation depending on xspeed
            if (this.speedX > 0) {
                this.setAnimation("sliding");
            } else {
                this.setAnimation("still");
            }
        } else {
            // If on midair
            // Set animation depending on yspeed
            if (this.speedY > 0) {
                this.setAnimation("descending");
            } else {
                this.setAnimation("ascending");
            }
        }
        
        // Update animation
        updateAnimation(this.animation);
        
        // store onground status to be used by "flop"
        this.thisFrameOnGround = (tileUnder.solid || tileUnder.slope);
        
          
    };
    
    
    
    /*
     * public void .flap()
     *
     *  activates a "flap", which is yacopu gaining upwards velocity
     *
     */
    yacopu.prototype.flap = function (game) {
        
        // If the goal has been reached already, ignore
        if (this.goal) return null;
        
        // If standing on ground, give uncapped X acceleration
        if (this.thisFrameOnGround) {
            this.speedX += 6;
            this.speedY = 0;
            this.lastOnGround = this.onGround;
        };
        
        // Iniciate flight
        if (!this.flying) this.flying = true;
        
        // Upwards velocity
        if (this.speedY >= -24) this.speedY -= 16;
        
    };
    
    
    
    /*
     * public void .setAnimation(animId)
     *
     *  initializes a new animation
     *
     */
    yacopu.prototype.setAnimation = function (animId) {
        
        // If trying to set to already active animation, ignore
        if (this.animation.name === animId) return null;
        
        // Set animation variables, to step 0
        this.animation.name = animId;
        this.animation.step = 0;
        this.animation.totalSteps = animations[animId].length;
        this.animation.left = animations[animId][0].duration;
        this.animation.frame = animations[animId][0].frame;
    };
    
    
    
    /*
     * private void updateAnimation(anim)
     *
     *  advances animation by one frame
     *
     */
    function updateAnimation (anim) {
        
        // Time left being negative means no change
        if (anim.left < 0) return null;
        
        // else decrease by 1
        anim.left--;
        
        // If it reaches 0, advance one step of the animation cycle
        if (anim.left === 0) {
            // Increase step by 1
            anim.step++;
            
            // If step exceedes number, cycle back to 0
            if (anim.step === anim.totalSteps) anim.step = 0;
            
            // Set new timeleft and frame values
            anim.left = animations[anim.name][anim.step].duration;
            anim.frame = animations[anim.name][anim.step].frame;
        };
        
    };
    
    
    
    // Return object to global namespace
    return yacopu;
    
}());