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
    var scrollX;

    // collection of particles
    var particles = [];

    // buttons
    var buttons = [];

    // time-related variables
    var raceTime, countdownTime, initialTimeStamp, timeLeft;
    var hasRaceStarted, hasRaceEnded;
    var timeBonus, lastCheckpointTime;

    // race variables
    var raceFailed;

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
        buttons.restart = new GAME.BUTTON(592, 16, 32, 32);
        buttons.restart.image = new Image();

        // Initialize game variables
        scrollX = 0;

        raceTime = 0;
        countdownTime = (60 * 4) - 1;
        initialTimeStamp = game.getTicks();
        hasRaceStarted = false;
        hasRaceEnded = false;
        timeLeft = null;
        timeBonus = 0;
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
                if (timeLeft > 0) {
                    timeLeft--;

                    // if timeleft is over, should be considered as a failure to complete level
                    if (timeLeft === 0) {
                        console.log("level failed :(");
                        hasRaceEnded = true;
                        raceFailed = true;
                    }

                    // tick in bonusTime add
                    if (timeBonus) {
                        // add a sixth of a second every frame
                        timeLeft += 10;
                        timeBonus--;
                    }

                }
            }

            // check for checkpoints
            if (yacopu.isCrossingCheckpoint) {
                // if one is crossed, add the bonusTime to timeLeft in 1/6th of a sec intervals
                timeBonus += level.checkpoints[yacopu.nextCheckpoint - 1].bonusTime * 6;
                lastCheckpointTime = raceTime;
            }
        }

        // update buttons
        buttons.restart.update(input);
        if (buttons.restart.release) {
            console.log("this is the restart level button");
            game.setMode("PLAY", {
                level: level.id
            });
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
        buttons.restart.render(context, "#C0C0C0");

        // display particles
        GAME.PARTICLE.renderAll(particles, context, scrollX);

        // add text
        // race time - last checkpoint time if one was recently crossed
        if (timeBonus) {
            if ((raceTime % 16) >= 4) {
                GAME.TEXT.pushTextToRender({
                    text: (lastCheckpointTime / 60).toFixed(2),
                    x: 512,
                    y: 32
                });
            }
        } else {
            GAME.TEXT.pushTextToRender({
                text: (raceTime / 60).toFixed(2),
                x: 512,
                y: 32
            });
        }

        // remaining time if this is under 5 secs
        if (timeLeft <= 300) {
            GAME.TEXT.pushTextToRender({
                text: "-" + (timeLeft / 60).toFixed(2),
                x: 512 - 16,
                y: 48
            });
        }

        // show initial countdown on screen if needed
        if (!hasRaceStarted) {
            if (countdownTime < 180) {
                GAME.TEXT.pushTextToRender({
                    text: Math.floor((countdownTime / 60) + 1).toString(),
                    x: 304,
                    y: 160
                });
            }
        } else {
            if (raceTime < 60) {
                GAME.TEXT.pushTextToRender({
                    text: "GO!",
                    x: 296,
                    y: 160
                });
            }
        }

    };



    // Return object to global namespace
    mode.PLAY = play;
    return mode;

}(GAME.MODE || {}));
