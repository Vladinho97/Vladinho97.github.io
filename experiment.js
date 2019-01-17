

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
    var gold1,gold2,gold3,gold4;
    var stimulusLength;
    var reticle;
    var red_gold_visibility;
    var blue_gold_visibility;
    var purple_gold_visibility;
    var green_gold_visibility;
    var wrong_red;
    var wrong_blue;
    var wrong_green;
    var wrong_purple;
    var poissonMean = 40;
    var TIMEOUT_BETWEEN_BOXES = 100;
    var TIME_TO_RESET = 1500;
    var TIME_PER_TRIAL = 3500;
    var RULES = "THE GOAL OF THE GAME IS FINDING THE TREASURE, WHICH LIES IN ONE OF THE CHESTS.\
                 \n\nUSE YOUR KEY (  ) TO OPEN CHESTS (   ) BY CLICKING OVER THEM. \
                 \n\nA RED CIRCLE SIGNALS THE CHEST IS EMPTY. \
                 \n\nA GREEN CIRCLE SIGNALS YOU HAVE FOUND THE TREASURE  \
                 \n\nBEWARE THAT YOU HAVE A LIMITED AMOUNT OF TIME TO FIND THE TREASURE.\
                 \n\nTRY TO EARN AS MUCH TREASURE AS YOU CAN!";
    var CHESTS_OPENED = 0;
    var TREASURE_FOUND = 0;
    

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
        d = {"red":redProb,
             "blue":blueProb,
             "green":greenProb,
             "purple":purpleProb};
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
      epoch = 0;
      N = distributions.length;
      rgn = Math.random();
      console.log(rgn);
      console.log(currentBackground);
      console.log(currentDistribution);
      console.log((N - 1.0) / (N + 1.0));
      if (rgn > ((N - 1.0) / (N + 1.0)))
      {
          console.log("NEW BACKGROUND")
          setupNewBackground(this);
      }
      else
      {
          console.log("REVERT")
          s = 0;
          for (ii = 0; ii < N; ii++)
          {
              if (backgrounds[ii]!==currentBackground)
              { 
                s = s + 1.0 / (N + 1.0);
                console.log(s);
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

    function resetGame()
    {
       console.log("RESET GAME");
       console.log(currentDistribution);
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
         if (epoch == stimulusLength){
            console.log(backgrounds);
            console.log(distributions);
            chooseNewStimulusCRP(this);
            stimulusLength = randomPoisson(poissonMean);
            bg.setTexture(currentBackground);
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
      console.log("create")
      showIntro.call(this)

    }

    function showIntro()
    {
       console.log("Show Intro")
       reticle = this.add.sprite(250, 130, 'key',frame=2).setInteractive();
       chest = this.add.sprite(442, 130, 'treasure_chests', frame=19);
       rules_text = this.add.text(100, 100, RULES, { fill: '#0f0' });
       clickButton = this.add.text(510, 360, "START", {fill:'#0f0', font:'65px Arial'}).setInteractive()
      .on('pointerdown', () => startGame.call(this));
    }  

    function startGame(){

      startedGame = true;
      setupNewBackground(this);
      clickButton.destroy();
      rules_text.destroy();
      winner = pickWinner(currentDistribution);
      stimulusLength = randomPoisson(poissonMean);
      var now = new Date().getTime();
      countDownDate = now + TIME_PER_TRIAL;

      bg = this.add.tileSprite(640, 360, 1280, 720, currentBackground);
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
      hourglass = this.add.sprite(50, 50, 'hourglass');
      timeleft = this.add.text(100, 30, '5', {fontSize:'50px', fill:'#000'});
      red.inputEnabled = true;
      blue.inputEnabled = true;
      green.inputEnabled = true;
      purple.inputEnabled = true;
      reticle.inputEnabled = true;
      red_gold_visibility = false;
      purple_gold_visibility = false;
      green_gold_visibility = false;
      blue_gold_visibility = false;

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

      timeUp = this.add.text(480, 315, "TIME'S UP", {fill:'#000', font:'65px Arial'}).setInteractive()
      timeUp.setVisible(false);

      console.log("CREATE");
      game.canvas.addEventListener('mouseup', function () {
        game.input.mouse.requestPointerLock();
    });
      console.log(this);
      this.input.on('pointermove', function (pointer) {

          // Move reticle with mouse
          reticle.x += pointer.movementX;
          reticle.y += pointer.movementY;

    }, this);

      this.input.on('pointerdown', function(pointer) {
        if (reticle.x > 376 && reticle.x < 504 && reticle.y > 106 && reticle.y < 234 && !clicked &&!opened["red"])
        {
          opened["red"] = true;
          openRed.call(this);
        }
        if (reticle.x > 376 && reticle.x < 504 && reticle.y > 486 && reticle.y < 614 && !clicked && !opened["blue"])
        {
          opened["blue"] = true;
          openBlue.call(this);
        }
        if (reticle.x > 776 && reticle.x < 904 && reticle.y > 486 && reticle.y < 614 && !clicked && !opened["green"])
        {
          opened["green"] = true;
          openGreen.call(this);
        }
        if (reticle.x > 776 && reticle.x < 904 && reticle.y > 106 && reticle.y < 234 && !clicked && !opened["purple"])
        {
          opened["purple"] = true;
          openPurple.call(this);
        }
      }, this);

    console.log("CREATE_END")
  }

     function openPurple(){
       console.log("openPurple");
       resetReticle();
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          purple.setTexture("purple_open");         
          setTimeout(function() {
              CHESTS_OPENED += 1;
              chest_score.setText(CHESTS_OPENED);
              if (winner === "purple"){
                TREASURE_FOUND += 1;
                treasure_score.setText(TREASURE_FOUND);
                correct_purple.setVisible(true);
                purple_gold_visibility = true;
                purple_gold.toggleVisible();
                resetGame(this);
              }
              else {
                clicked = false;
                reticle.setTexture("key",frame=2);
                wrong_purple.setVisible(true);
              }
          }, TIMEOUT_BETWEEN_BOXES) ;
        }
      }

      function openRed(){
        console.log("openRed");
        resetReticle();
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          red.setTexture("red_open");
          setTimeout(function() {
              CHESTS_OPENED += 1;
              chest_score.setText(CHESTS_OPENED);
              if (winner === "red"){
                red_gold_visibility = true;
                red_gold.toggleVisible();
                correct_red.setVisible(true);
                TREASURE_FOUND += 1;
                treasure_score.setText(TREASURE_FOUND);
                resetGame(this);
              }
              else {
                clicked = false;
                reticle.setTexture("key",frame=2);
                wrong_red.setVisible(true);
              }
          }, TIMEOUT_BETWEEN_BOXES) ;
        }
      }



      function openGreen(){
        console.log("openGreen");
        resetReticle();
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          green.setTexture("green_open");
          setTimeout(function() {
              CHESTS_OPENED += 1;
              chest_score.setText(CHESTS_OPENED);
              if (winner === "green"){
                TREASURE_FOUND += 1;
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
      }


      function openBlue(){
        console.log("openBlue");
        resetReticle();
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          blue.setTexture("blue_open");
          setTimeout(function() {
              CHESTS_OPENED += 1;
              chest_score.setText(CHESTS_OPENED);
              if (winner === "blue"){
                TREASURE_FOUND += 1;
                treasure_score.setText(TREASURE_FOUND);
                correct_blue.setVisible(true);
                blue_gold.toggleVisible();
                resetGame(this);
              }
              else{
                clicked = false;
                reticle.setTexture("key",frame=2);
                wrong_blue.setVisible(true);
              }
          }, TIMEOUT_BETWEEN_BOXES) ;
        }
      }


function update() {
    if (startedGame)
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
                resetGame();
                countDownDate = now + TIME_PER_TRIAL;
            }, 1000);
        }
        else
        {
            timeleft.setText(seconds); 
        }
    }
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