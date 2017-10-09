GAME.MODE = (function(mode) {
    'use strict';
    
    
    /*
     * GAME MODE VARIABLES
     */
    
    // module
    var results = {};
    
    // reference to main game object
    var game;
    
    
    
    // Return object to global namespace
    mode.RESULTS = results;
    return mode;
    
}(GAME.MODE || {}));