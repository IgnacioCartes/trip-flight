GAME.MODE = (function(mode) {
    'use strict';
    
    
    /*
     * GAME MODE VARIABLES
     */
    
    // module
    var best_times = {};
    
    // reference to main game object
    var game;
    
    
    
    // Return object to global namespace
    mode.BEST_TIMES = best_times;
    return mode;
    
}(GAME.MODE || {}));