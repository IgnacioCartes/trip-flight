var game = (function () {
    'use strict';
    
    
    /*
     * GAME VARIABLES
     */
    
    // (a very basic) display and timing module - managed by hyne.js
    var display;

    // yacopu - managed by yacopu.js
    var yacopu;
    
    // level layout - managed by level.js
    var level;
    
    // game mode - manages different scenes
    var mode;
    
    // this
    var game;
    
    
    
    
    
    /*
     * game constructor - initialize display and game objects
     */
    var game = function () {
        
        // Create and configure display
        display = new HYNE(640, 360)
            .appendTo("game")
            .setFPS(60);
        
        // Set update and render methods
        display.setUpdate(updateWrapper);
        display.setRender(renderWrapper);
        
        // Set initial mode
        mode = "intro";
    
        // Start the display
        display.run();
        
    };
    
    
    /*
     * update methods
     */
    var update = {
        intro: function(input) {
        },
        play: function(input) {
            
        },
        results: function(input) {
            
        },
    }
    
    /*
     * render methods
     */
    var render = {
        intro: function(context) {
            
        },
        play: function(context) {
            
        },
        results: function(context) {
            
        },
    }
    
    /*
     * wrapper methods
     */
    
    function updateWrapper(context) {
        
        update[mode].bind({})();
        
        if (this.getTicks() === 200) {
            console.log(context);
            display.stop();
        }
        
    };
    
    function renderWrapper(context) {
        
        // clear buffer before calling individual function for each mode
        this.clearBuffer();
        
        render[mode].bind(this, context)();
        
        document.getElementById("log").innerHTML = this.getTicks();
        
    }
    
    return game;
    
}());