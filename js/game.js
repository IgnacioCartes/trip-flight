var GAME = (function () {
    'use strict';
    
    
    /*
     * GAME VARIABLES
     */
    
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
    
    

    /*
     * public constructor()
     *
     *  initializes the game and its main elements (display and game modes)
     *
     */
    var game = function () {
        
        // Create and configure display
        display = new HYNE(640, 360)
            .appendTo(document.body);
        
        // Set update and render methods
        display.setUpdate(updateWrapper)
            .setRender(renderWrapper);
        
        // Set initial mode
        //set.intro();
        this.setMode("TITLE");
        
        // Start the display
        display.run();
        
        // share save data
        this.save = save;
        
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
            GAME.MODE[newMode].set(this, argsObj);
            mode = newMode;
        };
        
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
        
        // end at 600 ticks (10~ seconds)
        //if (this.getTicks() === 600) { display.stop(); }
        
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
        
        // make sure global alpha is set to 1
        context.globalAlpha = 1;
        
        // call render method depending on mode
        GAME.MODE[mode].render(context);
        
        // Display screen resolution
        context.fillText(window.innerWidth.toString() + ", " + window.innerHeight.toString(), 64, 64);
        
        // show ticks on div
        //document.getElementById("log").innerHTML = this.getTicks();
        
    }
    
    
    
    // Return object to global namespace
    return game;
    
}());