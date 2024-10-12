const startBlackJackButton = document.getElementById("start-blackjack")
const blackJackDiv = document.getElementById("black-jack")
const dealerCardsDiv = document.getElementById("host-cards")
const playerCardsDiv = document.getElementById("player-cards")
const informationDiv = document.getElementById("information")
const buttonsDiv = document.getElementById("buttons")

const cardsToDrawPerHand = 2;
let deckId; 
const players = 1
let playerCardsValue = []
let dealerCardsValue = []
let hiddenDealerCardURL;
let dealerTotalValue;
let playerTotalValue;
let hidden = true; 


startBlackJackButton.addEventListener("click", StartBlackJack)

function StartBlackJack(){
    hidden = true; 
    playerCardsValue = [];
    dealerCardsValue = [];

    buttonsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";
    playerCardsDiv.innerHTML = "";
    informationDiv.innerHTML = "";
    
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
            if(playerCardsValue[i] === 11){
                playerCardsValue[i] === 1
                playerTotalValue = playerCardsValue.reduce(TotalValue, 0);
            }             
        }
    }
    if(dealerTotalValue > 21){
        for (let i = 0; i < dealerCardsValue.length; i++) {
            if(dealerCardsValue[i] === 11){
                dealerCardsValue[i] === 1
                dealerTotalValue = dealerCardsValue.reduce(TotalValue, 0);
            }             
        }
    }

    informationDiv.innerHTML = "";
    pHost = document.createElement("p");
    pPlayer = document.createElement("p");
    informationDiv.appendChild(pHost)
    informationDiv.appendChild(pPlayer)


    if(hidden){
        pHost.innerHTML =  "Dealer hand: " + dealerCardsValue[1];
    }else{
        pHost.innerHTML =  "Dealer hand: " + dealerTotalValue;
    }

    pPlayer.innerHTML =  "Your hand: " + playerTotalValue;
    

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
    WriteValue()
    setTimeout(DealerMove, 1000)
}

function DealerMove(){
    console.log(dealerTotalValue)
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
    console.log(playerTotalValue + " playerTotalValue")
    console.log(dealerTotalValue + " dealerTotalValue")
    if (playerTotalValue > 21 && dealerTotalValue > 21) {
        alert("Both busted! It's a tie!");
    } else if (dealerTotalValue > 21) {
        alert("Dealer busted! You win!");
    } else if (playerTotalValue > 21) {
        alert("You busted! Dealer wins!");
    } else if (dealerTotalValue > playerTotalValue && dealerTotalValue <= 21) {
        alert("Dealer won");
    } else if (playerTotalValue > dealerTotalValue && playerTotalValue <= 21) {
        alert("You won");
    } else if (dealerTotalValue === playerTotalValue) {
        alert("It's a tie");
    } else {
        alert("Unexpected result");
    }
}