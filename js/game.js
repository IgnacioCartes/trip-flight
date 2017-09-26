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
    
    // particles - used to show flashy things on screen tap
    var particles = [];
    
    // game mode - different scenes within the game
    var mode;
    
    // buttons
    var button = {};
    
    // game variables
    var introMode = "intro";
    // scrolling
    var scrollX = 0;
    
    
    
    /*
     * game constructor - initialize display and game objects
     */
    var game = function () {
        
        // Create and configure display
        display = new HYNE(640, 360)
            .appendTo("div-game");
        
        // Set update and render methods
        display.setUpdate(updateWrapper)
            .setRender(renderWrapper);
        
        // Set initial mode
        set.intro();
        
        // Start the display
        display.run();
        
    };
    
    
    /*
     * mode initializers
     */
    var set = {
        intro: function() {
            level = new GAME.LEVEL(1);
            button.intro = new GAME.BUTTON(16, 16, 32, 32);
            mode = "intro";
            introMode = "intro";
        },
        play: function(levelId) {
            level = new GAME.LEVEL(levelId);
            yacopu = new GAME.YACOPU();
            yacopu.level = level;
            mode = "play";
            
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
            button.intro.update(input);
            if (button.intro.click) console.log("click!");//set.play(1);
            
            if (introMode === "intro") {
                
            };
            
        },
        play: function(input) {
            // update yacopu movement
            yacopu.update(display.getTicks());
            
            // flap if a touch occured on this frame
            if (input.touch.active) {
                yacopu.flap();
                console.log(input.touch);
            }
            
            // scroll screen if needed
            if ((yacopu.x - scrollX) > 240) scrollX = Math.floor(yacopu.x - 240);
            
            // Make sure we don't scroll TOO much though
            if (scrollX > level.rightBound) scrollX = level.rightBound;
            
        },
        results: function(input) {
            
        },
    }
    
    /*
     * render methods
     */
    var render = {
        intro: function(context) {
            level.render(context, scrollX);
            button.intro.render(context, "#FF0000");
            
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
        
        // call update method depending on mode
        update[mode](input);
        
        // end at 600 ticks (10~ seconds)
        //if (this.getTicks() === 600) { display.stop(); }
        
    }
    
    function renderWrapper(context) {
        
        // clear buffer before calling individual function for each mode
        this.clearBuffer();
        
        // call render method depending on mode
        render[mode](context);
        
        // show ticks on div
        document.getElementById("log").innerHTML = this.getTicks();
        
    }
    
    
    // Return object to global namespace
    return game;
    
}());