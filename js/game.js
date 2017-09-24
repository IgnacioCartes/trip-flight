var GAME = (function () {
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
    
    // game mode - different scenes within the game
    var mode;
    
    // references this object
    var game;
    
    // scrolling variables
    var scrollX = 0;
    
    
    
    
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
        set.play(1);
        
        // Start the display
        display.run();
        
    };
    
    
    /*
     * mode initializers
     */
    var set = {
        intro: function() {
            mode = "intro";
            
        },
        play: function(levelId) {
            level = new LEVEL(levelId);
            yacopu = new YACOPU();
            yacopu.level = level;
            mode = "play";
            console.log(yacopu);
            
        },
        results: function() {
            mode = "results";
            
        },
    }
    
    
    /*
     * update methods
     */
    var update = {
        intro: function(input) {
            
        },
        play: function(input) {
            // update yacopu movement
            yacopu.update(display.getTicks());
            
            // flap if a touch occured on this frame
            if (input.touch.active) yacopu.flap();
            
            // scroll screen if needed
            if ((yacopu.x - scrollX) > 240) scrollX = Math.floor(yacopu.x - 240);
            
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
            level.render(context, scrollX);
            yacopu.render(context, scrollX);
        },
        results: function(context) {
            
        },
    }
    
    /*
     * wrapper methods
     */
    
    function updateWrapper(input) {
        
        update[mode](input);
        if (this.getTicks() === 600) { display.stop(); }
        
    };
    
    function renderWrapper(context) {
        
        // clear buffer before calling individual function for each mode
        this.clearBuffer();
        
        render[mode](context);
        
        document.getElementById("log").innerHTML = this.getTicks();
        
    }
    
    return game;
    
}());