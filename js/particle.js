GAME.PARTICLE = (function () {
    'use strict';

    /*
     * Global variables and constants
     */

    // imagebank for particles
    var images = [];


    /*
     * particle templates
     *
     *  these define some common particles that will be created multiple times
     *
     */
    var templates = {
        // touchsparkle -- created when the player taps on the screen during play mode
        "touchsparkle": function (args) {

            // load image
            this.loadImage("touchsparkle", "assets/images/touchsparkle.png");

            // random initial speeds
            this.speedX = (Math.random() * 8) - 4;
            this.speedY = (Math.random() * 8) - 4;

            // constant acceleration
            this.accelX = 0;
            this.accelY = 0.25;

            // kill when they reach the bottom of the screen
            this.killCondition = function () {
                if (this.y > 360) return true;
            };

            // display
            this.display = "image";
            this.image = "touchsparkle";
        },
        // bonkstar -- created when the player bonks face first against a wall
        "bonkstar": function (args) {

            // load image
            this.loadImage("bonkstar", "assets/images/bonkstar.png");

            // size
            this.width = 16;
            this.height = 16;

            // to the sides
            this.speedX = -2;
            this.speedY = args.y;

            // acceleration to cancel speed
            this.accelX = 0.1;
            this.accelY = -(args.y / 20);

            // kill after 20 frames
            this.killCondition = function () {
                if (this.lifespan > 20) return true;
            };

            // display
            this.display = "image";
            this.image = "bonkstar";
        },
        // cloud -- appear on some levels as decoration
        "cloud": function (args) {

            // size
            this.width = 48;
            this.height = 2;

            // move from right to left
            this.speedX = -4 - (Math.floor(Math.random() * 3));
            this.speedY = 0;

            // no acceleration
            this.accelX = 0;
            this.accelY = 0;

            // kill when it scrolls offscreen
            this.killCondition = function () {
                if (this.displayX < -this.width) {
                    return true;
                }
            };

            // display
            this.color = "#c0c0c0";
        }
    };


    /*
     * generators
     *
     *  defines some particle generators that can be used by levels
     *
     */
    var generators = {
        "clouds": function (particles, game, args) {

            if (game.getTicks() % 16 == 0) {
                particles.push(new GAME.PARTICLE(game.width + args.scrollX, 2 * Math.round(Math.random() * 64 + 32), {
                    template: "cloud"
                }));
            };

        }
    };



    /*
     * public constructor(x, y)
     *
     *  sets initial variables for the particle
     *
     */
    var particle = function (x, y, args) {
        this.x = x;
        this.y = y;
        this.alive = true;

        // if there was a valid template provided, use it
        // otherwise initialize everything to null
        if (args.template && (typeof templates[args.template] === "function")) {
            templates[args.template].bind(this)(args);
            this.template = args.template;
        } else {
            this.speedX = 0;
            this.speedY = 0;
            this.accelX = 0;
            this.accelY = 0;

            this.killCondition = function () {
                if (this.lifespan >= 60) return true;
            };

            this.color = "#000000";
            this.template = null;
        }

        this.evenOnly = true;

        // lifespan to 0
        this.lifespan = 0;
    };



    /*
     * public void .render(context, scrollX)
     *
     *  draws the particle on the provided canvas context, shifted according to the scroll x value
     *
     */
    particle.prototype.render = function (context, scrollX) {

        // do nothing if particle is dead
        if (!this.alive) return null;

        // run additional render routine if one was provided
        if (typeof this.preRender === "function") this.preRender(context);

        var thisx = this.x - scrollX;
        var thisy = this.y

        // calculate coordinates
        if (this.evenOnly) {
            thisx = 2 * Math.round((thisx) / 2);
            thisy = 2 * Math.round((thisy) / 2) + 2;
        }

        // store its displayed position if needed by the update method
        this.displayX = thisx;
        this.displayY = thisy;

        // don't bother drawing if they're offscreen
        if ((thisx < -8) || (thisy < -8)) return null;

        // display
        if (this.display === "image") {
            // draw image
            context.drawImage(images[this.image], thisx, thisy);
        } else {
            // default display - a box
            context.fillStyle = this.color || "#000000";
            context.fillRect(thisx, thisy, this.width, this.height);
        }
    };



    /*
     * public void .update(ticks)
     *
     *  updates the particle movement
     *
     */
    particle.prototype.update = function (game) {

        // do nothing if particle is dead
        if (!this.alive) return null;

        // run additional update routine if one was provided
        if (typeof this.preUpdate === "function") this.preUpdate(game);

        // move
        this.x += this.speedX;
        this.y += this.speedY;

        // accelerate
        this.speedX += this.accelX;
        this.speedY += this.accelY;

        // increase lifespan
        this.lifespan++;

        // kill particle one its kill condition is true
        if (this.killCondition(game)) {
            this.alive = false;
        }

    };



    /*
     * public void .loadImage(id, url, override)
     *
     *  loads an asset into the static image container to be used by particles
     *
     */
    particle.prototype.loadImage = function (id, url, override) {

        // check if image hasn't been loaded (or if override is true)
        if ((images[id] === undefined) || (override)) {
            images[id] = new Image();
            images[id].src = url;
        };

    };



    /*
     * public static void .renderAll(particles, context, scrollX)
     *
     *  renders all particles in an array to a given context
     *
     */
    particle.renderAll = function (particles, context, scrollX) {
        // iterate thru particles array, rendering them all
        for (var i = particles.length - 1; i >= 0; i--) {
            // call their render method
            particles[i].render(context, scrollX);
        };

        // debug
        //context.fillText("particles rendered: " + particles.length.toString(), 16, 256);
    }



    /*
     * public static void .updateAll(particles, game)
     *
     *  updates all particles, removing dead ones from the array
     *
     */
    particle.updateAll = function (particles, game) {
        // iterate thru particles array in reverse order, updating them all
        for (var i = particles.length - 1; i >= 0; i--) {
            var thisParticle = particles[i];
            // call their update method
            thisParticle.update(game);

            // splice particle away if its dead
            if (!thisParticle.alive) {
                particles.splice(i, 1);
            }
        };
    }



    /*
     * public static void .runParticleGenerators(particles, game, generatorsList)
     *
     *  runs particle generators from a list
     *
     */
    particle.runParticleGenerators = function (particles, game, generatorsList, args) {

        // do nothing if generator list is undefined or empty
        if (generatorsList === undefined) return null;
        if (generatorsList.length == 0) return null;

        for (var i = 0; i < generatorsList.length; i++) {
            if (typeof generators[generatorsList[i]] === "function") {
                generators[generatorsList[i]](particles, game, args);
            }
        };

    }



    // Return object to global namespace
    return particle;

}());
