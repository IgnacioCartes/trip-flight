var GAME = (function () {
    'use strict';
    
    
    /*
     * GAME VARIABLES
     */
    
    // reference to this instance
    var gameInstance;
    
    // (a very basic) display and timing module - managed by hyne.js
    var display;
    
    // game mode - different scenes within the game
    var mode;
    
    // different saved properties -- now just set by default
    var save = {
        levelsUnlocked: 1,
        bestTimes: [
            500
        ]
    };
    
    // fade - handles fade in/outs for game mode transitions
    var fade = {
        active: false,
        direction: 0,
        step: 0,
        counter: 0,
        maxCounter: 10,
        callback: null
    };
    
    // particles collection
    var particles = [];
    
    

    /*
     * public constructor()
     *
     *  initializes the game and its main elements (display and game modes)
     *
     */
    var game = function () {
        
        // set size
        this.width = 640;
        this.height = 360;
        
        // Create and configure display
        display = new HYNE(this.width, this.height)
            .appendTo(document.body);
        
        // Set update and render methods
        display.setUpdate(updateWrapper)
            .setRender(renderWrapper);
        
        // create curtain to be used to transition modes
        //curtain = new GAME.CURTAIN();
        
        //curtain.activate("tiled", null, { direction: "in" });
        
        // Set initial mode
        //set.intro();
        this.setMode("TITLE", { nofade: true });
        
        // Start the display
        display.run();
        
        // share save data
        this.save = save;
        
        // set initial fadein
        fade.active = true;
        fade.direction = 1;
        fade.step = 0;
        
        // save a reference to this game instance
        gameInstance = this;
        
    };
    
    
    
    /*
     * public void .setMode(newMode, argsObj)
     *
     *  sets a new game mode, passing an object containing custom arguments to the new game mode
     *
     */
    game.prototype.setMode = function (newMode, argsObj) {
        
        console.log("setting mode " + newMode);
        
        if (GAME.MODE[newMode]) {
            if (argsObj.nofade) {
                // nofade mode - set mode right away
                GAME.MODE[newMode].set(this, argsObj);
                mode = newMode;
            } else {
                // fade mode - set via fade out -(mode change)-> fade in
                // first, prevent a mode change if a fadeout is already taking place
                if (fade.active) return null;
                fade.active = true;
                fade.direction = -1;
                fade.step = 4;
                fade.callback = function() {
                    fade.active = true;
                    fade.direction = 1;
                    fade.step = 0;
                    GAME.MODE[newMode].set(gameInstance, argsObj);
                    mode = newMode;
                };

            }
        }
        
        
    };
    
    
    
    /*
     * public number .getTicks()
     *
     *  gets number of elapsed ticks from display object
     *
     */
    game.prototype.getTicks = function () {
        return display.getTicks();
    };
    
    
    
    /*
     * private void updateWrapper(input)
     *
     *  function passed to display, called on each frame to handle update of game objects
     *
     */
    function updateWrapper(input) {
        
        // call update method depending on mode
        GAME.MODE[mode].update(input);
        
        // update curtain
        //curtain.update(input);
        // end at 600 ticks (10~ seconds)
        //if (this.getTicks() === 600) { display.stop(); }
        
        // handle fade in/outs
        if (fade.active) {
            fade.counter++;
            if (fade.counter >= fade.maxCounter) {
                // new step change
                fade.counter = 0;
                fade.opacityChange = true;
                fade.step += fade.direction;
                
                // check if fade needs to end
                if ((fade.step === 0) || (fade.step === 4)) {
                    fade.active = false;
                    // do a callback function if one was specified
                    if (typeof fade.callback === "function") {
                        fade.callback();
                        fade.callback = null;
                    }
                }
            }
        }
        
    }
    
    
    
    /*
     * private void renderWrapper(context)
     *
     *  function passed to display, called on each frame to display objects on game canvas
     *
     */
    function renderWrapper(context) {
        
        // clear buffer before calling individual function for each mode
        this.clearBuffer();
        
        // set alpha depending on fade status
        context.globalAlpha = fade.step / 4;
        
        // call render method depending on mode
        GAME.MODE[mode].render(context);
        
        // display particles
        for(var i = particles.length - 1; i >= 0; i--) {
            var thisParticle = particles[i];
            // call their render method
            thisParticle.render(context, scrollX);
            
        };
        
        // Display screen resolution
        context.fillText(window.innerWidth.toString() + ", " + window.innerHeight.toString(), 64, 64);
        
        // show ticks on div
        //document.getElementById("log").innerHTML = this.getTicks();
        
    }
    
    
    
    // Return object to global namespace
    return game;
    
}());