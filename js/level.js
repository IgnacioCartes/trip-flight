GAME.LEVEL = (function() {
    'use strict';
    
    /*
     * Global variables and constants
     */
    var ROWS = 11;
    var COLS_PER_SCREEN = 20;
    
    // buffers and their contexts
    var screenBuffers, screenContexts, renderedSlices;
    
    // images
    var image;
    
    // tile properties (these should be set for each level)
    var tileProperties;
    
    // tile base properties
    var tileBaseProp = {
        "empty": {
            color: "#EEEEEE",
            solid: false
        },
        "solid":
        {
            color: "#111111",
            solid: true,
        },
        "slippery":
        {
            color: "#AABBEE",
            solid: true,
            slippery: true
        },
        "bouncy":
        {
            color: "#EE9966",
            solid: true,
            bounce: 1
        },
        "slope":
        {
            color: "#998877",
            solid: false,
            slope: 1
        }
    };
    
    
    
    /*
     * public constructor(id)
     *
     *  creates a level
     *  sets up buffers if needed
     *
     */
    var level = function(id) {
        // Create a new level structure
        createNewLevel.bind(this, id)();
        this.id = id;
        
        // Create screenbuffers if this is the first time a level is being instantiated
        if (screenBuffers === undefined) createScreenBuffers();
        renderedSlices = [-1, -1];
        
        // Calculate rightmost bound, to prevent scrolling past this point
        this.rightBound = (this.tiles.length - COLS_PER_SCREEN) * 32 - 2;
        
    };
    
    
    
    /*
     * public void .render(context, scrollX)
     *
     *  draws the level on the provided canvas context, shifted according to the scroll x value
     *
     */
    level.prototype.render = function(context, scrollX) {
        
        // We want to wait until level image is loaded before rendering the actual level
        if (image.complete) {

            // Determine which slices to render and offset
            var firstSlice = Math.floor(scrollX / (32 * COLS_PER_SCREEN));
            var xOffset = 2 * Math.floor((scrollX % (32 * COLS_PER_SCREEN)) / 2);

            // Have these slices been prerendered? Do so if needed
            if (renderedSlices.indexOf(firstSlice) === -1) prerenderSliceToBuffer(firstSlice, this.tiles);
            if (renderedSlices.indexOf(firstSlice + 1) === -1) prerenderSliceToBuffer(firstSlice + 1, this.tiles);

            // Get which buffer corresponds to which slice
            var firstBuffer = renderedSlices.indexOf(firstSlice);
            var secondBuffer = renderedSlices.indexOf(firstSlice + 1);

            // Draw buffers to "main" canvas context with the right offset
            context.drawImage(screenBuffers[firstBuffer], 0 - xOffset, 0);
            context.drawImage(screenBuffers[secondBuffer], (COLS_PER_SCREEN * 32) - xOffset, 0);

            /*
             * the way this works is we have two buffers we move one in front of eachother as the screen scrolls
             * each "slice" is a 20x11 tilemap
             * initially there will always be [0, 1] slices drawn
             * then as the screen scroll enough, slice 2 will be prerendered instead of slice 0
             * and it will be drawn in front of slice 1
             * and so on
             */
            
            context.fillText(firstSlice.toString() + ", " + (firstSlice + 1).toString(), 0, 64);
            context.fillText(firstBuffer.toString() + ", " + secondBuffer.toString(), 0, 80);
        }
        
        // Determine whether or not to render the goal line
        var goalPosition = (this.goal * 32) - scrollX + 31;
        if ((goalPosition > 0) && (goalPosition < 640)) {
            context.fillRect(goalPosition - 1, 0, 2, 352);
        }
        
        
        context.fillStyle = "#889988";
        context.fillText(scrollX.toString(), 0, 112);
    };
    
    
    
    /*
     * public tileProperties .tileAt(yacopu, xoffset, yoffset)
     *
     *  returns the tile corresponding to yacopu's current position, shifted by x and y offsets
     *
     */
    level.prototype.tileAt = function(yacopu, xoffset, yoffset) {
        
        var tilex = Math.floor((yacopu.x + xoffset) / 32);
        var tiley = Math.floor((yacopu.y + yoffset) / 32);
        
        // If the tiles are outside the level boundaries, return a default solid tile
        if ((tilex < 0) || (tiley < 0) || (tilex >= this.tiles.length) || (tiley >= ROWS)) {
            return tileProperties[1];
        }
        
        var tileId = this.tiles[tilex][tiley];
        
        return tileProperties[tileId];
        
    };
    
    
    
    /*
     * private void createNewLevel(id)
     *
     *  creates and returns a new level based on the id properties, used on the level constructor
     *
     */
    function createNewLevel(id) {
        
        this.tiles = [];
        
        // quickly makeshift a new level
        /*
        for (var i = 0; i < (COLS_PER_SCREEN - 5); i++) {
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2]);
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3]);
        }
        
        
        this.tiles.push([0, 0, 0, 0, 0, 1, 5, 6, 5, 6, 5]);
        this.tiles.push([0, 0, 0, 0, 0, 9, 6, 5, 6, 5, 6]);
        this.tiles.push([0, 0, 0, 0, 0, 0, 9, 6, 5, 6, 5]);
        this.tiles.push([0, 0, 0, 0, 0, 0, 0, 9, 6, 5, 6]);
        this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 9, 6, 5]);
        this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6]);
        
        this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5]);
        for (var i = 0; i < (COLS_PER_SCREEN); i++) {
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 6]);
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5]);
        }
        
        this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 6]);
        for (var i = 0; i < (COLS_PER_SCREEN); i++) {
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 2, 6, 5]);
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 6]);
        }
        
        // 122 cols
        */
        
        for (var i = 0; i < 16; i++) {
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
        }
        
        for (var i = 0; i < 16; i++) {
            this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
        }
        
        this.tiles.push([1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
        
        for (var i = 0; i < 8; i++) {
            this.tiles.push([1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
        }
        
        for (var i = 0; i < 8; i++) {
            this.tiles.push([1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2]);
        }
        this.tiles.push([2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2]);
        this.tiles.push([2, 2, 4, 4, 4, 0, 4, 4, 2, 2, 2]);
        
        
        for (var i = 0; i < 8; i++) {
            this.tiles.push([2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2]);
        }
        
        for (var i = 0; i < 8; i++) {
            this.tiles.push([2, 2, 2, 2, 0, 0, 0, 1, 2, 2, 2]);
        }
        this.tiles.push([2, 2, 2, 2, 1, 0, 0, 1, 1, 2, 2]);
        
        this.tiles.push([2, 2, 2, 2, 0, 0, 0, 3, 1, 2, 2]);
        this.tiles.push([2, 2, 2, 2, 0, 0, 0, 0, 3, 1, 2]);
        this.tiles.push([2, 2, 2, 2, 0, 0, 0, 0, 0, 3, 1]);
        this.tiles.push([2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1]);
        
        for (var i = 0; i < 24; i++) {
            this.tiles.push([2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1]);
        }
        
        for (var i = 0; i < 24; i++) {
            this.tiles.push([2, 2, 2, 0, 0, 0, 2, 4, 0, 0, 4]);
        }
        
        for (var i = 0; i < 24; i++) {
            this.tiles.push([2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1]);
        }
        
        // goal line
        this.goal = 128;
        
        // load image if needed
        if (image === undefined) {
            image = new Image();
            image.src = "assets/level2.png";
        }
        
        // set tile properties
        tileProperties = [
            tileBaseProp.empty,
            tileBaseProp.solid,
            tileBaseProp.slippery,
            tileBaseProp.slope,
            tileBaseProp.bouncy
        ];
    
    };
    
    
    
    /*
     * private void createScreenBuffers()
     *
     *  initializes two screen buffers used in the level pre-rendering
     *
     */
    function createScreenBuffers() {
        
        var buffer1 = document.createElement("canvas");
        var buffer2 = document.createElement("canvas");
        
        buffer1.width = COLS_PER_SCREEN * 32;
        buffer2.width = COLS_PER_SCREEN * 32;
        
        buffer1.height = ROWS * 32;
        buffer2.height = ROWS * 32;
        
        screenBuffers = [buffer1, buffer2];
        screenContexts = [
            screenBuffers[0].getContext('2d'),
            screenBuffers[1].getContext('2d')
        ];
    };
    
    
    
    /*
     * public void prerenderSliceToBuffer(slice, tiles)
     *
     *  pre-renders a "slice" of the level to a buffer
     *
     */
    function prerenderSliceToBuffer(slice, tiles) {
        
        // To keep things in order we will organize slices in even and odd
        var bufferToRenderTo = slice % 2;
        var context = screenContexts[bufferToRenderTo];
        
        // Where this slice starts within the level
        var colsOffset = slice * COLS_PER_SCREEN;
        
        // Render loop
        for (var x = 0; x < COLS_PER_SCREEN; x++) {
            for (var y = 0; y < ROWS; y++) {
                var tileId = 0;
                if ((x + colsOffset) < tiles.length)
                    tileId = tiles[x + colsOffset][y];
                
                // Draw color
                //context.fillStyle = tileProperties[tileId].color;
                //context.fillRect(x * 32, y * 32, 32, 32);
                
                // Draw image
                //var tilePos = this.animation.frame * 32;
                context.drawImage(image, tileId * 32, 0, 32, 32, x * 32, y * 32, 32, 32);
                
                //context.fillStyle = "#888888";
                //context.fillText(x.toString() + "," + y.toString(), x * 32, y * 32 + 16);
            }
        }
        
        // Keep track of rendered slices to buffers
        renderedSlices[bufferToRenderTo] = slice;
        
    };
    
    
    
    // Return object to global namespace
    return level;
    
}());