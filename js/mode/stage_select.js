GAME.MODE = (function (mode) {
    'use strict';


    /*
     * GAME MODE VARIABLES
     */

    // module
    var stage_select = {};

    // reference to main game object
    var game;

    // Buttons
    var buttons = {};

    // level preview names
    var levelPreview = [
        "BATTO CAVE",
        "ROCK CASTLE"
    ];
    var selectedLevel = 1;



    /*
     * public void .set(mainGameObj, args)
     *
     *  initializes this game mode
     *
     */
    stage_select.set = function (mainGameObj, args) {
        // Set methods will always pass the main game object as an argument first
        // Here we catch it to have acces to it later
        if (game === undefined) game = mainGameObj;

        // Create new level 0 ("intro" level)
        //level = new GAME.LEVEL(0);

        // Create and position buttons

        buttons.play = new GAME.BUTTON(192, 224, 256, 32);
        buttons.play.image = new Image();
        buttons.play.text = levelPreview[selectedLevel - 1];

        buttons.previous = new GAME.BUTTON(96, 208, 64, 64);
        buttons.previous.image = new Image();
        buttons.previous.text = "<";

        buttons.next = new GAME.BUTTON(480, 208, 64, 64);
        buttons.next.image = new Image();
        buttons.next.text = ">";


        buttons.title = new GAME.BUTTON(192, 272, 256, 32);
        buttons.title.image = new Image();
        buttons.title.text = "Title Screen";

    };



    /*
     * public void .update(input)
     *
     *  runs update logic on each frame
     *
     */
    stage_select.update = function (input) {

        // wait until no fade
        if (game.isFade()) return null;

        // Update button
        buttons.play.update(input);
        buttons.previous.update(input);
        buttons.next.update(input);
        buttons.title.update(input);

        // Play the selected level...
        if (buttons.play.release) game.setMode("PLAY", {
            level: selectedLevel
        });

        // ...or go back to title screen
        if (buttons.title.release) game.setMode("TITLE");

        // level selectors - previous and next
        if (buttons.previous.release) {
            selectedLevel--;
            if (selectedLevel === 0) selectedLevel = game.save.levelsUnlocked;
            buttons.play.text = levelPreview[selectedLevel - 1];
        };
        if (buttons.next.release) {
            selectedLevel++;
            if (selectedLevel > game.save.levelsUnlocked) selectedLevel = 1;
            buttons.play.text = levelPreview[selectedLevel - 1];
        }

    };



    /*
     * public void .render(context)
     *
     *  draws elements to the main canvas
     *
     */
    stage_select.render = function (context) {

        // wait until no fade
        if (game.isFade()) return null;

        //level.render(context, 0);
        buttons.play.render(context, "#C0C0C0");
        buttons.previous.render(context, "#C0C0C0");
        buttons.next.render(context, "#C0C0C0");
        buttons.title.render(context, "#C0C0C0");

    };



    // Return object to global namespace
    mode.STAGE_SELECT = stage_select;
    return mode;

}(GAME.MODE || {}));
