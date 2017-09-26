var LEVEL = (function() {
    'use strict';
    
    /*
     * Global variables and constants
     */
    const ROWS = 11;
    const COLS_PER_SCREEN = 20;
    
    // buffers and their contexts
    var screenBuffers, screenContexts, renderedSlices;
    
    // tile properties
    var tileProperties = [
        {
            color: "#EEEEEE",
            solid: false
        },
        {
            color: "#111111",
            solid: true
        }
    ];
    
    
    
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
        
        // Create screenbuffers if this is the first time a level is being instantiated
        if (screenBuffers === undefined) createScreenBuffers();
        renderedSlices = [-1, -1];
        
        this.rightBound = (this.tiles.length - COLS_PER_SCREEN) * 32 - 2;
        console.log(this);
        
    };
    
    
    
    /*
     * public void .render(context, scrollX)
     *
     *  draws the level on the provided canvas context, shifted according to the scroll x value
     *
     */
    level.prototype.render = function(context, scrollX) {
        
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
        
        context.fillStyle = "#889988";
        context.fillText(firstSlice.toString() + ", " + (firstSlice + 1).toString(), 0, 64);
        context.fillText(firstBuffer.toString() + ", " + secondBuffer.toString(), 0, 80);
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
        for (var i = 0; i < (COLS_PER_SCREEN); i++) this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
        for (var i = 0; i < (COLS_PER_SCREEN); i++) this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);
        for (var i = 0; i < (COLS_PER_SCREEN); i++) this.tiles.push([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1]);
        for (var i = 0; i < (COLS_PER_SCREEN); i++) this.tiles.push([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]);
        
        // goal line
        this.goal = 70;
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
                var tileId = tiles[x + colsOffset][y];
                context.fillStyle = tileProperties[tileId].color;
                context.fillRect(x * 32, y * 32, 32, 32);
                
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