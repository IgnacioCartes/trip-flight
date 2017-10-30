GAME.MODE = (function (mode) {
    'use strict';


    /*
     * GAME MODE VARIABLES
     */

    // module
    var play = {};

    // reference to main game object
    var game;

    // yacopu - managed by yacopu.js
    var yacopu;

    // level layout - managed by level.js
    var level;

    // horizontal scrolling
    var scrollX = 0;

    // collection of particles
    var particles = [];

    // buttons
    var buttons = [];
    
    // time-related variables
    var raceTime, countdownTime, initialTimeStamp, timeLeft;
    var hasRaceStarted = false,
        hasRaceEnded = false;
    
    // race variables
    var raceFailed = false;

    // flap history
    var flapHistory = [];



    /*
     * public void .set(mainGameObj, args)
     *
     *  initializes this game mode
     *
     */
    play.set = function (mainGameObj, args) {
        // Set methods will always pass the main game object as an argument first
        // Here we catch it to have acces to it later
        if (game === undefined) game = mainGameObj;

        // Create specific level
        level = new GAME.LEVEL(args.level);

        // Create yacopu
        yacopu = new GAME.YACOPU();
        yacopu.level = level;

        // initialize buttons
        buttons.restart = new GAME.BUTTON(640 - 32 - 16, 16, 32, 32);
        buttons.restart.image = new Image();

        // Initialize game variables
        raceTime = 0;
        countdownTime = (60 * 4) - 1;
        initialTimeStamp = game.getTicks();
        hasRaceStarted = false;
        timeLeft = null;
        flapHistory = [];
        raceFailed = false;
    };



    /*
     * public void .update(input)
     *
     *  runs update logic on each frame
     *
     */
    play.update = function (input) {

        // update particles
        GAME.PARTICLE.updateAll(particles, game);

        // run particle generators for level if any
        GAME.PARTICLE.runParticleGenerators(particles, game, level.particleGenerator, {
            scrollX: scrollX
        });

        // update timeleft on level when it has been loaded (from seconds to frames)
        if ((timeLeft === null) && (level.initialTime))
            timeLeft = level.initialTime * 60;

        // do nothing more until actual race has started
        if (!hasRaceStarted) {
            // count every 60 frames
            if ((countdownTime % 60) === 0)
                console.log(countdownTime / 60);

            // when countdown hits 0, start race
            if (countdownTime-- <= 0)
                hasRaceStarted = true;

            return null;
        };

        // update yacopu movement
        yacopu.update(game);

        // flap if a touch occured on this frame and race is still going 
        if (input.touch.click && !hasRaceEnded) {
            yacopu.flap(game);

            // track "flap history"
            if (!yacopu.goal) {
                flapHistory.push(raceTime);
            } // else {
            //    console.log(JSON.stringify(flapHistory));
            //}

            // create new random particles
            /*
            for (var i = 0; i < 4; i++) {
                particles.push(new GAME.PARTICLE(input.touch.x + scrollX, input.touch.y, { template: "touchsparkle" }));
            };
            */
        }

        // count a bonk
        if (yacopu.isBonking) {
            // create particles
            particles.push(new GAME.PARTICLE(yacopu.x + 32, yacopu.y + 16, {
                template: "bonkstar",
                y: -2
            }));
            particles.push(new GAME.PARTICLE(yacopu.x + 32, yacopu.y + 16, {
                template: "bonkstar",
                y: 2
            }));
        }

        // screen scroll
        if ((yacopu.x - scrollX) > 240) scrollX = Math.floor(yacopu.x - 240);

        // Make sure we don't scroll TOO much though
        if (scrollX > level.rightBound) scrollX = level.rightBound;

        // Track race progress
        if (!hasRaceEnded) {

            if (yacopu.goal) {
                // If yacopu has reached the goal, then race ended
                hasRaceEnded = true;
                // let game object deal with raceTime
                if (game.reportRaceTime(raceTime, level.id)) {
                    console.log("NEW RECORD");
                }

            } else {
                // increase race time and decrease remaining time
                raceTime++;
                if (timeLeft > 0)  {
                    timeLeft--;
                    if (timeLeft === 0) {
                        // if timeleft is over, should be considered as a failure to complete level
                        console.log("level failed :(");
                        hasRaceEnded = true;
                        raceFailed = true;
                    }
                }
            }
            
            // check for checkpoints
            if (yacopu.isCrossingCheckpoint) {
                timeLeft += level.checkpoints[yacopu.nextCheckpoint - 1].bonusTime * 60;
            }
        }

        // update buttons
        buttons.restart.update(input);
        if (buttons.restart.release) {
            console.log("this is the restart level button");
        }
    };



    /*
     * public void .render(context)
     *
     *  draws elements to the main canvas
     *
     */
    play.render = function (context) {
        // display level and yacopu
        level.render(context, scrollX);
        yacopu.render(context, scrollX);

        // display button
        buttons.restart.render(context, "#FF0000");

        // display particles
        GAME.PARTICLE.renderAll(particles, context, scrollX);

        // add text
        game.pushTextToRender({
            text: (raceTime / 60).toFixed(2),
            x: 512,
            y: 32
        });
        
        game.pushTextToRender({
            text: "-" + (timeLeft / 60).toFixed(2),
            x: 512 - 16,
            y: 48
        });
        

        /*
        if (yacopu.goal) {
            context.fillText("max speed: " + yacopu.maxSpeed.toString(), 32, 208);
            context.fillText("bonks: " + yacopu.bonks.toString(), 32, 224);
        }
        */

    };



    // Return object to global namespace
    mode.PLAY = play;
    return mode;

}(GAME.MODE || {}));
