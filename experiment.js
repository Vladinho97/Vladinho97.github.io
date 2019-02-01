

var config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    var game = new Phaser.Game(config);
    var startedGame = false;
    var startedTrial = false;
    var clicked = false;
    var bg;
    var red;
    var colors = ["red","green","blue","purple"];
    var opened = {"red":false, "green":false, "blue":false, "purple":false};
    var epoch;
    var backgrounds = [];
    var allBackgrounds = ["waterfall", "beach", "castle", "mountains", "lake", "rocky_beach","island"];
    var distributions = [];
    var currentDistribution;
    var currentBackground;
    var bundles = [];
    var winner;
    var i;
    var experimentValue;
    var gold1,gold2,gold3,gold4;
    var stimulusLength;
    var reticle;
    var wrong_red;
    var wrong_blue;
    var wrong_green;
    var wrong_purple;
    var gameOver;
    var currentTrial;
    var poissonMean = 40;
    var TIMEOUT_BETWEEN_BOXES = 600;
    var TIME_TO_RESET = 1000;
    var TIME_PER_TRIAL = 2500;
    var TRIAL_LENGTH = 3;
    var RULES = "THE GOAL OF THE GAME IS FINDING THE TREASURE, WHICH LIES IN ONE OF THE CHESTS.\
                 \n\nUSE YOUR KEY (  ) TO OPEN CHESTS (   ) BY CLICKING OVER THEM. \
                 \n\nA RED CIRCLE SIGNALS THE CHEST IS EMPTY. \
                 \n\nA GREEN CIRCLE SIGNALS YOU HAVE FOUND THE TREASURE  \
                 \n\nBEWARE THAT YOU HAVE A LIMITED AMOUNT OF TIME TO FIND THE TREASURE.\
                 \n\nTRY TO EARN AS MUCH TREASURE AS YOU CAN!";
    var CHESTS_OPENED = 0;
    var TREASURE_FOUND = 0;
    var TOTAL_TRIALS = 0;
    var GAME_OVER_THRESHOLD = 400;
    var DEMO = true;
    var isGameOver = false;

    function randomPoisson(n) {
        var L = Math.exp(-n);
        var k = 0;
        var p = 1;

        while (p > L){
            k = k + 1;
            u = Math.random();
            p = p * u;
        } 

        return k-1;
    }

    function setupNewBackground(){
        epoch = 0;
        currentDistribution = generateNewDistribution();
        distributions.push(currentDistribution);
        currentBackground = pickNewBackground();
        if (currentBackground != "")
            backgrounds.push(currentBackground);
    }

    function generateNewDistribution()
    {
        redProb = Math.random();
        blueProb = Math.random();
        greenProb = Math.random();
        purpleProb = Math.random();
        S = redProb + blueProb + greenProb + purpleProb;
        redProb = redProb / S;
        blueProb = blueProb / S;
        greenProb = greenProb / S;
        purpleProb = purpleProb / S;
        d = {"red":parseFloat(redProb.toFixed(2)),
             "blue":parseFloat(blueProb.toFixed(2)),
             "green":parseFloat(greenProb.toFixed(2)),
             "purple":parseFloat(purpleProb.toFixed(2))};
        return d;
    }

    function pickNewBackground()
    {
        var ii = 0;
        var jj;
        availableBackgrounds = []
        for (ii = 0; ii < allBackgrounds.length; ii++)
        {
            curBg = allBackgrounds[ii];
            var found = false;
            for (jj = 0; jj < backgrounds.length; jj++)
            {
                if (curBg === backgrounds[jj])
                {
                  found = true;
                  break;
                }
            }
            if (!found)
            {
                availableBackgrounds.push(curBg);
            }
        }
        if (availableBackgrounds.length == 0)
        {
            console.log("ERROR")
            return "";
        }
        return availableBackgrounds[Math.floor(Math.random() * availableBackgrounds.length)];
    }

    function pickWinner(distribution){
        var rgn = Math.random();
        s = 0;
        for (i=0; i<colors.length; i++)
        {
          s = s + distribution[colors[i]];
          if (rgn < s)
          {
            return colors[i];
          }
        }
    }

    function pickWinnerAtRandom()
    {
        var rgn = Math.floor(Math.random() * 4.0);
        return colors[rgn];
    }

    function preload ()
    {
        this.load.image('red', 'assets/chest_red.png');
        this.load.image('yellow', 'assets/chest_yellow.png');
        this.load.image('green', 'assets/chest_green.png');
        this.load.image('purple', 'assets/chest_purple.png');
        this.load.image('blue', 'assets/chest_blue.png');
        this.load.image('red_open', 'assets/chest_red_open.png');
        this.load.image('yellow_open', 'assets/chest_yellow_open.png');
        this.load.image('green_open', 'assets/chest_green_open.png');
        this.load.image('purple_open', 'assets/chest_purple_open.png');
        this.load.image('blue_open','assets/chest_blue_open.png');
        this.load.image('waterfall', 'assets/waterfall.jpg');
        this.load.image('castle', 'assets/castle.png');
        this.load.image('mountains', 'assets/mountains.jpg')
        this.load.image('beach', 'assets/beach.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('lake','assets/lake.jpg');
        this.load.image('rocky_beach','assets/rocky_beach.png');
        this.load.image('island',"assets/island.png");
        this.load.image('hourglass',"assets/hourglass.png");
        this.load.image('correct',"assets/correct.png")
        this.load.spritesheet('gold', 'assets/gold.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('key', 'assets/KeyIcons.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('treasure_chests', 'assets/treasure_chests.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('wrong','assets/wrong.png');

    }

    function chooseNewStimulusCRP()
    {
        TOTAL_TRIALS = TOTAL_TRIALS + epoch
        if (TOTAL_TRIALS >= GAME_OVER_THRESHOLD)
        {
            gameOver(this);
            return;
        }
        epoch = 0;
        N = distributions.length;
        rgn = Math.random();
        if (rgn > ((N - 1.0) / (N + 1.0)))
        {
          setupNewBackground(this);
        }
        else
        {
            s = 0;
            for (ii = 0; ii < N; ii++)
            {
                if (backgrounds[ii]!==currentBackground)
                { 
                    s = s + 1.0 / (N + 1.0);
                    if (s >= rgn)
                    {
                        currentDistribution = distributions[ii];
                        currentBackground = backgrounds[ii];
                        break;
                    }
                }
            }
        }
    }

    function resetTrial()
    {
        setTimeout(function()
        {
            epoch += 1;
            console.log(epoch)
            red.setTexture("red");
            blue.setTexture("blue");
            green.setTexture("green");
            purple.setTexture("purple");
            opened["red"] = false;
            opened["green"] = false;
            opened["blue"] = false;
            opened["purple"] = false;
            clicked = false;
            makeEverythingInvisible();
            winner = pickWinnerAtRandom();
            if (epoch === TRIAL_LENGTH)
            {
                startGame();
            }
            reticle.setTexture("key",frame=2);
            resetReticle();
            var now = new Date().getTime();
            countDownDate = now + TIME_PER_TRIAL;
        }, TIME_TO_RESET);
    }


    function resetGame()
    {
       setTimeout(function(){
         red.setTexture("red");
         blue.setTexture("blue");
         green.setTexture("green");
         purple.setTexture("purple");
         opened["red"] = false;
         opened["green"] = false;
         opened["blue"] = false;
         opened["purple"] = false;
         clicked = false;
         makeEverythingInvisible();
         winner = pickWinner(currentDistribution)
         epoch += 1;
         RESULTS['winner'].push(winner);
         RESULTS['trials'].push(currentTrial);
         currentTrial = []
         if (epoch == stimulusLength){
            d = new Object();
            chooseNewStimulusCRP(this);

            if (!isGameOver)
            {
                stimulusLength = randomPoisson(poissonMean);
                if(RESULTS["experiment"] == "A")
                {
                    bg.setTexture(currentBackground);
                }
                d = new Object();
                d.start_trial = TOTAL_TRIALS + 1;
                d.end_trial = TOTAL_TRIALS + stimulusLength;
                d.background_name = currentBackground;
                d.dist = currentDistribution;
                RESULTS['distributions'].push(d);
            }
            else
            {
                console.log(JSON.stringify(RESULTS));
            }
         }
         reticle.setTexture("key",frame=2);
         resetReticle();
         var now = new Date().getTime();
         countDownDate = now + TIME_PER_TRIAL;

       }, TIME_TO_RESET);

    }

    function resetReticle(){
      reticle.x = 640;
      reticle.y = 360;
    }

    function create ()
    {
      experimentValue = Math.random();
      showIntro.call(this)
    }

    function showIntro()
    {
       reticle = this.add.sprite(250, 130, 'key',frame=2).setInteractive();
       chest = this.add.sprite(442, 130, 'treasure_chests', frame=19);
       rules_text = this.add.text(100, 100, RULES, { fill: '#0f0' });
       clickButton = this.add.text(510, 360, "START", {fill:'#0f0', font:'65px Arial'}).setInteractive()
      .on('pointerdown', () => startTrial.call(this));
    }

    function startTrial(){
        clickButton.destroy();
        rules_text.destroy();
        chest.destroy();
        reticle.destroy();
        startedTrial = true;
        winner = pickWinnerAtRandom();
        var now = new Date().getTime();
        countDownDate = now + TIME_PER_TRIAL;
        epoch = 0;

        bg = this.add.tileSprite(640, 360, 1280, 720, "mountains");
        red = this.add.sprite(440,  170, 'red').setInteractive();
        blue = this.add.sprite(440, 550, 'blue').setInteractive();
        green = this.add.sprite(840, 550, 'green').setInteractive();
        purple = this.add.sprite(840,170, 'purple').setInteractive();
        red_gold = this.physics.add.staticGroup();
        blue_gold = this.physics.add.staticGroup();
        green_gold = this.physics.add.staticGroup();
        purple_gold = this.physics.add.staticGroup();
        score_gold = this.physics.add.staticGroup();

        red_gold1 = this.add.sprite(440,170, 'gold', frame = 13);
        red_gold2 = this.add.sprite(456,170, 'gold', frame = 12);
        red_gold3 = this.add.sprite(424,170, 'gold', frame = 9);
        red_gold4 = this.add.sprite(440,154, 'gold', frame = 10);
        red_gold5 = this.add.sprite(456,154, 'gold', frame = 9);

        red_gold.add(red_gold1);
        red_gold.add(red_gold2);
        red_gold.add(red_gold3);
        red_gold.add(red_gold4);
        red_gold.add(red_gold5);
        red_gold.toggleVisible();

        blue_gold1 = this.add.sprite(440,550, 'gold', frame = 13);
        blue_gold2 = this.add.sprite(456,550, 'gold', frame = 12);
        blue_gold3 = this.add.sprite(424,550, 'gold', frame = 9);
        blue_gold4 = this.add.sprite(440,534, 'gold', frame = 10);
        blue_gold5 = this.add.sprite(456,534, 'gold', frame = 9);

        blue_gold.add(blue_gold1);
        blue_gold.add(blue_gold2);
        blue_gold.add(blue_gold3);
        blue_gold.add(blue_gold4);
        blue_gold.add(blue_gold5);
        blue_gold.toggleVisible();

        green_gold1 = this.add.sprite(840,550, 'gold', frame = 13);
        green_gold2 = this.add.sprite(856,550, 'gold', frame = 12);
        green_gold3 = this.add.sprite(824,550, 'gold', frame = 9);
        green_gold4 = this.add.sprite(840,534, 'gold', frame = 10);
        green_gold5 = this.add.sprite(856,534, 'gold', frame = 9);

        green_gold.add(green_gold1);
        green_gold.add(green_gold2);
        green_gold.add(green_gold3);
        green_gold.add(green_gold4);
        green_gold.add(green_gold5);
        green_gold.toggleVisible();

        purple_gold1 = this.add.sprite(840,170, 'gold', frame = 13);
        purple_gold2 = this.add.sprite(856,170, 'gold', frame = 12);
        purple_gold3 = this.add.sprite(824,170, 'gold', frame = 9);
        purple_gold4 = this.add.sprite(840,154, 'gold', frame = 10);
        purple_gold5 = this.add.sprite(856,154, 'gold', frame = 9);

        purple_gold.add(purple_gold1);
        purple_gold.add(purple_gold2);
        purple_gold.add(purple_gold3);
        purple_gold.add(purple_gold4);
        purple_gold.add(purple_gold5);
        purple_gold.toggleVisible();

        hourglass = this.add.sprite(50, 50, 'hourglass');
        timeleft = this.add.text(100, 30, '5', {fontSize:'50px', fill:'#000'});
        red.inputEnabled = true;
        blue.inputEnabled = true;
        green.inputEnabled = true;
        purple.inputEnabled = true;
        reticle.inputEnabled = true;

        wrong_purple = this.add.sprite(840, 170, 'wrong');
        wrong_purple.setVisible(false);
        wrong_red = this.add.sprite(440, 170, 'wrong');
        wrong_red.setVisible(false);
        wrong_green = this.add.sprite(840, 550, 'wrong');
        wrong_green.setVisible(false);
        wrong_blue = this.add.sprite(440, 550, 'wrong');
        wrong_blue.setVisible(false);

        correct_red = this.add.sprite(440, 170, 'correct');
        correct_red.setVisible(false);
        correct_purple = this.add.sprite(840, 170, 'correct');
        correct_purple.setVisible(false);
        correct_green = this.add.sprite(840, 550, 'correct');
        correct_green.setVisible(false);
        correct_blue = this.add.sprite(440, 550, 'correct');
        correct_blue.setVisible(false);


        this.input.on('pointermove', function (pointer) {

            // Move reticle with mouse
            reticle.x += pointer.movementX;
            reticle.y += pointer.movementY;
        }, this);

        this.input.on('pointerdown', function(pointer) {
            if (!isGameOver)
            {
                if (reticle.x > 376 && reticle.x < 504 && reticle.y > 106 && reticle.y < 234 && !clicked &&!opened["red"])
                {
                    opened["red"] = true;
                    openRed.call(this, startedTrial);
                }

                if (reticle.x > 376 && reticle.x < 504 && reticle.y > 486 && reticle.y < 614 && !clicked && !opened["blue"])
                {
                    opened["blue"] = true;
                    openBlue.call(this, startedTrial);
                }

                if (reticle.x > 776 && reticle.x < 904 && reticle.y > 486 && reticle.y < 614 && !clicked && !opened["green"])
                {
                    opened["green"] = true;
                    openGreen.call(this, startedTrial);
                }

                if (reticle.x > 776 && reticle.x < 904 && reticle.y > 106 && reticle.y < 234 && !clicked && !opened["purple"])
                {
                    opened["purple"] = true;
                    openPurple.call(this, startedTrial);
                }    
            }
            
        }, this);

        reticle = this.add.sprite(640, 360, 'key',frame=2).setInteractive();
        treasure_found = this.add.sprite(1100, 50, 'treasure_chests', frame = 39);
        score_gold1 = this.add.sprite(1100,100, 'gold', frame = 13);
        score_gold2 = this.add.sprite(1116,100, 'gold', frame = 12);
        score_gold3 = this.add.sprite(1084,100, 'gold', frame = 9);
        score_gold4 = this.add.sprite(1100,84, 'gold', frame = 10);
        score_gold5 = this.add.sprite(1116,84, 'gold', frame = 9);

        score_gold.add(score_gold1);
        score_gold.add(score_gold2);
        score_gold.add(score_gold3);
        score_gold.add(score_gold4);
        score_gold.add(score_gold5);

        chest_score = this.add.text(1150, 35, '0', {fontSize: '32px', fill: '#000'});
        treasure_score = this.add.text(1150, 85, '0', {fontSize:'32px', fill:"#000"});

        timeUp = this.add.text(480, 315, "TIME'S UP", {fill:'#000', font:'65px Arial'}).setInteractive()
        timeUp.setVisible(false);
        gameOverText = this.add.text(480, 315, "GAME OVER", {fill:'#0f0', font:'65px Arial'});
        gameOverText.setVisible(false);

        game.canvas.addEventListener('mouseup', function () {
            game.input.mouse.requestPointerLock();
        });

    }  

    function startGame(){
        console.log('startGame');
        startedGame = true;
        startedTrial = false;
        if(DEMO)
        {
            poissonMean = 4;
            GAME_OVER_THRESHOLD = 2;
        }
        else
        {
            poissonMean = 40;
            GAME_OVER_THRESHOLD = 400;
        }   
        RESULTS = new Object();
        RESULTS['distributions'] = [];
        RESULTS['trials'] = [];
        RESULTS['winner'] = [];
        RESULTS['timeout'] = [];
        if (experimentValue > 0.4)
            RESULTS['experiment'] = "A";
        else
            RESULTS['experiment'] = "B";
        currentTrial = [];
        setupNewBackground(this);
        winner = pickWinner(currentDistribution);
        stimulusLength = randomPoisson(poissonMean);
        if (RESULTS['experiment'] == "A")
        {
            bg.setTexture(currentBackground);
        }
        else
        {
            bg.setTexture("mountains");
        }
        d = new Object();
        d.start_trial = 1;
        d.end_trial = stimulusLength;
        d.background_name = currentBackground;
        d.dist = currentDistribution;
        RESULTS['distributions'].push(d);

        var now = new Date().getTime();
        countDownDate = now + TIME_PER_TRIAL;
    }

    function openPurple(trial){
        console.log("openPurple");
        console.log(trial);
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        if (!trial)
        {
            t = new Object();
            t.colour = "purple";
            t.reaction_time = seconds;
            t.order = getOrder("purple", currentDistribution);
            currentTrial.push(t);
        }

        resetReticle();
        if (!clicked)
        {
            clicked = true;
            reticle.setTexture("treasure_chests",frame=19);
            purple.setTexture("purple_open");
            if (!trial)
            {         
                setTimeout(function() 
                {
                    CHESTS_OPENED += 1;
                    chest_score.setText(CHESTS_OPENED);
                    if (winner === "purple")
                    {
                        TREASURE_FOUND += 1;
                        RESULTS['timeout'].push(false);
                        treasure_score.setText(TREASURE_FOUND);
                        correct_purple.setVisible(true);
                        purple_gold.toggleVisible();
                        resetGame(this);
                    }
                    else 
                    {
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_purple.setVisible(true);
                    }
                }, TIMEOUT_BETWEEN_BOXES) ;
            }
            else
            {
                setTimeout(function()
                {
                    if (winner === "purple")
                    {
                        correct_purple.setVisible(true);
                        purple_gold.toggleVisible();
                        resetTrial(this);
                    }
                    else 
                    {
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_purple.setVisible(true);
                    }
                }, TIMEOUT_BETWEEN_BOXES);
            }
        }
    }

    function openRed(trial){
        console.log("openRed");
        console.log(trial);
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        if(!trial)
        {
            t = new Object();
            t.colour = "red";
            t.reaction_time = seconds;
            t.order = getOrder("red", currentDistribution);
            currentTrial.push(t);
        }
        resetReticle();
        if (!clicked)
        {
            clicked = true;
            reticle.setTexture("treasure_chests",frame=19);
            red.setTexture("red_open");
            if(!trial)
            {
                setTimeout(function() 
                {
                    CHESTS_OPENED += 1;
                    chest_score.setText(CHESTS_OPENED);
                    if (winner === "red")
                    {
                        red_gold.toggleVisible();
                        correct_red.setVisible(true);
                        RESULTS['timeout'].push(false);
                        TREASURE_FOUND += 1;
                        treasure_score.setText(TREASURE_FOUND);
                        resetGame(this);
                    }
                    else 
                    {
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_red.setVisible(true);
                    }  
                }, TIMEOUT_BETWEEN_BOXES) ;
            }
            else
            {
                setTimeout(function() 
                {
                    if (winner === "red")
                    {
                        red_gold.toggleVisible();
                        correct_red.setVisible(true);
                        resetTrial(this);
                    }
                    else 
                    {
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_red.setVisible(true);
                    }  
                }, TIMEOUT_BETWEEN_BOXES) ;
            }
        }
    }

    function openGreen(trial){
        console.log("openGreen");
        console.log(trial);
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        if (!trial)
        {
            t = new Object();
            t.colour = "green";
            t.reaction_time = seconds
            t.order = getOrder("green", currentDistribution);
            currentTrial.push(t);
        }

        resetReticle();
        if (!clicked)
        {
            clicked = true;
            reticle.setTexture("treasure_chests",frame=19);
            green.setTexture("green_open");
            if(!trial)
            {
                setTimeout(function() {
                    CHESTS_OPENED += 1;
                    chest_score.setText(CHESTS_OPENED);
                    if (winner === "green"){
                        TREASURE_FOUND += 1;
                        RESULTS['timeout'].push(false);
                        correct_green.setVisible(true);
                        treasure_score.setText(TREASURE_FOUND);
                        green_gold.toggleVisible();
                        resetGame(this);
                    }
                    else{
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_green.setVisible(true);
                    }
                }, TIMEOUT_BETWEEN_BOXES) ;
            }
            else
            {
                setTimeout(function() {
                    if (winner === "green"){
                        correct_green.setVisible(true);
                        green_gold.toggleVisible();
                        resetTrial(this);
                    }
                    else{
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_green.setVisible(true);
                    }
                }, TIMEOUT_BETWEEN_BOXES) ;    
            }
        }
    }


    function openBlue(trial)
    {
        console.log("openBlue");
        console.log(trial);
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        if(!trial)
        {
            t = new Object();
            t.colour = "blue";
            t.reaction_time = seconds;
            t.order = getOrder("blue", currentDistribution);
            currentTrial.push(t);
        }

        resetReticle();
        if (!clicked)
        {
            clicked = true;
            reticle.setTexture("treasure_chests",frame=19);
            blue.setTexture("blue_open");
            if(!trial)
            {
                setTimeout(function() {
                    CHESTS_OPENED += 1;
                    chest_score.setText(CHESTS_OPENED);
                    if (winner === "blue")
                    {
                        TREASURE_FOUND += 1;
                        RESULTS['timeout'].push(false);
                        treasure_score.setText(TREASURE_FOUND);
                        correct_blue.setVisible(true);
                        blue_gold.toggleVisible();
                        resetGame(this);
                    }
                    else
                    {
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_blue.setVisible(true);
                    }
                }, TIMEOUT_BETWEEN_BOXES) ;
            }
            else
            {
                setTimeout(function() 
                {
                    if (winner === "blue")
                    {
                        correct_blue.setVisible(true);
                        blue_gold.toggleVisible();
                        resetTrial(this);
                    }
                    else
                    {
                        clicked = false;
                        reticle.setTexture("key",frame=2);
                        wrong_blue.setVisible(true);
                    }
                }, TIMEOUT_BETWEEN_BOXES) ;
            }
        }
      }


function update() {
    if ((startedGame || startedTrial) && !isGameOver)
    {
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = Math.ceil((distance % (1000 * 60)) / 1000);

        if (distance < 0 && !clicked)
        {
            displayWinner();
            countDownDate = now + TIME_PER_TRIAL;
            timeUp.setVisible(true);
            setTimeout(function(){
                if(!startedTrial)
                {
                    RESULTS['timeout'].push(true);
                    resetGame(this);
                }
                else
                {
                    resetTrial(this);
                }
                countDownDate = now + TIME_PER_TRIAL;
            }, 1000);
        }
        else
        {
            timeleft.setText(seconds); 
        }
    }
}

function getOrder(colour, distribution)
{
    var col;
    var answer = 1;
    for (cc in colors)
    {
        col = colors[cc];
        if (col === colour)
            continue;
        if (distribution[col] > distribution[colour])
            answer += 1; 
    }
    return answer;
}

function displayWinner(){
    clicked = true;
    red.setTexture("red_open");
    blue.setTexture("blue_open");
    green.setTexture("green_open");
    purple.setTexture("purple_open");
    if (winner === "red"){
        red_gold.children.each(function(c) { c.setVisible(true);});
        wrong_blue.setVisible(true);
        wrong_green.setVisible(true);
        wrong_purple.setVisible(true);
        correct_red.setVisible(true);
    }
    if (winner === "blue"){
        blue_gold.children.each(function(c) { c.setVisible(true);});
        wrong_red.setVisible(true);
        wrong_green.setVisible(true);
        wrong_purple.setVisible(true);
        correct_blue.setVisible(true);
    }
    if (winner === "green"){
        green_gold.children.each(function(c) { c.setVisible(true);});
        wrong_red.setVisible(true);
        wrong_blue.setVisible(true);
        wrong_purple.setVisible(true);
        correct_green.setVisible(true);

    }
    if (winner === "purple"){
        purple_gold.children.each(function(c) { c.setVisible(true);});
        wrong_red.setVisible(true);
        wrong_green.setVisible(true);
        wrong_blue.setVisible(true);
        correct_purple.setVisible(true);
    }
}

function makeEverythingInvisible()
{
    wrong_purple.setVisible(false);
    wrong_red.setVisible(false);
    wrong_green.setVisible(false);
    wrong_blue.setVisible(false);
    
    correct_purple.setVisible(false);
    correct_red.setVisible(false);
    correct_green.setVisible(false);
    correct_blue.setVisible(false);

    timeUp.setVisible(false);

    red_gold.children.each(function(c) { c.setVisible(false);});
    blue_gold.children.each(function(c) { c.setVisible(false);});
    green_gold.children.each(function(c) { c.setVisible(false);});
    purple_gold.children.each(function(c) { c.setVisible(false);});
}

function gameOver()
{
    isGameOver = true;

    red.destroy();
    blue.destroy();
    green.destroy();
    purple.destroy();

    red_gold.children.each(function(c) { c.destroy();});
    blue_gold.children.each(function(c) { c.destroy();});
    green_gold.children.each(function(c) { c.destroy();});
    purple_gold.children.each(function(c) { c.destroy();});

    timeUp.destroy();

    wrong_purple.destroy();
    wrong_red.destroy();
    wrong_green.destroy();
    wrong_blue.destroy();

    timeleft.destroy();
    hourglass.destroy();
    bg.destroy();

    gameOverText.setVisible(true);
    chest_score.setStyle({
        color: '#00ff00'
    });
    treasure_score.setStyle({
        color: '#00ff00'
    });    

    var data = new FormData();
    data.append("id", "TEST2");
    data.append("results", "PLSWORK");

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
        console.log(this.responseText);
     }
    });

    xhr.open("POST", "http://ec2-18-191-152-186.us-east-2.compute.amazonaws.com/save.php");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Postman-Token", "22b35aad-6d2a-4dd9-95c3-92ad5f3270fd");

    xhr.send(data);
}