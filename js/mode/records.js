GAME.MODE = (function(mode) {
    'use strict';
    
    
    /*
     * GAME MODE VARIABLES
     */
    
    // module
    var records = {};
    
    // reference to main game object
    var game;
    
    
    
    // Return object to global namespace
    mode.RECORDS = records;
    return mode;
    
}(GAME.MODE || {}));