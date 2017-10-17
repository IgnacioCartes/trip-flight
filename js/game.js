var GAME = (function () {
    'use strict';
    
    
    /*
     * GAME VARIABLES
     */
    
    // reference to this instance
    var gameInstance;
    
    // (a very basic) display and timing module - managed by hyne.js
    var display;
    
    // game mode - different scenes within the game
    var mode;
    
    // fade - handles fade in/outs for game mode transitions
    var fade = {
        active: false,
        direction: 0,
        step: 0,
        counter: 0,
        maxCounter: 10,
        callback: null
    };
    
    // key used to access local storage
    var localStorageKey = "com.trip-flight";
    
    

    /*
     * public constructor()
     *
     *  initializes the game and its main elements (display and game modes)
     *
     */
    var game = function () {
        
        // save a reference to this game instance
        gameInstance = this;
        
        // set size
        this.width = 640;
        this.height = 360;
        
        // Create and configure display
        display = new HYNE(this.width, this.height)
            .appendTo(document.body);
        
        // Set update and render methods
        display.setUpdate(updateWrapper)
            .setRender(renderWrapper);
        
        // Set initial mode
        this.setMode("TITLE", { nofade: true });
        
        // Initialize the display
        display.run();
        
        // share save data
        this.save = loadLocalStorageData();
        
        // set initial fadein
        fade.active = true;
        fade.direction = 1;
        fade.step = 0;
        
        
    };
    
    
    
    /*
     * public void .setMode(newMode, argsObj)
     *
     *  sets a new game mode, passing an object containing custom arguments to the new game mode
     *
     */
    game.prototype.setMode = function (newMode, argsObj) {
        
        console.log("setting mode " + newMode);
        
        if (GAME.MODE[newMode]) {
            if (argsObj.nofade) {
                // nofade mode - set mode right away
                GAME.MODE[newMode].set(this, argsObj);
                mode = newMode;
            } else {
                // fade mode - set via fade out -(mode change)-> fade in
                // first, prevent a mode change if a fadeout is already taking place
                if (fade.active) return null;
                
                // set and initiate the fade cycle with the callback to change mode in between
                fade.active = true;
                fade.direction = -1;
                fade.step = 4;
                fade.callback = function() {
                    fade.active = true;
                    fade.direction = 1;
                    fade.step = 0;
                    GAME.MODE[newMode].set(gameInstance, argsObj);
                    mode = newMode;
                };

            }
        }
    };
    
    
    
    /*
     * public number .getTicks()
     *
     *  gets number of elapsed ticks from display object
     *
     */
    game.prototype.getTicks = function () {
        return display.getTicks();
    };
    
    
    
    /*
     * private void updateWrapper(input)
     *
     *  function passed to display, called on each frame to handle update of game objects
     *
     */
    function updateWrapper(input) {
        
        // call update method depending on mode
        GAME.MODE[mode].update(input);
        
        // handle fade in/outs
        if (fade.active) {
            fade.counter++;
            if (fade.counter >= fade.maxCounter) {
                // new step change
                fade.counter = 0;
                fade.opacityChange = true;
                fade.step += fade.direction;
                
                // check if fade needs to end
                if ((fade.step === 0) || (fade.step === 4)) {
                    fade.active = false;
                    // execute callback function if one was specified
                    if (typeof fade.callback === "function") {
                        fade.callback();
                        fade.callback = null;
                    }
                }
            }
        }
        
    }
    
    
    
    /*
     * private void renderWrapper(context)
     *
     *  function passed to display, called on each frame to display objects on game canvas
     *
     */
    function renderWrapper(context) {
        
        // clear buffer before calling individual function for each mode
        this.clearBuffer();
        
        // set alpha depending on fade status
        context.globalAlpha = fade.step / 4;
        
        // set default color and font
        context.fillStyle = "#000000";
        context.font = "10px EarlyGameboy";
        
        // call render method depending on mode
        GAME.MODE[mode].render(context);
        
        // Display screen resolution
        context.fillText(window.innerWidth.toString() + ", " + window.innerHeight.toString(), 64, 64);
        
    }
    
    
    
    /*
     * private object loadLocalStorageData()
     *
     *  loads data from local storage, or creates (and stores) a new one if no data exists
     *
     */
    function loadLocalStorageData() {
        
        var data = window.localStorage.getItem(localStorageKey);
        
        if (!data) {
            // no data in localStorage -- initialize an object
            data = {
                levelsUnlocked: 1,
                bestTimes: [
                    500
                ],
                saveDataCreationDate: new Date()
            };
            gameInstance.saveLocalStorageData(data);
        } else {
            // parse window storage data
            data = JSON.parse(data);
        }
        return data;
    };
    
    
    
    /*
     * public void saveLocalStorageData(data)
     *
     *  stores game data into local storage
     *
     */
    game.prototype.saveLocalStorageData = function(data) {
        
        if (typeof data === "string") {
            // if data was stringified already, store it as it is
            window.localStorage.setItem(localStorageKey, data);
        } else if (typeof data === "object") {
            // otherwise, stringify before storing
            window.localStorage.setItem(localStorageKey, JSON.stringify(data));
        }
        
    }
    
    
    
    // Return object to global namespace
    return game;
    
}());