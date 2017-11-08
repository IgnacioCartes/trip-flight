GAME.TEXT = (function () {
    'use strict';

    /*
     * Global variables and constants
     */

    // font image
    var image = new Image();
    image.src = "assets/fonts/eGB.png";

    // bank for texts
    var textBank = [];



    /*
     * public constructor()
     *
     *  empty constructor - this object will never be instantiated
     *
     */
    var text = function () {};



    /*
     * public static void .pushTextToRender(textObject)
     *
     *  adds a text string object to the array to be rendered
     *
     */
    text.pushTextToRender = function (textObject) {
        textBank.push(textObject);
    }



    /*
     * public static void .renderAll(context)
     *
     *  renders all particles in an array to a given context
     *
     */
    text.renderAll = function (context) {

        // do nothing if there is no text
        if (!textBank) return null;
        var len = textBank.length;
        if (len === 0) return null;

        // render each text from array
        for (var i = 0; i < len; i++) {
            render(textBank[i], context);
        }

        // Clean array
        textBank = [];

    }



    /*
     * private static void .render(textObject, context)
     *
     *  renders one single text object to a given context
     *
     */
    function render(textObject, context) {

        // uppercase and trim text
        var textToRender = textObject.text.toUpperCase().trim();

        // iterate through all characters in a string
        var len = textToRender.length;

        for (var i = 0; i < len; i++) {
            // ignore characters not contained in imageFont
            var char = textToRender.charCodeAt(i);
            if ((char >= 32) && (char <= 95)) {
                // render character
                context.drawImage(image, (char - 32) * 16, 0, 16, 32, textObject.x + (i * 16), textObject.y, 16, 32);
            }
        }
    }



    // Return object to global namespace
    return text;

}());
