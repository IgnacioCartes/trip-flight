GAME.BUTTON = (function () {
    'use strict';

    /*
     * Global variables and constants
     */

    // text offsets
    var textOffsetY = 16;


    /*
     * public constructor(id)
     *
     *  creates a button that can be interacted with
     *
     */
    var button = function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.frame = 0;
        this.frameOnActive = 0;

        this.visible = true;
        this.interactivity = true;

        this.active = false;
        this.click = false;

        this.image = null;

        this.text = null;
    };



    /*
     * public void .render(context, fillStyle)
     *
     *  draws the image representing the button
     *  can also draw a bounding box (for debugging purposes mainly)
     *
     */
    button.prototype.render = function (context, strokeStyle) {

        // Ignore is button visibility is set to false
        if (!this.visible) return null;

        // Draw box if a strokestyle was provided
        if (strokeStyle) {
            var storeStrokeStyle = context.strokeStyle;
            context.strokeStyle = strokeStyle;
            // draw full box if active
            if (this.active)
                context.fillRect(this.x, this.y, this.width, this.height);

            context.strokeRect(this.x, this.y, this.width, this.height);

            context.strokeStyle = storeStrokeStyle;
        }

        // Draw image if one was added to the button object
        if (this.image && (typeof this.image === "object")) {
            this.frame = (this.active ? this.frameOnActive : 0);
            if (this.image.complete) {
                context.drawImage(this.image, this.frame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
            }
        }

        // Draw text if there is any
        if (this.text) {
            GAME.TEXT.pushTextToRender({
                text: this.text,
                x: this.x,
                y: this.y + textOffsetY
            });
            context.fillText(this.text, this.x, this.y + textOffsetY);
        };

    };



    /*
     * public void .update(input)
     *
     *  changes button state depending on inputs
     *
     */
    button.prototype.update = function (input) {

        // Ignore if button interaction is disabled
        if (!this.interactivity) return null;

        // Only update if mouse is over button, otherwise we don't care
        if ((input.touch.x >= this.x) &&
            (input.touch.y >= this.y) &&
            (input.touch.x <= (this.x + this.width)) &&
            (input.touch.y <= (this.y + this.height))) {
            this.release = input.touch.release && this.active;
            this.click = input.touch.click;
            this.active = input.touch.active;
        };

        // On release, disactive all
        if (input.touch.release) this.active = false;

    };


    // Return object to global namespace
    return button;

}());
