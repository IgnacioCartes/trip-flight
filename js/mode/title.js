GAME.MODE = (function(mode) {
    'use strict';
    
    
    /*
     * GAME MODE VARIABLES
     */
    
    // module
    var title = {};
    
    // reference to main game object
    var game;
    
    // level layout - managed by level.js
    var level;
    
    // Buttons
    var buttons = {};
    
    
    
    /*
     * public void .set(mainGameObj, args)
     *
     *  initializes this game mode
     *
     */
    title.set = function(mainGameObj, args) {
        // Set methods will always pass the main game object as an argument first
        // Here we catch it to have acces to it later
        if (game === undefined) game = mainGameObj;
        
        // Create new level 0 ("intro" level)
        level = new GAME.LEVEL(0);
            
        // Create and position buttons
        buttons.stage_select = new GAME.BUTTON(320 - 96, 192, 192, 32);
        buttons.stage_select.image = new Image();
            
        buttons.best_times = new GAME.BUTTON(320 - 96, 240, 192, 32);
        buttons.best_times.image = new Image();
            
        buttons.about = new GAME.BUTTON(320 - 96, 288, 192, 32);
        buttons.about.image = new Image();
        
    };
    
    
    
    /*
     * public void .update(input)
     *
     *  runs update logic on each frame
     *
     */
    title.update = function(input) {

        // Update button
        buttons.stage_select.update(input);
            
        // React to button
        if (buttons.stage_select.click) game.setMode("PLAY", { level: 1 });
        if (buttons.about.click) console.log("ABOUT");
        
    };
    
    
    
    /*
     * public void .render(context)
     *
     *  draws elements to the main canvas
     *
     */
    title.render = function(context) {
        
        level.render(context, 0);
        buttons.stage_select.render(context, "#FF0000");
        buttons.best_times.render(context, "#FF0000");
        buttons.about.render(context, "#FF0000");
        
    };
    
    
    
    // Return object to global namespace
    mode.TITLE = title;
    return mode;
    
}(GAME.MODE || {}));