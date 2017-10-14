GAME.BUTTON = (function() {
    'use strict';
    
    /*
     * public constructor(id)
     *
     *  creates a button that can be interacted with
     *
     */
    var button = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
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
        
        // Draw image if one was added to the button object
        if (this.image && (typeof this.image === "object")) {
            if (this.image.complete) {
                context.drawImage(this.image, this.x, this.y);
            }
        }
        
        // Draw box if a strokestyle was provided
        if (strokeStyle) {
            var storeStrokeStyle = context.strokeStyle;
            context.strokeStyle = strokeStyle;
            context.strokeRect(this.x, this.y, this.width, this.height);
            
            context.strokeStyle = storeStrokeStyle;
        }
        
        // Draw text if there is any
        if (this.text) {
            context.fillText(this.text, this.x, this.y);
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
        if ((input.touch.x >= this.x)
           && (input.touch.y >= this.y)
           && (input.touch.x <= (this.x + this.width))
           && (input.touch.y <= (this.y + this.height))) {
            this.click = input.touch.click;
            this.active = input.touch.active;
        };
        
    };
    
    
    // Return object to global namespace
    return button;
    
}());