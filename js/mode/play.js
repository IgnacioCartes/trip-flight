GAME.MODE = (function(mode) {
    'use strict';
    
    
    /*
     * GAME MODE VARIABLES
     */
    
    // yacopu - managed by yacopu.js
    var yacopu;
    
    // level layout - managed by level.js
    var level;
    
    // scrolling
    var scrollX = 0;
    
    // reference to main game object
    var game
    
    // module
    var play = {};
    
    
    
    /*
     * public void .set(mainGameObj, args)
     *
     *  initializes this game mode
     *
     */
    play.set = function(mainGameObj, args) {
        // Set methods will always pass the main game object as an argument first
        // Here we catch it to have acces to it later
        if (game === undefined) game = mainGameObj;
        
        // Create specific level
        level = new GAME.LEVEL(args.level);
        
        // Create yacopu
        yacopu = new GAME.YACOPU();
        yacopu.level = level;
    };
    
    
    
    /*
     * public void .update(input)
     *
     *  runs update logic on each frame
     *
     */
    play.update = function(input) {
        // update yacopu movement
        yacopu.update(game.getTicks());
            
        // flap if a touch occured on this frame
        if (input.touch.click) {
            yacopu.flap();
            console.log(input.touch);
        }
            
        // scroll screen if needed
        if ((yacopu.x - scrollX) > 240) scrollX = Math.floor(yacopu.x - 240);
            
        // Make sure we don't scroll TOO much though
        if (scrollX > level.rightBound) scrollX = level.rightBound;
    };
    
    
    
    /*
     * public void .render(context)
     *
     *  draws elements to the main canvas
     *
     */
    play.render = function(context) {
        level.render(context, scrollX);
        yacopu.render(context, scrollX);
    };
    
    
    
    // Return object to global namespace
    mode.PLAY = play;
    return mode;
    
}(GAME.MODE || {}));