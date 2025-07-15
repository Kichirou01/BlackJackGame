const minDeck = (() => {
  const suits = ["♠","♥","♦","♣"];
  const cards = [];
  suits.forEach(s=> {
    for(let v=2; v<=10; v++) cards.push({value:v,disp:v+s});
    ["J","Q","K"].forEach(f=> cards.push({value:10,disp:f+s}));
    cards.push({value:11,disp:`A${s}`});
  });
  return cards;
})();

let deck, playerHand, dealerHand, balance=1000;
const el = id => document.getElementById(id);

const updateBalance = () => el("balance").textContent = `Balance: $${balance.toFixed(2)}`;

function shuffleDeck(){
  deck = [...minDeck];
  for(let i=deck.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]]=[deck[j],deck[i]];
  }
}

function drawCard(hand, elem){
  const c = deck.pop();
  hand.push(c);
  const sp = document.createElement("span");
  sp.textContent = c.disp + " ";
  elem.appendChild(sp);
}

function calcScore(hand){
  let sum = hand.reduce((a,c)=>a+c.value,0);
  let aces = hand.filter(c=>c.value===11).length;
  while(sum >21 && aces){
    sum-=10; aces--;
  }
  return sum;
}

function resetTable(){
  el("game").style.display="none";
  el("player-hand").innerHTML = "";
  el("dealer-hand").innerHTML = "";
  el("player-score").textContent = "";
  el("dealer-score").textContent = "";
  el("result").textContent = "";
}

function startRound(){
  resetTable();
  shuffleDeck();
  playerHand=[]; dealerHand=[];
  const bp = +el("bet-pair").value;
  const ba = +el("bet-aces").value;
  const mainBet = 10; // fixed main bet
  let winnings = 0;

  // Deduct total bet
  const totalBet = mainBet + bp + ba;
  if(balance < totalBet) { alert("Not enough balance."); return; }
  balance -= totalBet;

  // Deal
  for(let i=0;i<2;i++){
    drawCard(playerHand, el("player-hand"));
    drawCard(dealerHand, el("dealer-hand"));
  }
  el("player-score").textContent = calcScore(playerHand);
  el("dealer-score").textContent = "?";
  el("side-bets").style.display="none";
  el("game").style.display="block";

  // Check side bets
  if(bp >0 && playerHand[0].value===playerHand[1].value){
    winnings += bp * 5; // Pair pays 5:1
  }
  if(ba>0 && playerHand[0].value === 11 && dealerHand[1].value === 11){
    winnings += ba * 10; // Double aces pays 10:1
  }

  function finish(){
    const ps = calcScore(playerHand);
    let ds = calcScore(dealerHand);
    el("player-score").textContent = ps;
    el("dealer-score").textContent = ds;

    let outcome = "";
    if(ps>21) outcome = "Bust — you lose";
    else {
      while(ds <17){
        drawCard(dealerHand, el("dealer-hand"));
        ds = calcScore(dealerHand);
      }
      if(ds>21 || ps>ds) outcome = "You win!";
      else if(ps===ds) outcome = "Push";
      else outcome = "You lose";
    }

    if(outcome==="You win!") winnings += mainBet*2;
    if(outcome==="Push") winnings += mainBet;

    el("result").textContent = `${outcome} — Round result: +$${winnings.toFixed(2)}`;
    balance += winnings;
    updateBalance();
    el("next-round").style.display="inline-block";
  }

  el("hit").onclick = () => {
    drawCard(playerHand, el("player-hand"));
    const ps = calcScore(playerHand);
    el("player-score").textContent = ps;
    if(ps>21) finish();
  };

  el("stand").onclick = () => finish();

  el("next-round").onclick = () => {
    el("side-bets").style.display="block";
    el("next-round").style.display="none";
    updateBalance();
  };

  updateBalance();
}

el("deal").onclick = startRound;

updateBalance();
