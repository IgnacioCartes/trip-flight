GAME.MODE = (function(mode) {
    'use strict';
    
    
    /*
     * GAME MODE VARIABLES
     */
    
    // module
    var play = {};
    
    // reference to main game object
    var game;
    
    // yacopu - managed by yacopu.js
    var yacopu;
    
    // level layout - managed by level.js
    var level;
    
    // horizontal scrolling
    var scrollX = 0;
    
    // time-related variables
    var raceTime, countdownTime, initialTimeStamp;
    var hasRaceStarted = false;
    
    // flap history
    var flapHistory = [];
    
    // collection of particles
    var particleCollection = [];
    
    
    
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
        
        // Initialize timer variables
        raceTime = 0;
        countdownTime = 60 * 3;
        initialTimeStamp = game.getTicks();
        
        hasRaceStarted = false;
        
        flapHistory = [];
    };
    
    
    
    /*
     * public void .update(input)
     *
     *  runs update logic on each frame
     *
     */
    play.update = function(input) {
        
        // do nothing until actual race has started
        if (!hasRaceStarted) {
            // count every 60 frames
            if ((countdownTime % 60) === 0)
                console.log(countdownTime / 60);
            
            // when countdown hits 0, start race
            if (countdownTime-- <= 0)
                hasRaceStarted = true;
            
            return null;
        };
        
        // update yacopu movement
        yacopu.update(game);
        
        // update particles - go through loop in reverse order
        for(var i = particleCollection.length - 1; i >= 0; i--) {
            var thisParticle = particleCollection[i];
            // call their update method
            thisParticle.update(game);
            
            // splice particle away if its dead
            if (!thisParticle.alive) {
                particleCollection.splice(i, 1);
            }
            
        };
            
        // flap if a touch occured on this frame
        if (input.touch.click) {
            yacopu.flap(game);
            
            // track "flap history"
            if (!yacopu.goal) flapHistory.push(raceTime);
            
            // create new random particles
            for (var i = 0; i < 8; i++) {
                var newParticle = new GAME.PARTICLE(input.touch.x + scrollX, input.touch.y, { template: "touchsparkle" });
                particleCollection.push(newParticle);
            };
            console.log(particleCollection.length);
        }
            
        // scroll screen if needed
        if ((yacopu.x - scrollX) > 240) scrollX = Math.floor(yacopu.x - 240);
            
        // Make sure we don't scroll TOO much though
        if (scrollX > level.rightBound) scrollX = level.rightBound;
        
        // Increase race time
        if (!yacopu.goal) {
            raceTime++;
        }
    };
    
    
    
    /*
     * public void .render(context)
     *
     *  draws elements to the main canvas
     *
     */
    play.render = function(context) {
        // display level and yacopu
        level.render(context, scrollX);
        yacopu.render(context, scrollX);
        
        // display particles
        for(var i = particleCollection.length - 1; i >= 0; i--) {
            var thisParticle = particleCollection[i];
            // call their render method
            thisParticle.render(context, scrollX);
            
        };
        
        var roundraceTime = Math.round((raceTime / 60) * 100) / 100;
        
        context.fillStyle = "#3377BB";
        context.fillText((roundraceTime).toString(), 512, 16);
        
    };
    
    
    
    // Return object to global namespace
    mode.PLAY = play;
    return mode;
    
}(GAME.MODE || {}));