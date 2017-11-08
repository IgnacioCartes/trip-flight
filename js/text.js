GAME.TEXT = (function () {
    'use strict';

    /*
     * Global variables and constants
     */

    // font banks
    var fontBank = {};
    var fontCount = 0;

    // bank for texts
    var textBank = [];

    // default font
    var defaultFontId = "";



    /*
     * public constructor()
     *
     *  empty constructor - this object will never be instantiated
     *
     */
    var text = function () {};



    /*
     * public static void .registerFont(fontId, bitmapPath, properties)
     *
     *  defines a new bitmap font to be used
     *
     */
    text.registerFont = function (fontId, bitmapPath, properties) {

        // push properties and load image to new font object
        var newFontObject = properties || {};
        newFontObject.image = new Image();
        newFontObject.image.src = bitmapPath;

        // push to fontbank
        fontBank[fontId] = newFontObject;

        // set as default if specified
        if (properties.setAsDefault) defaultFontId = fontId;

        // increase fontcount
        fontCount++;

    }



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

        // do nothing if no font has been loaded
        if (fontCount === 0) return null;

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

        // get bitmap font
        var font = (textObject.font ? fontBank[textObject.font] : fontBank[defaultFontId]);

        // loop through characters
        for (var i = 0; i < len; i++) {
            // ignore characters not contained in imageFont
            var char = textToRender.charCodeAt(i);
            if ((char >= font.firstCharCode) && (char <= font.lastCharCode)) {
                // render character
                context.drawImage(
                    font.image,
                    (char - font.firstCharCode) * font.characterWidth,
                    0,
                    font.characterWidth,
                    font.characterHeight,
                    textObject.x + (i * font.characterWidth),
                    textObject.y,
                    font.characterWidth,
                    font.characterHeight
                );
            }
        }
    }



    // Return object to global namespace
    return text;

}());
