class Cards {
    constructor(htmlElement) {
        this.hE = htmlElement;
        this.number = parseInt(this.hE.id.split('-')[1]);
        this.shape = this.number == 20 ? null : this.hE.id.split('-')[0];
        this.special = [2, 1, 14, 20].includes(this.number) ? true : false;
        this.isINeed = this.number == 20;
        this.isPickTwo = this.number == 2;
        this.isHoldOn = this.number == 1;
        this.isGoGen = this.number == 14;
        this.cardName = this.isINeed ? 'I need' : `${this.number} ${this.shape}`;
    }
    //move and increase height and width
    /*sample argument --> ({fheight: 540, fwidth: 456, ftop: 50, fleft: 350}, cleanup, 0.5);*/
    move_scale(finalStyles, cleanup, duration_s){
        //due to transformations e.g scaling, these values might not be exact
        const {height, width, top, left} = this.hE.getBoundingClientRect();

        for(let key in finalStyles){//ensures the right keys passed
            if (key && key[0] !== ('f')) throw new Error(`move_scale object keys should be either fheight, fwidth, ftop, fleft. Not ${key}`);
        }
        const {fheight, fwidth, ftop, fleft} = finalStyles;
        
        // getting the error in increase in top and left, due to transformations
        const actual = dimensions(this.hE); //used to get actual width and height. [x, y] here is also affected by transformations
        const delta = {height: height-actual.height, width: width - actual.width};  //error in height and width due to transformations
        const error= {y: delta.height * 0.5, x: delta.width * 0.5}; //error in top and left
        
        this.hE.classList.add('move-scale');       //class name with animation properties
        const element = this.hE;

        // the [fleft, ftop] is the apparent [x, y]
        // to get the actual final point, due to scaling about the center, formula is:
        //  [x, y] = [ fleft + (0.5*fwidth - 0.5*actual.width), ftop + (0.5*fheight - 0.5*actual.height)]
        //                          x_gap                                       y_gap
        const actualPoint = {x: null, y:null, x_gap: null, y_gap: null};
        if(fheight){
            element.style.setProperty('--finalHeight', fheight+'px');
            actualPoint.y_gap = 0.5*fheight - 0.5*actual.height;
        }
        else{// if height is not changing
            element.style.setProperty("--finalHeight", actual.height+'px');
            actualPoint.y_gap = 0;
        }
        if (fwidth){
            element.style.setProperty('--finalWidth', fwidth+'px');
            actualPoint.x_gap = 0.5*fwidth - 0.5*actual.width;
        }
        else{
            element.style.setProperty('--finalWidth', actual.width+'px');
            actualPoint.x_gap = 0;
        }
        if(fleft){
            actualPoint.x = fleft + actualPoint.x_gap;
            const deltaX = (actualPoint.x - (left+window.scrollX))-error.x;
            element.style.setProperty('--finalTranslateX', `${deltaX}px`);
        }
        if(ftop){
            actualPoint.y = ftop + actualPoint.y_gap;
            const deltaY = (actualPoint.y - (top+window.scrollY))-error.y;
            element.style.setProperty('--finalTranslateY', `${deltaY}px`);
        }
        let cleanupDelay;
        if(duration_s) {
            element.style.setProperty('--duration', `${duration_s}s`);
            cleanupDelay = (duration_s*1000)+50;
        }
        else cleanupDelay = 550;    //default time is 0.5 seconds.
        setTimeout(()=>{
            this.hE.classList.remove('move-scale');
            element.style.setProperty('--finalTranslateX', '');
            element.style.setProperty('--finalTranslateY', '');
            element.style.setProperty('--finalWidth', '');
            element.style.setProperty('--finalHeight', '');
            element.style.setProperty('--duration', '');
            if (cleanup) cleanup();
        }, cleanupDelay);
    }
    makePlayerCard(cleanup){
        removeItem(fullDeck, this.hE.id);
        this.hE.classList.add('player-cards');
        htmls.playerCardsSlot.append(this.hE);
        playerHand.push(this.hE.id);
        if (!states.isPlaying) this.hE.addEventListener('click', playerTurn);
        // it will be enabled when the next enable is called
        updateNums();
        if (cleanup) cleanup();
    }
    makePlayedCard(comingFrom, cleanup){
        const argPassed = comingFrom.toLowerCase(); //makes it case insensitive
        const locations = {'fulldeck': fullDeck, "cpuhand": cpuHand, 'playerhand': playerHand};
        if (!Object.keys(locations).includes(argPassed)) throw new Error("Only fulldeck, cpuhand or playerhand allowed as arguments in makePlayercard");
        removeItem(locations[argPassed], this.hE.id);
        this.hE.classList.add('played-cards');
        this.hE.classList.remove('player-cards');
        playedCards.push(this.hE.id);
        htmls.playedCardsSlot.append(this.hE);
        this.hE.style.setProperty('z-index', playedCards.indexOf(this.hE.id).toString());
        updateNums();
        if (cleanup) cleanup();
    }
    blink(reason){
        states.enable();
        this.hE.classList.add('blinker');
        document.querySelector(".blinker").style.setProperty('--content', `"${reason}"`);
        setTimeout(() => this.hE.classList.remove('blinker'), 250);
    }
    pPlaysIneed(){
        this.playerDropsCard(() => {
            states.toggleShapesBox();
            checkFinish_s('player');
        });
    }
    playerPlays(){
        if (this.isGoGen){
            this.playerDropsCard(()=>{
                states.goGen = true;
                states.cpuTurn = setTimeout(cpuPlay, 1000);
                checkFinish_s('player');
                toggleInfo();
            });
        }
        else if(this.isPickTwo){
            this.playerDropsCard(()=>{
                states.increasePick2();
                states.cpuTurn = setTimeout(cpuPlay, 1000);
                checkFinish_s('player');
                toggleInfo();
            });
        }
        else if(this.isHoldOn){
            this.playerDropsCard(() => {
                toggleInfo('Play Again');
                checkFinish_s('player');
                states.enable();
            });
        }
        else if(this.isINeed) this.pPlaysIneed();
        else{
            this.playerDropsCard(() => {
                toggleInfo();
                states.cpuTurn = setTimeout(cpuPlay, 1000);
                checkFinish('player');
            });
        }
    }
    playerDropsCard(cleanup){
        const {offsetX, offsetY} = dimensions(htmls.playedCardsSlot);
        this.hE.style.zIndex = (playedCards.length+1).toString();
        this.move_scale({ftop: offsetY, fleft: offsetX}, () => this.makePlayedCard("playerhand", cleanup));
    }
    playerAnsrPick2(){
        if (this.isPickTwo){
            this.playerDropsCard(()=>{
                states.increasePick2();
                states.cpuTurn = setTimeout(cpuPlay, 1000);
                checkFinish_s('player');
                toggleInfo();
            });
        } else this.blink(`Pick ${states.shouldPick}`);
    }
    cpuDropCard(cleanup){
        const cpuCardSlot = document.querySelector('#cpu-card-num');
        cpuCardSlot.append(this.hE);
        this.hE.style.zIndex = (playedCards.length+1).toString();
        const fd = dimensions(htmls.playedCardsSlot);  // final dimensions
        this.move_scale({fleft: fd.offsetX, fheight: fd.height, fwidth: fd.width, ftop: fd.offsetY},
                        () => this.makePlayedCard('cpuhand', cleanup));
    }
    cpuPlays1(){
        this.cpuDropCard(() => {
            toggleInfo(`CPU played ${this.cardName}. Hold On`);
            states.cpuTurn = setTimeout(cpuPlay, 1000);
            checkFinish_s('cpu');
        });
    }
    cpuPlayIneed(){
        const shapes = ['cross', 'square', 'circle', 'star', 'triangle'];
        const ownedShapes = [];
        //  getting owned shapes
        for (let card of cpuHand){
            if (C[card].shape) ownedShapes.push(C[card].shape);
            else continue;
        }
        this.cpuDropCard(() => {
            states.enable();
            const chosenShape = ownedShapes.length === 0 ? pickRandom(shapes) : pickRandom(ownedShapes);
            states.setIneed(chosenShape);
            toggleInfo(`CPU needs ${states.iNeed}`);
            checkFinish_s('cpu');
        });
    }
}



//global variables
const allCards = (function(){
    const shapes = ['cross', 'square', 'circle', 'star', 'triangle'];
    let newArray = ['whot_1-20', 'whot_2-20', 'whot_3-20', 'whot_4-20', 'whot_5-20']
    for (let i = 1;i <= 14;i++){
        if (i === 6 || i === 9) continue
        else{
            for (let shape of shapes){
                newArray.push(`${shape}-${i}`)
            }
        }
    }
    const unwantedCards = ['square-4', 'cross-4', 'cross-8', 'square-8', 'star-10',
                'star-11', 'cross-12','square-12', 'star-12', 'star-13', 'star-14']
    return newArray.filter(card => !unwantedCards.includes(card));
}());

//cards object instances
const C = {
    //market animation.
    marketAnimate: function(co, cleanup){//cards object
                        const samples = co.map(() => {  //used to get their position on screen
                            const newSample = document.createElement('div');
                            htmls.playerCardsSlot.append(newSample);
                            return newSample;
                        });

                        //get's their position on screen
                        const sampleDims = samples.map(sample => {
                            const sd = dimensions(sample);  //sample's dimensions
                            return {fheight: sd.height, fwidth: sd.width, ftop: sd.offsetY, fleft: sd.offsetX};
                        });
                        //all has to be gotten before any can be removed
                        //or else, the positions would change.
                        co.forEach((card, i) => {
                            htmls.market.append(card.hE);
                            card.move_scale(sampleDims[i], () => {
                                samples[i].remove();
                                card.makePlayerCard(() => cleanup(i == co.length - 1));
                            });
                        });
                    }
};

const htmls = {
    body: document.querySelector("body"),
    questionPage: document.querySelector("#question-page"),
    playingPage: document.querySelector("#playing-page"),
    winningPage: document.querySelector("#winning-page"),
    winningPage2: document.querySelector("#winning-page2"),
    topSection: document.querySelector("#top-section"),
    playedCardsSlot: document.querySelector("#played-cards-slot"),
    playerCardsSlot: document.querySelector('#player-cards-slot'),
    cpuCardNum: document.querySelector("#cpu-card-num > p"),
    marketNum: document.querySelector("#market-num > p"),
    cpuCardSlot: document.querySelector("#cpu-card-num"),
    marketNumSlot: document.querySelector("#market-num"),
    shapeNeeded: document.querySelector('#shape-needed'),
    market: document.querySelector("#market-slot"),
    notcp: document.querySelector("#market-slot > span"),
    infoBox: document.querySelector("#info-box"),
    shapes: document.querySelectorAll('.shape'),
    shapesBox: document.querySelector("#shapes-box"),
    cuoBtn: document.querySelector('#buttons-qp > button:nth-of-type(1)'),  //check-up only button
    cpBtn: document.querySelector('#buttons-qp > button:nth-of-type(2)')    //count points button
}

let fullDeck = [];
let playerHand = [];
let cpuHand = [];
let playedCards = [];

//stateful variables used for gameplay
const states = {
    isPlaying: false,
    shouldPick: 0,
    goGen: false,
    iNeed: null,
    shapeNeededVisible: false,
    setIneed: function(shape){
                const {playingPage, shapeNeeded} = htmls;
                const img = document.querySelector('#shape-needed > img');
                if(shape){
                    states.iNeed = shape;
                    img.src = `assets/${shape}.png`;
                    img.alt = shape;
                    shapeNeeded.classList.remove('hide');
                    setTimeout(() => {//display as flex would not work with immediate animation
                        shapeNeeded.classList.remove('shape-needed-hide');
                        shapeNeeded.classList.add('shape-needed-show');
                        responsive.setIneed();
                        if (!states.shapeNeededVisible) window.addEventListener('resize', responsive.setIneed);
                        states.shapeNeededVisible = true;
                    }, 30);//so wait like 30 ms
                    playingPage.style.overflow = 'hidden';
                    setTimeout(() => playingPage.style.overflow = '', 350);//after animation, reset overflow
                }
                else{
                    states.shapeNeededVisible = false;
                    states.iNeed = null;
                    playingPage.style.overflow = 'hidden';
                    shapeNeeded.classList.add('shape-needed-hide');
                    shapeNeeded.classList.remove('shape-needed-show');
                    window.removeEventListener('resize', responsive.setIneed);
                    setTimeout(() => {
                        playingPage.style.overflow = '';
                        shapeNeeded.classList.add('hide');
                    }, 350);
                }
            },
    cpuTurn: null,
    increasePick2: function(){
                    states.shouldPick += 2;
                    htmls.notcp.classList.add('show');
                    htmls.notcp.classList.remove('hide');
                    htmls.notcp.innerHTML = states.shouldPick;
                    },
    resetPick2: function(){
                    states.shouldPick = 0;
                    htmls.notcp.classList.add('hide');
                    htmls.notcp.classList.remove('show');
                    htmls.notcp.innerHTML = '';
                },
    finishMethod: null,   //check-up only or count points
    setFinishMethod: function(e){
        function clicked(e){
            e.classList.add('clicked');
            setTimeout(() => e.classList.remove('clicked'), 200);
        }
        function verify(e){  //when answer yes or no
            qp_buttons(verify); //remove current event listeners
            clicked(e.target);
            if (e.target.dataset.finish_method == 'yes'){
                setTimeout(startGame, 400);
            }
            else if (e.target.dataset.finish_method == 'no') {
                setTimeout(() => qp_buttons(states.setFinishMethod, {text: "Count Points if market Finish", data: "count points"}, {text: "End With Check-up only", data: "check-up only"}), 400);
            }
        }
        qp_buttons(states.setFinishMethod); //remove current event listeners
        clicked(e.target);
        states.finishMethod = e.target.dataset.finish_method;
        setTimeout(() => qp_buttons(verify, {text: 'No', data: "no"}, {text: "Yes", data: 'yes'}), 400);
    },
    enabled: true,
    //prevent player from playing
    enable: function(){
                if (!states.enabled){
                playerHand.forEach(card => C[card].hE.addEventListener('click', playerTurn));
                htmls.market.addEventListener('click', player_market);
                states.enabled = true;
                }
            },
    disable: function(){
                if (states.enabled){
                playerHand.forEach(card => C[card].hE.removeEventListener('click', playerTurn));
                htmls.market.removeEventListener('click', player_market);
                states.enabled = false;
                }
            },
    whoseTurn: null,    //used for knowing who should play after market refreshes.
    shapesBoxVisible: false,
    toggleShapesBox: function(){
                        const {playingPage, shapesBox} = htmls;
                        if (!states.shapesBoxVisible) {
                            shapesBox.classList.remove('hide');
                            shapesBox.classList.add('show2');
                            shapesBox.classList.add('bounce');
                            states.shapesBoxVisible = true;
                            responsive.toggleShapesBox();
                            window.addEventListener('resize', responsive.toggleShapesBox);
                        }
                        else{
                            const translate = 100;     //outer sections transform distance
                            //all sections in the same row have the same y and same column same x.
                            //             -100px                   -50px               50px                    100px
                            const x_y = [-1*translate+"px", -1*translate / 2 +"px", translate / 2 +"px", translate+"px"];
                            for (let x = 0;x < 16;x++){
                                const row = Math.floor(x/4);    //0 0 0 0 1 1 1 1 2 2 2 2 3 3 3 3
                                const col = x % 4;  //0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3
                                const top = 25 * row;   
                                const bottom = 75 - top;    //75 - top
                                const left = 25 * col;  // 0  25 50 75 and repeat
                                const right = 75 - left;    // 75 50 25 0
                                const newSB = shapesBox.cloneNode(true);   //new shapes box                               
                                newSB.id = `clone-${x}`;
                                htmls.topSection.append(newSB);
                                newSB.classList.remove('bounce');
                                newSB.classList.add('explode');
                                newSB.style.setProperty('clip-path', `inset(${top}% ${right}% ${bottom}% ${left}%)`);
                                newSB.style.setProperty('--transform', `${x_y[col]}, ${x_y[row]}`);
                                setTimeout(() => {
                                    newSB.remove();
                                    responsive.toggleShapesBox();
                                    window.removeEventListener('resize', responsive.toggleShapesBox);
                                }, 1050);
                            }
                            shapesBox.classList.remove('bounce');
                            shapesBox.classList.remove('show2');
                            shapesBox.classList.add('hide');
                            states.shapesBoxVisible = false;
                        }
                    }
}
//global variables end



//used functions
//functions that make things neater

//THIS FUNCTION IS TO REMOVE A SPECIFIED ITEM FROM A LIST
function removeItem(array, itemToRemove) {
    var indexToRemove = array.indexOf(itemToRemove);
    if (indexToRemove !== -1) {
        array.splice(indexToRemove, 1);
    } else throw new Error(itemToRemove + ' is not in ' + array);
}


//THIS FUNCTION IS TO PICK A RANDOM ITEM FROM AN ARRAY
function pickRandom(array) {
    var randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

const responsive = {
    //should happen every time the page resizes every time
    main: function(){
        const {marketNumSlot, cpuCardSlot, shapeNeeded} = htmls;
        const ccsHeight = cpuCardSlot.clientHeight;//cpuCardSlot height
        //market & CPU card num
        marketNumSlot.style.width = ccsHeight+'px';
        cpuCardSlot.style.width = ccsHeight+"px";
        //shape needed
        shapeNeeded.style.height = ccsHeight+'px';
        shapeNeeded.style.width = ccsHeight+'px';
    },
    //should happen only while shapeNeeded is visible
    setIneed: function(){
        // positions shapeNeeded under info box
        responsive.main();
        const {shapeNeeded, infoBox} = htmls;
        const inbBottom = dimensions(infoBox);//infoBox bottom
        if (inbBottom.offsetY && inbBottom.height){
            shapeNeeded.style.top = inbBottom.offsetY + inbBottom.height + 'px';
            shapeNeeded.style.bottom = '';
        }
        else{//default position if infobox is not there
            shapeNeeded.style.bottom = '10px';
            shapeNeeded.style.top = "";
        }
    },
    //should happen only while shapesBox is visible
    toggleShapesBox: function(){
        const {shapesBox, playerCardsSlot} = htmls;
        const topAdjustment = dimensions(shapesBox).height + 20;
        if(topAdjustment && window.innerWidth <= 596){
            //the margin on playerCardsSlot made it look awkward, so I reduced it to half
            playerCardsSlot.style.marginTop = `${topAdjustment}px`;
        }
        else playerCardsSlot.style.marginTop = '';
    }
}

//question page buttons
//This changes the buttons text and associated data
//                            {  text: "", data: ""  }
function qp_buttons(callback, countPoints, check_upOnly){
    if (countPoints && check_upOnly) {
        htmls.cpBtn.addEventListener('click', callback);
        htmls.cuoBtn.addEventListener('click', callback);
        htmls.cpBtn.innerHTML = countPoints.text;
        htmls.cpBtn.dataset.finish_method = countPoints.data;
        htmls.cuoBtn.innerHTML = check_upOnly.text;
        htmls.cuoBtn.dataset.finish_method = check_upOnly.data;
    }
    else{
        htmls.cpBtn.removeEventListener('click', callback);
        htmls.cuoBtn.removeEventListener('click', callback);
    }
}


function toggleInfo(message){
    const {infoBox} = htmls;
    if (message){
        infoBox.innerHTML = message;
        infoBox.classList.add('show');
        infoBox.classList.remove('hide');
    }
    else {
        infoBox.classList.remove('show');
        infoBox.classList.add('hide');
    }
}


function chooseIneed(){
    const chosenShape = this.id;
    states.setIneed(chosenShape);
    states.toggleShapesBox();
    states.cpuTurn = setTimeout(cpuPlay, 1000);
}

function dimensions(element){
    let {top, left} = element.getBoundingClientRect();
    const {height, width} = window.getComputedStyle(element);
    top+=window.scrollY;
    left+=window.scrollX;
    return {offsetX:left, offsetY:top, height: parseFloat(height), width: parseFloat(width)};
    //returns left as offsetX, top as offsetY, height as height, width as width 
}

function updateNums(){
    htmls.cpuCardNum.innerHTML = cpuHand.length;
    htmls.marketNum.innerHTML = fullDeck.length;
    //console.log(cpuHand.map(card => C[card].cardName));
}
function fadeToggle(...objects){    //sample argument {element: html.topSection, display: 'block}
    for (let o of objects){
        const {element, display} = o;
        if (display){
            htmls.body.append(element);
            element.classList.add('fade-in');
            element.classList.remove('invisible');
            element.classList.remove('fade-out');
            element.style.setProperty('--display', display);
        }
        // don't put display to fade out
        else{
            element.classList.add('fade-out');
            element.classList.remove('fade-in');
            element.style.setProperty('--display', '');
            setTimeout(() => {
                element.remove();
            }, 750);
        }
    }
}



//  used functions



//game play functions
function createCards(){
    for (let name of allCards){
        const newDiv = document.createElement('div');
        newDiv.classList.add('cards');
        newDiv.id = name;
        C[name] = new Cards(newDiv);
        const newImage = document.createElement("img");
        newImage.src = C[name].isINeed ? "assets/Whot-20.png" : 'assets/'+name+'.png';
        newDiv.append(newImage);
    }
}

function startGame(){
    createCards();
    fullDeck = [...allCards];
    //deal the first card
    let dealableCards = fullDeck.filter(card => !C[card].special);
    let cardDealt = C[pickRandom(dealableCards)];
    cardDealt.makePlayedCard('fullDeck');

    //deal the player's hand
    for (let i = 0;i < 6;i++){
        let cardPicked = C[pickRandom(fullDeck)];
        cardPicked.makePlayerCard();
    }

    //deal the cpuHand
    for (let i = 0;i < 6;i++){
        let cardPicked = pickRandom(fullDeck);
        removeItem(fullDeck, cardPicked);
        cpuHand.push(cardPicked);
    }
    updateNums();
    htmls.market.addEventListener('click', player_market);
    states.isPlaying = true;
    fadeToggle({element: htmls.questionPage}, {element: htmls.playingPage, display: 'block'});
    responsive.main();// get height when they aren't hidden to avoid zero width
}

function marketFinish(){
    if (states.finishMethod == 'check-up only') refill(() => {
        if (states.whoseTurn == 'player') states.enable();
        else if(states.whoseTurn == 'cpu') states.cpuTurn = setTimeout(cpuPlay, 300);
    });
    else{
        const {winningPage2, playingPage} = htmls;
        states.isPlaying = false;
        fadeToggle({element: winningPage2, display: 'block'}, {element: playingPage});
        const yourCardSlot = document.querySelector('#slot-for-cards:nth-of-type(1)');
        const cpuCardSlot = document.querySelector('#slot-for-cards:nth-of-type(2)');
        const points = {cpu: 0, player: 0};
        playerHand.forEach(card => {
            const co = C[card];
            yourCardSlot.append(co.hE);
            co.hE.classList.remove('player-cards');
            points.player += co.number;
        });
        cpuHand.forEach(card => {
            const co = C[card];
            cpuCardSlot.append(co.hE);
            points.cpu += co.number;
        });
        document.querySelector('#winning-page2 > p:nth-of-type(3) span').innerHTML = points.player;
        document.querySelector('#winning-page2 > p:nth-of-type(4) span').innerHTML = points.cpu;
        if(points.player > points.cpu){
            document.querySelector('#winning-page2 > p:nth-of-type(5) span:nth-of-type(1)').innerHTML = "You Lost!";
            document.querySelector("#winning-page2 > p:nth-of-type(5)").classList.add('loser');
            document.querySelector("#winning-page2 > p:nth-of-type(5)").classList.remove('winner');
            document.querySelector('.play-again').innerHTML = "Try Again";
        }
        else if(points.player < points.cpu){
            document.querySelector('#winning-page2 > p:nth-of-type(5) span:nth-of-type(1)').innerHTML = "You Win. Congratulations!";
            document.querySelector("#winning-page2 > p:nth-of-type(5)").classList.add('winner');
            document.querySelector("#winning-page2 > p:nth-of-type(5)").classList.remove('loser');
            document.querySelector('.play-again').innerHTML = "Play Again";
        }
        else{
            document.querySelector('#winning-page2 > p:nth-of-type(5) span:nth-of-type(1)').innerHTML = "It was a tie!";
            document.querySelector('.play-again').innerHTML = "Play Again";
            document.querySelector("#winning-page2 > p:nth-of-type(5)").classList.remove('winner');
            document.querySelector("#winning-page2 > p:nth-of-type(5)").classList.remove('loser');
        }
    }
}

function winner(whoWon){
    const {winningPage, playingPage} = htmls;
    states.isPlaying = false;
    fadeToggle({element: winningPage, display: 'block'}, {element: playingPage});
    const messageSlot = document.querySelector("#winning-page span:nth-of-type(1)");
    if (whoWon == 'player'){
        messageSlot.innerHTML = 'CHECK-UP. YOU WIN! CONGRATULATIONS ';
        winningPage.classList.add('winner');
        winningPage.classList.remove('loser');
    }
    else if(whoWon == 'cpu'){
        messageSlot.innerHTML = 'CHECK-UP. YOU LOST! ';
        document.querySelector('.play-again').innerHTML = 'Try Again';
        winningPage.classList.add('loser');
        winningPage.classList.remove('winner');
    }
    else throw new Error("winner argument must either be player or cpu.");
}

const reset = () => location.reload();

function checkFinish(forWho) {
    if (fullDeck.length === 0 && forWho.toLowerCase() == 'market') {
        clearTimeout(states.cpuTurn);
        setTimeout(marketFinish, 1000);
        states.disable();
    }
    else if (playerHand.length === 0 && forWho.toLowerCase() == 'player') {
        states.disable();
        clearTimeout(states.cpuTurn);
        setTimeout(function () {
            winner('player');
        }, 1000);
    }
    else if (cpuHand.length === 0 && forWho.toLowerCase() == 'cpu') {
        states.disable();
        clearTimeout(states.cpuTurn);
        setTimeout(function () {
            winner('cpu');
        }, 1000);
    }
    else if(!['player', 'cpu', 'market'].includes(forWho)) throw new Error("CheckFinish argument must be either player, cpu or market. Not "+ forWho);
}
//check finish special cards
function checkFinish_s(forWho){
    if (forWho.toLowerCase() == 'player' && playerHand.length == 0){
        const cp = C[pickRandom(fullDeck)];
        C.marketAnimate([cp], () => checkFinish('market'));
        states.whoseTurn = 'cpu';
    }
    else if(forWho.toLowerCase() == 'cpu' && cpuHand.length == 0){
        const newCard = pickRandom(fullDeck);
        removeItem(fullDeck, newCard);
        cpuHand.push(newCard);
        updateNums();
        states.whoseTurn = 'player';
        checkFinish('market');
    }
}


//transfer played cards to fulldeck
function refill(cleanup){
    const playedCards_copy = [...playedCards];
    playedCards_copy.forEach((card, index) => {
        const totalTime = 0.5+(index*0.015);
        function move_scale_cleanup(){
            const co = C[card];
            co.hE.style.setProperty('z-index', '');
            co.hE.classList.remove('played-cards');
            co.hE.remove();
            removeItem(playedCards, co.hE.id);
            fullDeck.push(co.hE.id);
            if (index >= playedCards_copy.length - 2){
                updateNums();
                C[playedCards[playedCards.length - 1]].hE.style.setProperty('z-index', '0');
                if (cleanup) setTimeout(cleanup, (totalTime*1000) + 50);
            };
        }
        if (index < playedCards_copy.length - 1){
            C[card].move_scale({fleft: dimensions(htmls.market).offsetX}, move_scale_cleanup, totalTime);
        }
    });
}

//player picks from market
function player_market(){
    states.disable();
    states.whoseTurn = 'cpu';
    const {shouldPick, finishMethod} = states;
    if (shouldPick){
        function cleanup(isLast){
            if (isLast){
                states.resetPick2();
                states.cpuTurn = setTimeout(cpuPlay, 1000);
            }
            checkFinish('market');
        }
        if (fullDeck.length > shouldPick){
            const fulldeck_copy = [...fullDeck];    //cards picked from fulldeck, could possibly be picked again.
            const cardsPicked = Array(shouldPick).fill(null).map(() => {
                const cardPicked = C[pickRandom(fulldeck_copy)];
                removeItem(fulldeck_copy, cardPicked.hE.id);//remove it so it can't be picked again
                return cardPicked;
            });
            C.marketAnimate(cardsPicked, cleanup);//it will eventually be removed from fullDeck later
        }
        else{   //fullDeck.length <= shouldPick
            if (finishMethod == 'count points'){
                const fulldeck_copy = [...fullDeck];
                const cardsPicked = Array(fullDeck.length).fill(null).map(() => {
                    const cardPicked = C[pickRandom(fulldeck_copy)];
                    removeItem(fulldeck_copy, cardPicked.hE.id);
                    return cardPicked;
                });
                C.marketAnimate(cardsPicked, cleanup);
            }
            else if (finishMethod == 'check-up only'){
                refill(() => {
                    const fulldeck_copy = [...fullDeck];
                    const cardsPicked = Array(shouldPick).fill(null).map(() => {
                        const cardPicked = C[pickRandom(fulldeck_copy)];
                        removeItem(fulldeck_copy, cardPicked.hE.id);
                        return cardPicked;
                    });
                    C.marketAnimate(cardsPicked, cleanup);
                });
            }
        }
    } else{
        C.marketAnimate([C[pickRandom(fullDeck)]], () => {
            states.goGen = false;
            states.cpuTurn = setTimeout(cpuPlay, 1000);
            checkFinish('market');
        });
    }
    toggleInfo();
}

function cpuAnsrPick2(){
    const playableCards = cpuHand.filter(card => C[card].isPickTwo);
    if (playableCards.length == 0){
        states.whoseTurn = 'player';
        function pickShouldPick(){
            for (let x = 1;x <= states.shouldPick;x++){
                //loop using shouldPick
                const cardPicked = pickRandom(fullDeck);
                removeItem(fullDeck, cardPicked);
                cpuHand.push(cardPicked);
                toggleInfo('CPU picked ' + x);
                if (fullDeck.length == 0) break;  //stop the loop. This will prevent cpu from picking undefined.
            }
            states.resetPick2();
            updateNums();
            states.enable();
            checkFinish('market');
        }
        if (states.finishMethod == 'check-up only' && fullDeck.length <= states.shouldPick) refill(pickShouldPick);
        else pickShouldPick();
        
    }
    else{
        //if cpu has 2 to play
        let cardPlayed = C[pickRandom(playableCards)];
        cardPlayed.cpuDropCard(() => {
            states.enable();
            states.increasePick2();
            toggleInfo('CPU played ' + cardPlayed.cardName + ' pick ' + states.shouldPick);
            checkFinish_s('cpu');
        });
    }
}
function cpuGoMarket(){
    const newCard = pickRandom(fullDeck);
    removeItem(fullDeck, newCard);
    cpuHand.push(newCard);
    toggleInfo('CPU went to market');
    updateNums();
    states.enable();
    checkFinish('market');
    states.whoseTurn = 'player';
}

function cpuAnsrIneed(){
    const playableCards = cpuHand.filter(card => C[card].isINeed || C[card].shape === states.iNeed);
    if (playableCards.length === 0) cpuGoMarket();
    else{
        const cardPlayed = C[pickRandom(playableCards)];
        if (cardPlayed.isINeed) cardPlayed.cpuPlayIneed();
        else{
            if (cardPlayed.isPickTwo){
                cardPlayed.cpuDropCard(() => {
                    states.enable();
                    states.increasePick2();
                    toggleInfo('CPU played ' + cardPlayed.cardName + ' pick ' + states.shouldPick);
                    checkFinish_s('cpu');
                });
            }
            else if(cardPlayed.isGoGen){
                cardPlayed.cpuDropCard(() => {
                    states.enable();
                    states.goGen = true;
                    toggleInfo('CPU played ' + cardPlayed.cardName + '. Go to market');
                    checkFinish_s('cpu');
                });
            }
            else if(cardPlayed.isHoldOn) cardPlayed.cpuPlays1();
            else cardPlayed.cpuDropCard(() => {
                states.enable();
                toggleInfo(`CPU played ${cardPlayed.cardName}`);
                checkFinish('cpu');
            });
            states.setIneed();
            
        }
    }
}

function cpuPlay(){
    let lpc = C[playedCards[playedCards.length - 1]];   //lastPlayedCard
    let playableCards = cpuHand.filter(card => C[card].shape == lpc.shape || C[card].number == lpc.number || C[card].isINeed);
    if (states.shouldPick) cpuAnsrPick2();
    else if(states.goGen){
        cpuGoMarket();
        states.goGen = false;
    }
    else if(states.iNeed) cpuAnsrIneed();
    else{
        if (playableCards.length === 0) cpuGoMarket();   //cpu has no card to play
        else{
            //if cpu has a card to play,
            let cardPlayed = C[pickRandom(playableCards)];
            if (cardPlayed.isPickTwo){
                cardPlayed.cpuDropCard(() => {
                    states.enable();
                    states.increasePick2();
                    toggleInfo(`CPU played ${cardPlayed.cardName} pick ${states.shouldPick}`);
                    checkFinish_s('cpu');
                });
            }
            else if(cardPlayed.isGoGen){
                cardPlayed.cpuDropCard(() => {
                    states.enable();
                    states.goGen = true;
                    toggleInfo(`CPU played ${cardPlayed.cardName}. Go to market`);
                    checkFinish_s('cpu');
                });
            }
            else if(cardPlayed.isHoldOn) cardPlayed.cpuPlays1();
            else if (cardPlayed.isINeed)  cardPlayed.cpuPlayIneed();
            else{
                cardPlayed.cpuDropCard(() => {
                    states.enable();
                    toggleInfo(`CPU played ${cardPlayed.cardName}`);
                    checkFinish('cpu');
                });
            }
        }
    }
}

function playerTurn(){
    states.disable();
    const cp = C[this.id];//card played
    const lpc = C[playedCards[playedCards.length - 1]];//last played card
    if (cp.number == lpc.number || cp.shape == lpc.shape || cp.isINeed){
        if (states.shouldPick) cp.playerAnsrPick2();
        else if (states.goGen) cp.blink("Can't Play. Go to Market");
        else cp.playerPlays();
    }
    else if(states.iNeed){
        if (cp.shape == states.iNeed){
            states.setIneed();
            cp.playerPlays();
        }
        else cp.blink(`Play ${states.iNeed} or go to Market`);
    }
    else cp.blink("Can't play that Card");
}
//game play functions end



//functions that should happen when site loads
htmls.playingPage.remove();
htmls.winningPage.remove();
htmls.winningPage2.remove();



//Event listeners
window.addEventListener('resize', responsive.main);

qp_buttons(states.setFinishMethod, {text: "Count Points if market Finish", data: "count points"}, {text: "End With Check-up only", data: "check-up only"});
htmls.shapes.forEach(shape => shape.addEventListener('click', chooseIneed));




//uncomment line 514 to see cpu's cards