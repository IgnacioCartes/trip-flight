GAME.BUTTON = (function () {
    'use strict';

    /*
     * Global variables and constants
     */

    // text offsets
    var textOffsetY = 0;


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
        this.centeredText = true;
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
            context.lineWidth = 2;
            context.strokeStyle = strokeStyle;
            // draw full box if active
            if (this.active) {
                context.fillStyle = this.activeStyle || "#808080";
                context.fillRect(this.x - 1, this.y - 1, this.width + 1, this.height + 1);
            }

            context.strokeRect(this.x, this.y, this.width, this.height);

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

            // add shift if active
            var activeOffset = (this.active ? 2 : 0);

            // center text
            if (this.centeredText) {
                var len = this.text.length;
                GAME.TEXT.pushTextToRender({
                    text: this.text,
                    x: this.x + ((this.width - (len * 16)) / 2) + activeOffset,
                    y: this.y + textOffsetY + ((this.height - 16) / 2) + activeOffset
                });
            } else {
                GAME.TEXT.pushTextToRender({
                    text: this.text,
                    x: this.x + activeOffset,
                    y: this.y + textOffsetY + activeOffset
                });
            }
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
