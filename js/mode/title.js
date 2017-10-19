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
    
    // particles
    var particles = [];
    
    
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
        buttons.stage_select.frameOnActive = 1;
            
        buttons.records = new GAME.BUTTON(320 - 96, 224, 192, 32);
        buttons.records.image = new Image();
        buttons.records.image.src = "assets/images/buttons/records.png";
        buttons.records.text = "Records";
        buttons.records.frameOnActive = 1;
            
        buttons.about = new GAME.BUTTON(320 - 96, 272, 192, 32);
        buttons.about.image = new Image();
        buttons.about.image.src = "assets/images/buttons/about.png";
        buttons.about.text = "About";
        buttons.about.frameOnActive = 1;
        
    };
    
    
    
    /*
     * public void .update(input)
     *
     *  runs update logic on each frame
     *
     */
    title.update = function(input) {

        // update particles
        GAME.PARTICLE.updateAll(particles, game);
        
        // run particle generators for level if any
        GAME.PARTICLE.runParticleGenerators(particles, game, level.particleGenerator, { scrollX: scrollX });
        
        // Update buttons when no fade
        if (!game.isFade()) {
            buttons.stage_select.update(input);
            buttons.records.update(input);
            buttons.about.update(input);
            
            // React to button
            if (buttons.stage_select.release) game.setMode("STAGE_SELECT");
        }
        
    };
    
    
    
    /*
     * public void .render(context)
     *
     *  draws elements to the main canvas
     *
     */
    title.render = function(context) {
        
        // render background level
        level.render(context, 0);
        
        // set font style for buttons
        //context.fontStyle = 
        
        // render buttons if no fade
        if (!game.isFade()) {
            buttons.stage_select.render(context);
            buttons.records.render(context);
            buttons.about.render(context);
        }
        
        // display particles
        GAME.PARTICLE.renderAll(particles, context, scrollX);
    };
    
    
    
    // Return object to global namespace
    mode.TITLE = title;
    return mode;
    
}(GAME.MODE || {}));