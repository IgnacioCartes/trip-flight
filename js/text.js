GAME.TEXT = (function () {
    'use strict';

    /*
     * Global variables and constants
     */

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
     * public static void .renderall(context)
     *
     *  renders all particles in an array to a given context
     *
     */
    text.renderAll = function (context) {

        // do nothing if there is no text
        if (!textBank) return null;
        var len = textBank.length;
        if (len === 0) return null;

        // Set Font
        context.font = "16px EarlyGameboy";

        // Outline properties
        context.strokeStyle = "#000000";
        context.lineWidth = 4;
        context.textBaseline = "top";
        

        // Render outlines first
        for (var i = 0; i < len; i++)
            context.strokeText(textBank[i].text, textBank[i].x, textBank[i].y);

        // Text properties
        context.fillStyle = "#FFFFFF";

        // Render text on top of outline
        for (var i = 0; i < len; i++)
            context.fillText(textBank[i].text, textBank[i].x, textBank[i].y);

        // Clean array
        textBank = [];

    }



    // Return object to global namespace
    return text;

}());
