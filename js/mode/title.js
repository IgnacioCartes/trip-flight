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
        buttons.stage_select = new GAME.BUTTON(320 - 96, 176, 192, 32);
        buttons.stage_select.image = new Image();
        buttons.stage_select.image.src = "assets/images/buttons/start.png";
        buttons.stage_select.text = "Start";
            
        buttons.records = new GAME.BUTTON(320 - 96, 224, 192, 32);
        buttons.records.image = new Image();
        buttons.records.image.src = "assets/images/buttons/records.png";
        buttons.records.text = "Records";
            
        buttons.about = new GAME.BUTTON(320 - 96, 272, 192, 32);
        buttons.about.image = new Image();
        buttons.about.image.src = "assets/images/buttons/about.png";
        buttons.about.text = "About";
        
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
        if (buttons.stage_select.release) game.setMode("STAGE_SELECT", { level: 1 });
        
    };
    
    
    
    /*
     * public void .render(context)
     *
     *  draws elements to the main canvas
     *
     */
    title.render = function(context) {
        
        level.render(context, 0);
        buttons.stage_select.render(context);
        buttons.records.render(context);
        buttons.about.render(context);
        
    };
    
    
    
    // Return object to global namespace
    mode.TITLE = title;
    return mode;
    
}(GAME.MODE || {}));