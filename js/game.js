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
        maxCounter: 5,
        callback: null
    };

    // key used to access local storage
    var localStorageKey = "com.trip-flight";

    // text display storage
    var text = [];



    /*
     * public constructor ()
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
        this.setMode("TITLE", {
            nofade: true
        });

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
     * public void .setMode (newMode, argsObj)
     *
     *  sets a new game mode, passing an object containing custom arguments to the new game mode
     *
     */
    game.prototype.setMode = function (newMode, argsObj) {

        console.log("setting mode " + newMode);

        argsObj = argsObj || {};

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
                fade.callback = function () {
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
     * public bool .isFade()
     *
     *  returns whether there is a fade effect taking place
     *
     */
    game.prototype.isFade = function () {
        return fade.active;
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

        // call render method depending on mode
        GAME.MODE[mode].render(context);

        // Render text
        renderText(context);

        // Display screen resolution
        //context.fillText(window.innerWidth.toString() + ", " + window.innerHeight.toString(), 64, 64);

    }



    /*
     * public void pushTextToRender (textObject)
     *
     *  adds a text to the array to be rendered
     *
     */
    game.prototype.pushTextToRender = function (textObject) {
        text.push(textObject);
    }




    /*
     * private void renderText(context)
     *
     *  renders all text passed to the this.text array every frame
     *
     */
    function renderText(context) {

        // do nothing if there is no text
        if (!text) return null;
        var len = text.length;
        if (len === 0) return null;


        // Set Font
        context.font = "16px EarlyGameboy";

        // Outline properties
        context.strokeStyle = "#000000";
        context.lineWidth = 4;

        // Render outlines first
        for (var i = 0; i < len; i++)
            context.strokeText(text[i].text, text[i].x, text[i].y);

        // Text properties
        context.fillStyle = "#FFFFFF";

        // Render text on top of outline
        for (var i = 0; i < len; i++)
            context.fillText(text[i].text, text[i].x, text[i].y);

        // Clean array
        text = [];

    }



    /*
     * private object loadLocalStorageData()
     *
     *  loads data from local storage, or creates (and stores) a new one if no data exists
     *
     */
    function loadLocalStorageData() {

        var data = window.localStorage.getItem(localStorageKey);
        //var data;   // used to create new localStorage

        if (!data) {
            // no data in localStorage -- initialize an object
            data = {
                levelsUnlocked: 1,
                bestTimes: [
                    {
                        date: null,
                        time: 99999
                    },
                    {
                        date: null,
                        time: 99999
                    },
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
     * public void saveLocalStorageData (data)
     *
     *  stores game data into local storage
     *
     */
    game.prototype.saveLocalStorageData = function (data) {

        if (typeof data === "string") {
            // if data was stringified already, store it as it is
            window.localStorage.setItem(localStorageKey, data);
        } else if (typeof data === "object") {
            // otherwise, stringify before storing
            window.localStorage.setItem(localStorageKey, JSON.stringify(data));
        }

    }



    /*
     * public void reportRaceTime (raceTime, level)
     *
     *  takes race time obtained during a race and tracks whether a new record was achieved
     *
     */
    game.prototype.reportRaceTime = function (raceTime, level) {

        var saveLevelId = level - 1;
        // compare racetime with record
        if (raceTime < this.save.bestTimes[saveLevelId].time) {
            // new record!
            this.save.bestTimes[saveLevelId].time = raceTime;
            this.save.bestTimes[saveLevelId].date = new Date();
            this.saveLocalStorageData(this.save);
            return true;
        } else {
            return false;
        }


    }



    // Return object to global namespace
    return game;

}());
