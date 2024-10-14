const startBlackJackButton = document.getElementById("start-blackjack")
const blackJackDiv = document.getElementById("black-jack")
const dealerCardsDiv = document.getElementById("host-cards")
const playerCardsDiv = document.getElementById("player-cards")
const dealerInformationDiv = document.getElementById("dealer-information")
const playerInformationDiv = document.getElementById("player-information")
const informationDiv = document.getElementById("information")
const buttonsDiv = document.getElementById("buttons")
const statusP = document.getElementById("status")
const winToLossH5 = document.getElementById("win-loss") 

const cardsToDrawPerHand = 2;
let deckId; 
const players = 1
let playerCardsValue = []
let dealerCardsValue = []
let hiddenDealerCardURL;
let dealerTotalValue;
let playerTotalValue;
let hidden; 
let busted;
let winToLoss = [0, 0];


startBlackJackButton.addEventListener("click", StartBlackJack)

function StartBlackJack(){

    winToLossH5.innerHTML = winToLoss[0] + "-" + winToLoss[1]

    busted = false;
    hidden = true; 
    playerCardsValue = [];
    dealerCardsValue = [];

    buttonsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";
    playerCardsDiv.innerHTML = "";
    dealerInformationDiv.innerHTML = "";
    playerInformationDiv.innerHTML = "";
    statusP.innerHTML = ""
    statusP.className = ""
    
    startBlackJackButton.innerHTML = "Start new BlackJack game"
    hitButton = document.createElement("button")
    standButton = document.createElement("button")
    buttonsDiv.appendChild(hitButton)
    buttonsDiv.appendChild(standButton)
    hitButton.setAttribute("id", "hit")
    standButton.setAttribute("id", "stand")
    hitButton.addEventListener("click", Hit)
    standButton.addEventListener("click", Stand)
    hitButton.innerHTML = "Hit"
    standButton.innerHTML = "Stand"


    fetch("https://www.deckofcardsapi.com/api/deck/zpwz1562odvn/shuffle/?deck_count=6")
    .then(function(res){ return res.json()})
    .then(function(res){  //player hand
        deckId = res.deck_id;
        return DrawCards(cardsToDrawPerHand, deckId, 1, false)
    })
    .then(function(res){ //host hand
        return DrawCards(cardsToDrawPerHand, deckId, players)
    })
    .catch(function(error){
        console.log("error: " + error)
    })
}


function DrawCards(amountOfCards, decksId, players, isPlayer = true){
    return fetch("https://www.deckofcardsapi.com/api/deck/" + decksId + "/draw/?count=" + amountOfCards * players)
    .then(function(res){ return res.json() })
    .then(function(res){ 

        for (let i = 0; i < amountOfCards * players; i++) {
            if(res.cards[i].value === "JACK" || res.cards[i].value === "QUEEN" || res.cards[i].value === "KING"){
                res.cards[i].value = "10";
            }
            if(res.cards[i].value === "ACE"){
                res.cards[i].value = "11"
            }

            if(isPlayer){
                const img = document.createElement("img")
                playerCardsDiv.appendChild(img)
                img.src = res.cards[i].image;
                playerCardsValue.push(res.cards[i].value)
            }
            else if(i === 0 && hidden){
                const img = document.createElement("img")
                dealerCardsDiv.appendChild(img)
                img.src = "https://www.deckofcardsapi.com/static/img/back.png";
                img.setAttribute("id", "hidden-card")
                dealerCardsValue.push(res.cards[i].value);
                hiddenDealerCardURL = res.cards[i].image;
            }
            else{
                const img = document.createElement("img")
                dealerCardsDiv.appendChild(img)
                img.src = res.cards[i].image;
                dealerCardsValue.push(res.cards[i].value)
            }
        }
    })
    .then(function(res){
        WriteValue();
    })
}

function WriteValue(){

    playerTotalValue = playerCardsValue.reduce(TotalValue, 0);
    dealerTotalValue = dealerCardsValue.reduce(TotalValue, 0);

    if(playerTotalValue > 21){
        for (let i = 0; i < playerCardsValue.length; i++) {
            if(playerCardsValue[i] == 11){
                playerCardsValue[i] = 1
                playerTotalValue = playerCardsValue.reduce(TotalValue, 0);
                i = playerCardsValue.length
            }
        }
    }
    if(dealerTotalValue > 21){
        for (let i = 0; i < dealerCardsValue.length; i++) {
            if(dealerCardsValue[i] == 11){
                dealerCardsValue[i] = 1
                dealerTotalValue = dealerCardsValue.reduce(TotalValue, 0);
                i = playerCardsValue.length
            }             
        }
    }



    dealerInformationDiv.innerHTML = "";
    playerInformationDiv.innerHTML = "";
    pDealer = document.createElement("p");
    pPlayer = document.createElement("p");
    dealerInformationDiv.appendChild(pDealer)
    playerInformationDiv.appendChild(pPlayer)


    if(hidden){
        pDealer.innerHTML =  "Dealer hand: " + dealerCardsValue[1];
    }else{
        pDealer.innerHTML =  "Dealer hand: " + dealerTotalValue;
    }

    pPlayer.innerHTML =  "Your hand: " + playerTotalValue;

    if(playerTotalValue > 21 && !busted){
        busted = true; 
        Stand();
    }
}

function TotalValue(previous, currentValue) {
    return previous + Number(currentValue);
}


function Hit(){
    DrawCards(1, "zpwz1562odvn", players)
}


function Stand(){
    hidden = false;
    hiddenCard = document.getElementById("hidden-card")
    hiddenCard.src = hiddenDealerCardURL;
    document.getElementById("hit").disabled = true;
    document.getElementById("stand").disabled = true;
    WriteValue()
    setTimeout(DealerMove, 1000)
}

function DealerMove(){
    if(dealerTotalValue < 17){
        DrawCards(1, "zpwz1562odvn", players, false).then(function(){
            dealerTotalValue = dealerCardsValue.reduce(TotalValue, 0);
            setTimeout(DealerMove, 1000);
        })
    }else{
        WinnerCheck()
    }   
}

function WinnerCheck(){
    if (playerTotalValue > 21 && dealerTotalValue > 21) {
        statusP.innerHTML = "Both busted! It's a tie!";
        statusP.classList.add("blue")
    } else if (dealerTotalValue > 21) {
        statusP.innerHTML ="Dealer busted! You win!";
        statusP.classList.add("green")
        winToLoss[0] += 1
    } else if (playerTotalValue > 21) {
        statusP.innerHTML ="You busted! Dealer wins!";
        statusP.classList.add("red")
        winToLoss[1] += 1
    } else if (dealerTotalValue > playerTotalValue && dealerTotalValue <= 21) {
        statusP.innerHTML ="Dealer won";
        statusP.classList.add("red")
        winToLoss[1] += 1
    } else if (playerTotalValue > dealerTotalValue && playerTotalValue <= 21) {
        statusP.innerHTML ="You won";
        statusP.classList.add("green")
        winToLoss[0] += 1
    } else if (dealerTotalValue === playerTotalValue) {
        statusP.innerHTML ="It's a tie";
        statusP.classList.add("blue")
    } else {
        statusP.innerHTML ="Unexpected result";
    }
}