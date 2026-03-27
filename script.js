$(document).ready(function () {
  let bodyWidth = type => {
    let width = $('body').width();
    return type === 'str' ? width + 'px' : width;
  };
  //THIS IS TO MAKE THE HEIGHT-WIDTH RATIO OF THE CARDS FIXED.
  function getMarketWidth() {
    //market's width remains set to 15% with css.
    let marketWidth = $('#market').width() + 'px'; //it gets the width in pixels,
    return marketWidth;
  }
  function getMarketHeight() {
    let marketWidth = $('#market').width();
    let marketHeight = (3 * marketWidth) / 2 + 'px'; //calculate the height maintaining the ratio
    return marketHeight;
  }

  //THIS FUNCTION IS TO REMOVE A SPECIFIED ITEM FROM A LIST
  function removeItem(array, itemToRemove) {
    var indexToRemove = array.indexOf(itemToRemove);
    if (indexToRemove !== -1) {
      array.splice(indexToRemove, 1);
    } else {
      alert(itemToRemove + ' is not in ' + array);
    }
  }

  //THIS FUNCTION IS TO PICK A RANDOM ITEM FROM AN ARRAY
  function pickRandom(array) {
    var randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }
  //THIS FUNCTION IS TO SHUFFLE AN ARRAY.
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  //NOW MAKING THE DECK
  let fullDeck = []; //fulldeck backend
  let frontCards = $('.theCard'); //fulldeck frontend
  for (let x = 0; x < frontCards.length; x++) {
    let id = $(frontCards[x]).attr('id');
    fullDeck.push(id);
  }

  //GLOBAL VARIABLES
  let market = $('#market');
  let noctp = $('#market p'); //noctp means number of cards to pick.
  let playerCardsSlot = $('#playerCardsSlot');
  let playedCardsSlot = $('#playedCardsSlot');
  let hand = [];
  let cpuHand = [];
  let playedCards = [];
  let cpuTurn; //set Timeout variable

  //
  let shouldPick = 0; //noctp
  let goGen = false;
  let iNeed = ''; //current shape needed
  //

  //VARIABLES FOR INCREMENTING VALUES.
  let zIndex = 1;

  //SOME EXTRA ELEMENTS THAT DON'T HAVE FIXED POSITIONS
  let blinkingStuff = $('#blinkingStuff'); //this is the red stuff that blinks when you click an invalid card
  let marketCardNum = $('#marketCardNum');
  let cpuCardNum = $('#cpuCardNum p');
  let infoBox = $('#infoBox');
  let shapeNeed = $('#shapeNeed');
  let shapeImg = $('#shapeNeed img');
  let targetForMarket = $('#targetForMarket'); //this variable is for cards the human picked from market. It will be used to get the final poistion of the card within playerCardsSlot.

  let toDo;
  //GLOBAL VARIABLES END

  //THIS FUNCTION DROPS THE FIRST CARD
  function deal() {
    let dealableCards = [];
    //You can't deal special cards so don't add them to dealable list.
    for (let y = 0; y < fullDeck.length; y++) {
      let currentCardSplit = fullDeck[y].split(' ');
      if (
        fullDeck[y].includes('whot') ||
        currentCardSplit[0] === '2' ||
        currentCardSplit[0] === '14' ||
        currentCardSplit[0] === '8'
      ) {
        continue;
      } else {
        dealableCards.push(fullDeck[y]);
      }
    }
    let cardDealt = pickRandom(dealableCards);
    playedCards.push(cardDealt);
    let cardDealtRepl = '#' + cardDealt.replace(/ /g, '\\ ');
    //replace the character between //, in this case a space, with the character in the '', escape
    $(cardDealtRepl).appendTo(playedCardsSlot).addClass('aPlayedCard');
    removeItem(fullDeck, cardDealt);
  }

  //THIS ONE SHARES HUMAN AND CPU'S CARDS
  function start() {
    for (let x = 0; x <= 5; x++) {
      let newCard = fullDeck.pop();
      hand.push(newCard);
      let newCardRepl = '#' + newCard.replace(/ /g, '\\ ');
      $(newCardRepl).appendTo(playerCardsSlot).addClass('aPlayerCard');
      cpuHand.push(fullDeck.pop());
    }
    cpuCardNum.html(cpuHand.length);
    marketCardNum.html(fullDeck.length);
  }

  //THIS IS THE BLINKING EFFECT OF THE CARDS
  function invalidCard(card) {
    //the argument passed is the card that should blink. See humanPlay
    on();
    let parent = card; //
    let child = blinkingStuff;
    child.show().prependTo(parent);
    setTimeout(function () {
      child.remove();
    }, 200);
  }

  function bringInfo(message) {
    infoBox.show().html(message);
  }

  function removeInfo() {
    infoBox.hide();
  }

  function increasePick2() {
    shouldPick += 2;
    noctp.html(shouldPick);
  }
  function resetPick2() {
    shouldPick = 0;
    noctp.html('');
  }

  //THIS IS THE MARKET ANIMATION FUNCTION
  function marketAnimate() {
    let cardPicked = fullDeck.pop(); //picking the last card. backend
    hand.push(cardPicked); //adding it to hand. backend.
    let cardPickedRepl = '#' + cardPicked.replace(/ /g, '\\ '); //getting the id
    targetForMarket
      .show()
      .appendTo(playerCardsSlot)
      .css('width', getMarketWidth()); //setting targetForMarket
    let width = 0.25 * parseFloat(getMarketWidth()) + 'px'; //width of the card at first
    let height = 0.25 * parseFloat(getMarketHeight()) + 'px'; //height as well
    let sample = $('<div></div>'); //this is the element that will provide the initial top and left of the card picked.
    sample.css({
      //the sample should also have the same dimensions as the card so the co-ordinates will be correct.
      height: height,
      width: width,
    });
    sample.appendTo(market); //add it to market
    let preLeft = sample.offset().left + 'px'; //now get it's top
    let preTop = sample.offset().top + 'px'; //and left
    sample.remove(); //remove it.
    let offset = targetForMarket.offset(); //same for targetForMarket
    let toP = offset.top + 'px';
    let left = offset.left + 'px';
    $(cardPickedRepl)
      .show()
      .appendTo(market)
      .css({
        //set the initial dimensions and co-ordinates
        'width': width,
        'height': height,
        'position': 'absolute',
        'left': preLeft,
        'top': preTop,
      })
      .animate(
        {
          //animate it to the co-ordinates gotten form targetForMarket and using the general dimensions for cards
          'height': getMarketHeight(),
          'width': getMarketWidth(),
          'left': left,
          'top': toP,
        },
        100,
        () => {
          setTimeout(function () {
            //after some time, long after the animation
            targetForMarket.hide();
            $(cardPickedRepl)
              .css('position', 'static')
              .appendTo(playerCardsSlot)
              .addClass('aPlayerCard')
              .show();
            //the reason you said .show again is because some cards might be hidden after some time due to a later function
          }, 450);
        }
      );
  }

  //THIS IS THE HUMAN PLAYING ACTION
  function humanDropCard(card) {
    removeItem(hand, card); //remove from hand. Backend
    playedCards.push(card); //add to playedCards. Backend
    let cardRepl = '#' + card.replace(/ /g, '\\ '); //get the id
    let offset = $('#playedCardsSlot').offset(); //get the co-ordinates of the playedCardsSlot. That's where it'll land
    let preOffset = $(cardRepl).offset(); //get the co-ordinates of the cardBeingPlayed. That's where it'll take-off.
    let to_p = offset.top;
    let preTop = preOffset.top;
    let left = offset.left;
    let preLeft = preOffset.left;
    let topStr = to_p.toString() + 'px';
    let preTopStr = preTop.toString() + 'px';
    let leftStr = left.toString() + 'px';
    let preLeftStr = preLeft.toString() + 'px';
    $(cardRepl)
      .wrap('<div id="wrap"></div>')
      .css({
        //wrap a div around the card to be played.
        'position': 'absolute', //make it absolute but within it's wrapper.
        'display': 'flex',
        'z-index': zIndex,
        'left': preLeftStr, //set the same co-ordinates it had before so it will start from that same position
        'top': preTopStr,
      })
      .animate(
        {
          'top': topStr,
          'left': leftStr,
        },
        100,
        () => {
          setTimeout(function () {
            $(cardRepl)
              .unwrap()
              .addClass('aPlayedCard')
              .appendTo(playedCardsSlot)
              .removeClass('aPlayerCard')
              .css({
                'left': '0px',
                'top': '0px',
              });
          }, 450);
        }
      );
    /*setTimeout(function(){
            $(cardRepl).unwrap().addClass('aPlayedCard').appendTo(playedCardsSlot).removeClass('aPlayerCard').css({
                'left':'0px',
                'top':'0px',
            })
        }, 570);*/
    zIndex++;
  }

  //THIS IS THE CPU PLAYING ACTION
  function cpu_dropCard(card) {
    removeItem(cpuHand, card);
    playedCards.push(card);
    let cardRepl = '#' + card.replace(/ /g, '\\ ');
    let left_1 = playedCardsSlot.offset().left - $('#cpuCardNum').offset().left;
    let finalLeft = left_1 + 'px';
    $(cardRepl)
      .show()
      .prependTo($('#cpuCardNum'))
      .css({
        'height': '100%',
        'width': '67%',
        'display': 'flex',
        'position': 'absolute',
        'z-index': zIndex,
        'left': '16.5%',
        'top': '0px',
      })
      .animate(
        {
          'left': finalLeft,
          'top': '0px',
          'height': getMarketHeight(),
          'width': getMarketWidth(),
        },
        100,
        () => {
          setTimeout(function () {
            $(cardRepl).addClass('aPlayedCard').appendTo(playedCardsSlot).css({
              'left': '0px',
              'top': '0px',
            });
          }, 450);
        }
      );
    zIndex++;
    cpuCardNum.html(cpuHand.length);
  }

  //THIS IS CPU RESPONDING TO PICK 2
  function cpuAnswerPick2() {
    let apList = []; //list of 2's
    for (let x = 0; x < cpuHand.length; x++) {
      let splitCard = cpuHand[x].split(' ');
      if (splitCard[0] === '2') {
        apList.push(cpuHand[x]);
      }
    }
    if (apList.length === 0) {
      //if there's no 2 to play,
      whoseTurn = 'human';
      for (let x = 1; x <= shouldPick; x++) {
        //loop using shouldPick
        let cardPicked = fullDeck.pop(); //store that same card picked
        cpuHand.push(cardPicked); //add it to cpuHand
        if (fullDeck.length === 0) {
          //if the picking has not finished and market has finished,
          let leftToPick = shouldPick - x; //get the number of cards left to pick
          if (toDo === 'check-up only') {
            //if toDo is that,
            if (leftToPick === 0) {
              refill();
            } else {
              pickRemain('cpu', leftToPick, shouldPick);
            }
          } else {
            //just tell how many cpu picked
            bringInfo('CPU picked ' + x);
          }
          break; //stop the loop. This will prevent cpu from picking undefined.
        } else {
          //if market has not finished,
          bringInfo('CPU picked ' + x);
        }
      }
      resetPick2();
      cpuCardNum.html(cpuHand.length);
      marketCardNum.html(fullDeck.length);
      checkFinish('market');
    } else {
      //if cpu has 2 to play,
      let cardPlayed = pickRandom(apList);
      cpu_dropCard(cardPlayed);
      increasePick2();
      bringInfo('CPU played ' + cardPlayed + ' pick ' + shouldPick);
    }
  }

  //THIS IS THE HUMAN ANSWERING PICK TWO
  function hAnswerPick2(card) {
    let cardRepl = '#' + card.replace(/ /g, '\\ ');
    let cardSplit = card.split(' ');
    if (cardSplit[0] === '2') {
      //if human plays 2,
      humanDropCard(card);
      increasePick2();
      cpuTurn = setTimeout(cpuPlay, 1000);
      removeInfo();
    } else {
      //if he doesn't play 2,
      invalidCard($(cardRepl));
    }
  }

  //THIS CONTROLS WHAT HAPPENS WHEN CPU PLAYS I NEED.
  function cpuPlayIneed(iNeedPlayed) {
    let shapes = []; //all shapes
    let shapesFr = $('.shape'); //fr means front end.
    for (let x = 0; x < shapesFr.length; x++) {
      let idName = $(shapesFr[x]).attr('id');
      shapes.push(idName);
    }
    let apShapes = []; //shapes cpu has
    for (let x = 0; x < cpuHand.length; x++) {
      let currentSplit = cpuHand[x].split(' ');
      if (currentSplit[1] === '20') {
        continue;
      } else {
        apShapes.push(currentSplit[1]);
      }
    }
    let theChoice;
    if (apShapes.length === 0) {
      theChoice = pickRandom(shapes);
    } else {
      theChoice = pickRandom(apShapes);
    }
    iNeed = theChoice;
    bringInfo('CPU needs ' + iNeed);
    let imgSrc = 'pics/' + theChoice + '.png';
    shapeNeed.show('slide', { direction: 'left' }, 100);
    shapeImg.attr('src', imgSrc);
    cpu_dropCard(iNeedPlayed);
  }

  //THIS IS THE CPU RESPONDING TO I NEED
  function cpuAnsrIneed() {
    let apList = [];
    for (let x = 0; x < cpuHand.length; x++) {
      let currentSplit = cpuHand[x].split(' ');
      if (currentSplit[1] === iNeed || currentSplit[1] === '20') {
        apList.push(cpuHand[x]);
      } else {
        continue;
      }
    }
    if (apList.length === 0) {
      cpuGoMarket();
    } else {
      let cardPlayed = pickRandom(apList);
      if (cardPlayed.includes('whot')) {
        cpuPlayIneed(cardPlayed);
      } else {
        let cardPlayedSplit = cardPlayed.split(' ');
        if (cardPlayedSplit[0] === '2') {
          increasePick2();
          bringInfo('CPU played ' + cardPlayed + ' pick ' + shouldPick);
          cpu_dropCard(cardPlayed);
        } else if (cardPlayedSplit[0] === '14') {
          goGen = true;
          bringInfo('CPU played ' + cardPlayed + '. Go to market');
          cpu_dropCard(cardPlayed);
        } else if (cardPlayedSplit[0] === '8') {
          cpuPlays8(cardPlayed);
        } else {
          bringInfo('CPU played ' + cardPlayed);
          cpu_dropCard(cardPlayed);
          checkFinish('cpu');
        }
        shapeNeed.hide('slide', { direction: 'left' }, 100);
        iNeed = '';
      }
    }
  }

  //THIS IS CPU PLAYING EIGHT.
  function cpuPlays8(cardPlayed) {
    off();
    cpu_dropCard(cardPlayed);
    bringInfo('CPU played ' + cardPlayed + '. Hold On');
    setTimeout(cpuPlay, 1000);
  }

  //THIS IS THE HUMAN CHOOSING A SHAPE.
  function choosing() {
    let chosenShape = $(this).attr('id');
    iNeed = chosenShape;
    let imgSrc = 'pics/' + iNeed + '.png';
    shapeNeed.show('slide', { direction: 'left' }, 100);
    shapeImg.attr('src', imgSrc);
    $('#suitsBox').hide('explode', 1000);
    cpuTurn = setTimeout(cpuPlay, 1000);
  }

  //THIS IS THE HUMAN PLAYING I NEED.
  function hPlaysIneed(iNeedPlayed) {
    $('#suitsBox').show('bounce', 1000);
    humanDropCard(iNeedPlayed);
  }

  //THIS IS THE HUMAN RESPONDING TO DIFFERENT TYPES OF CARDS
  function hPlaysCard(firstPart, cardPlayed) {
    if (firstPart === '14') {
      humanDropCard(cardPlayed);
      goGen = true;
      cpuTurn = setTimeout(cpuPlay, 1000);
      removeInfo();
    } else if (firstPart === '2') {
      humanDropCard(cardPlayed);
      increasePick2();
      cpuTurn = setTimeout(cpuPlay, 1000);
      removeInfo();
    } else if (firstPart === '8') {
      humanDropCard(cardPlayed);
      bringInfo('Play Again');
      on();
    } else if (firstPart.includes('whot')) {
      hPlaysIneed(cardPlayed);
    } else {
      humanDropCard(cardPlayed);
      removeInfo();
      cpuTurn = setTimeout(cpuPlay, 1000);
      checkFinish('human');
    }
  }

  //THIS IS TO TURN ON AND OFF THE EVENT LISTENERS TO PREVENT ERRORS.
  let onOrOff = true; //this serves as a red flag to prevent recurring functions.
  function off() {
    //same as on
    if (onOrOff) {
      $(document).off('click', '.aPlayerCard', humanPlay);
      market.off('click', marketFunc);
      onOrOff = false;
    }
  }
  function on() {
    if (!onOrOff) {
      //if the variable is false ie it is off,
      $(document).on('click', '.aPlayerCard', humanPlay); //it will turn on
      market.on('click', marketFunc);
      onOrOff = true; //and make it true
    }
  }

  //THIS IS THE MAIN MARKET FUNCTION
  function marketFunc() {
    off(); //prevent human from playing twice.
    whoseTurn = 'cpu'; //this is for a later function
    if (shouldPick) {
      //if he is to pick 2 and above,
      let x = 1; //this is for set interval function
      let picking = setInterval(function () {
        let leftToPick = shouldPick - x; //just like in cpu's own
        x++; //increase x for the next round
        marketAnimate(); //carry card from market. Backend and frontend
        marketCardNum.html(fullDeck.length);
        if (x > shouldPick) {
          //if he has picked the right amount,
          console.log('if ran and x is ' + x);
          clearInterval(picking); //stop the picking
          resetPick2();
          cpuTurn = setTimeout(cpuPlay, 1000);
        }
        if (fullDeck.length === 0) {
          //if the market is finished,
          clearTimeout(cpuTurn); //
          clearInterval(picking);
          if (toDo === 'count points') {
            off();
            marketFinish();
          } else if (toDo === 'check-up only') {
            if (leftToPick === 0) {
              refill();
            } else {
              pickRemain('human', leftToPick, shouldPick);
            }
          }
          resetPick2();
        }
      }, 600 / shouldPick);
    } else {
      marketAnimate();
      if (goGen === true) {
        goGen = false;
      }
      cpuTurn = setTimeout(cpuPlay, 1000);
      checkFinish('market');
      marketCardNum.html(fullDeck.length);
    }
    removeInfo();
  }

  //THIS IS CPU GOING TO MARKET
  function cpuGoMarket() {
    let newCard = fullDeck.pop();
    cpuHand.push(newCard);
    bringInfo('CPU went to market');
    cpuCardNum.html(cpuHand.length);
    marketCardNum.html(fullDeck.length);
    checkFinish('market');
    whoseTurn = 'human';
  }

  //THIS IS WHAT HAPPENS WHEN THE HUMAN'S  OR CPU'S CARDS FINISH
  function winner(whoWon) {
    $('.cardNum').fadeOut();
    $('.parents').fadeOut();
    $('.absolutes').fadeOut();
    $('#winningPage').fadeIn();
    if (whoWon === 'human') {
      $('#winningPage')
        .html('CHECK-UP. YOU WON! CONGRATULATIONS')
        .css('color', 'blue');
    } else if (whoWon === 'cpu') {
      $('#winningPage')
        .html('CHECK-UP. YOU LOST! TRY NEXT TIME')
        .css('color', 'red');
    } else {
      alert('incorrect argument passed');
    }
  }

  //THIS IS IF PLAYER WANTS TO COUNT POINTS.
  function countPoints() {
    $(window).off('resize', resize); //if you don't off the resizing, when you resize, the cards will vanish.
    let height = getMarketHeight();
    let width = getMarketWidth();
    $('.cardNum').fadeOut();
    $('.parents').fadeOut(); //this hides market so getting the dimensions will return zero.
    $('.absolutes').fadeOut();
    $('#winningPage2')
      .fadeIn()
      .css({ 'height': 'fit-content', 'display': 'block', 'font-size': '4em' });
    let cardPointH = 0;
    for (let i = 0; i < hand.length; i++) {
      let cardRepl = '#' + hand[i].replace(/ /g, '\\ ');
      $(cardRepl)
        .appendTo($('#slot_for_cards:nth-of-type(1)'))
        .removeClass('aPlayerCard')
        .css({
          'height': height,
          'width': width,
          'display': 'flex',
        });
      let currentSplit = hand[i].split(' ');
      if (currentSplit[0].includes('whot')) {
        cardPointH += 20;
      } else {
        cardPointH += parseInt(currentSplit[0]);
      }
    }
    let cardPointCPU = 0;
    for (let i = 0; i < cpuHand.length; i++) {
      let cardRepl = '#' + cpuHand[i].replace(/ /g, '\\ ');
      $(cardRepl).appendTo($('#slot_for_cards:nth-of-type(2)')).css({
        'height': height,
        'width': width,
        'display': 'flex',
      });
      let currentSplit = cpuHand[i].split(' ');
      if (currentSplit[0].includes('whot')) {
        cardPointCPU += 20;
      } else {
        cardPointCPU += parseInt(currentSplit[0]);
      }
    }
    let humanPoints = $('#winningPage2 p:nth-of-type(3)');
    let cpuPoints = $('#winningPage2 p:nth-of-type(4)');
    humanPoints.html('YOU GOT ' + cardPointH).css('text-align', 'justify');
    cpuPoints.html('CPU GOT ' + cardPointCPU).css('text-align', 'justify');
    let finalRemark = $('#winningPage2 p:last-of-type');
    if (cardPointCPU > cardPointH) {
      finalRemark.html('YOU WIN! CONGRATULATIONS').css('color', 'blue');
    } else if (cardPointCPU < cardPointH) {
      finalRemark.html('CPU WINS. TRY NEXT TIME').css('color', 'red');
    } else {
      finalRemark('IT WAS A TIE');
    }
  }

  let whoseTurn;
  //THIS WILL SWAP PLAYEDCARDS WITH FULLDECK LEAVING THE LAST CARD VISIBLE.
  function refill() {
    //this is the back end part of it.
    for (let i = 0; i < playedCards.length - 1; i++) {
      fullDeck.push(playedCards[i]);
      $('#' + playedCards[i].replace(/ /g, '\\ ')).removeClass('aPlayedCard');
    }
    //this is now the frontend part of it.
    let left_1 = market.offset().left - playedCardsSlot.offset().left + 'px';
    let i = 0;
    let removed = [];
    let reArrangement = setInterval(function () {
      let currentCardRepl = '#' + playedCards[i].replace(/ /g, '\\ ');
      removed.push($(currentCardRepl));
      $(currentCardRepl).css('z-index', '-1').animate(
        {
          //z-index should be -1 so it goes under market
          'left': left_1,
        },
        50
      );
      if (i === playedCards.length - 2) {
        //when the cards are finished,
        clearInterval(reArrangement);
        removed.forEach(element => element.css('z-index', '0').hide());
        playedCards = [playedCards[playedCards.length - 1]]; //reset playedCards list with the last played card
        $('#' + playedCards[playedCards.length - 1].replace(/ /g, '\\ ')).css(
          'z-index',
          '0'
        ); //reset it's z-index.
        if (whoseTurn === 'cpu') {
          cpuTurn = setTimeout(cpuPlay, 1000);
        } else {
          on();
        }
      } else {
        i++;
      }
    }, 100);
    zIndex = 1; //make z-index 1 so it'll start again
    shuffle(fullDeck); //shuffle fullDeck
    marketCardNum.html(fullDeck.length);
  }

  //THIS FUNCTION IS WHAT HAPPENS WHEN MARKET FINISHES IN THE MIDDLE OF PICKING TWO.
  function pickRemain(whoseTurn, leftToPick, shouldPick) {
    //here, the whoseTurn is the one that is meant to continue picking.
    off();
    //just like refill
    for (let i = 0; i < playedCards.length - 1; i++) {
      fullDeck.push(playedCards[i]);
      $('#' + playedCards[i].replace(/ /g, '\\ ')).removeClass('aPlayedCard');
    }
    let left_1 = market.offset().left - playedCardsSlot.offset().left + 'px';
    let i = 0;
    let removed = [];
    let reArrangement = setInterval(function () {
      let currentCardRepl = '#' + playedCards[i].replace(/ /g, '\\ ');
      removed.push($(currentCardRepl));
      $(currentCardRepl).css('z-index', '-1').animate(
        {
          'left': left_1,
        },
        50
      );
      if (i === playedCards.length - 2) {
        clearInterval(reArrangement);
        removed.forEach(element => element.css('z-index', '0').hide());
        playedCards = [playedCards[playedCards.length - 1]];
        $('#' + playedCards[playedCards.length - 1].replace(/ /g, '\\ ')).css(
          'z-index',
          '0'
        );
        zIndex = 1;
        shuffle(fullDeck);
        if (whoseTurn === 'cpu') {
          //just like cpuAnsrPick2 but with leftToPick
          for (x = 1; x <= leftToPick; x++) {
            let newCard = fullDeck.pop();
            cpuHand.push(newCard);
            bringInfo('CPU picked ' + shouldPick);
            cpuCardNum.html(cpuHand.length);
            marketCardNum.html(fullDeck.length);
            on();
          }
        } else if (whoseTurn === 'human') {
          //same for human
          let x = 1;
          let picking = setInterval(function () {
            console.log('if ran and x is ' + x);
            x++;
            marketAnimate();
            marketCardNum.html(fullDeck.length);
            if (x > leftToPick) {
              clearInterval(picking);
              resetPick2();
              marketCardNum.html(fullDeck.length);
              cpuTurn = setTimeout(cpuPlay, 1000);
            }
          }, 600 / leftToPick);
        }
      } else {
        i++;
      }
    }, 100);
  }

  //THIS IS WHAT HAPPENS WHEN MARKET FINISHES
  function marketFinish() {
    if (toDo === 'count points') {
      setTimeout(countPoints, 1000);
    } else if (toDo === 'check-up only') {
      setTimeout(refill, 500);
    }
  }

  function checkFinish(checkWhat) {
    if (checkWhat === 'market') {
      if (fullDeck.length === 0) {
        clearTimeout(cpuTurn);
        marketFinish();
        off();
      }
    } else if (checkWhat === 'human') {
      if (hand.length === 0) {
        off();
        clearTimeout(cpuTurn);
        setTimeout(function () {
          winner('human');
        }, 1000);
      }
    } else if (checkWhat === 'cpu') {
      if (cpuHand.length === 0) {
        off();
        clearTimeout(cpuTurn);
        setTimeout(function () {
          winner('cpu');
        }, 1000);
      }
    }
  }

  //THIS IS CPU'S TURN
  function cpuPlay() {
    on();
    let apList = [];
    let lastPlayedCard = playedCards[playedCards.length - 1];
    let thatSplit = lastPlayedCard.split(' ');
    for (let x = 0; x < cpuHand.length; x++) {
      let splitCard = cpuHand[x].split(' ');
      if (
        thatSplit[0] === splitCard[0] ||
        thatSplit[1] === splitCard[1] ||
        splitCard[0].includes('whot')
      ) {
        apList.push(cpuHand[x]);
      }
    }
    if (shouldPick) {
      cpuAnswerPick2();
    } else if (goGen) {
      cpuGoMarket();
      goGen = false;
    } else if (iNeed) {
      cpuAnsrIneed();
    } else {
      if (apList.length === 0) {
        //if cpu has no card to play,
        cpuGoMarket();
      } else {
        //if cpu has a card to play,
        let cardPlayed = pickRandom(apList);
        let cardPlayedSplit = cardPlayed.split(' ');
        if (cardPlayedSplit[0] === '2') {
          increasePick2();
          bringInfo('CPU played ' + cardPlayed + ' pick ' + shouldPick);
          cpu_dropCard(cardPlayed);
        } else if (cardPlayedSplit[0] === '14') {
          goGen = true;
          bringInfo('CPU played ' + cardPlayed + '. Go to market');
          cpu_dropCard(cardPlayed);
        } else if (cardPlayedSplit[0] === '8') {
          cpuPlays8(cardPlayed);
        } else if (cardPlayedSplit[0].includes('whot')) {
          cpuPlayIneed(cardPlayed);
        } else {
          bringInfo('CPU played ' + cardPlayed);
          cpu_dropCard(cardPlayed);
          checkFinish('cpu');
        }
      }
    }
    console.log(cpuHand);
  }

  //THIS IS THE HUMAN'S TURN
  function humanPlay() {
    off();
    let cardPlayed = $(this).attr('id');
    let thisSplit = cardPlayed.split(' ');
    let lastPlayedCard = playedCards[playedCards.length - 1];
    let thatSplit = lastPlayedCard.split(' ');
    if (
      thisSplit[0] === thatSplit[0] ||
      thisSplit[1] === thatSplit[1] ||
      thisSplit[0].includes('whot')
    ) {
      if (shouldPick) {
        hAnswerPick2(cardPlayed);
      } else if (goGen) {
        invalidCard($(this));
      } else {
        hPlaysCard(thisSplit[0], cardPlayed);
      }
    } else if (iNeed) {
      if (thisSplit[1] === iNeed) {
        iNeed = '';
        shapeNeed.hide('slide', { direction: 'left' }, 100);
        hPlaysCard(thisSplit[0], cardPlayed);
      } else {
        invalidCard($(this));
      }
    } else {
      invalidCard($(this));
    }
  }

  //THIS IS FOR THE QUESTION IN THE BEGINNING
  function quest() {
    $('#forBtns button').off('click', quest);
    let btn = $(this);
    btn.css('scale', '0.9');
    setTimeout(function () {
      btn.css('scale', '1.0');
    }, 200);
    toDo = btn.data('todo');
    setTimeout(function () {
      $('#questSlot p').html('Are you sure?');
      $('#forBtns button:nth-of-type(1)').html('Yes').data('todo', 'yes');
      $('#forBtns button:nth-of-type(2)').html('No').data('todo', 'no');
      $('#forBtns button').on('click', verify);
    }, 400);
  }

  //THIS IS FOR THE YES OR NO
  function verify() {
    $('#forBtns button').off('click', verify);
    let btn = $(this);
    btn.css('scale', '0.9');
    setTimeout(function () {
      btn.css('scale', '1.0');
    }, 200);
    if (btn.data('todo') === 'yes') {
      setTimeout(function () {
        $('#questionPage').hide();
        $('body').css('overflow', 'visible');
      }, 400);
    } else if (btn.data('todo') === 'no') {
      setTimeout(function () {
        $('#questSlot p').html('How do you want the game to end?');
        $('#forBtns button:nth-of-type(1)')
          .html('End with Check-up only')
          .data('todo', 'check-up only');
        $('#forBtns button:nth-of-type(2)')
          .html('Count Points if market Finish')
          .data('todo', 'count points');
        $('#forBtns button').on('click', quest);
      }, 400);
    }
  }

  shuffle(fullDeck);
  deal();
  start();

  //THIS FUNCTION IS FOR THE SLANTING STUFF IN THE QUESTION.
  //IT POSITIONS IT EXACTLY AS IT IS.
  function setSlant() {
    let offset = $('#questSlot').offset();
    let left = offset.left;
    let width = $('#questSlot').width();
    let containerWidth = $('#container').width();
    let finalRight = left + width - containerWidth;
    let finalTop = offset.top;
    $('#container').offset({
      left: finalRight,
      top: finalTop,
    });
  }
  setSlant(); //calling it here gives it the form when the page is loaded

  //THIS FUNCTION SETS THE INITIAL DIMENSIONS FOR THESE ELEMENTS
  function setInitial() {
    market.css('height', getMarketHeight()); //market height
    $('.theCard').css({
      //height and width for all the cards.
      'height': getMarketHeight(),
      'width': getMarketWidth(),
    });
    $('#topPart').height(parseFloat(getMarketHeight())); //topPart
    playedCardsSlot
      .height(parseFloat(getMarketHeight()))
      .width(parseFloat(getMarketWidth())); //playedCardsSlot
    shapeNeed.css('top', () => {
      return $(window).width() <= 610
        ? $('#cpuCardNum').offset().top + 'px'
        : playerCardsSlot.offset().top - 60 + 'px';
    });
    marketCardNum.css({
      'top': parseFloat(getMarketHeight()) / 2 + 'px',
      'left':
        bodyWidth() -
        parseFloat(getMarketWidth()) -
        marketCardNum.width() +
        'px',
    });
  }
  setInitial(); //just like the setSlant()

  function resize() {
    //do the setInitial function every time the page resizes.
    setInitial(); //calling it here rearranges it for responsiveness.
    setSlant(); //same as above
  }

  $(window).on('resize', resize);
  $(document).on('click', '.aPlayerCard', humanPlay);
  market.on('click', marketFunc);
  $('.shape').click(choosing);
  $('#forBtns button').on('click', quest);

  //cpuCardNum top is 9.333333969116211
  //infoBox is 59.875
  //difference is 50.5416660309
  //console.log(cpuCardNum.offset().top);
});
