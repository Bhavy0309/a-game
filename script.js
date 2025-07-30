const ambient = document.getElementById('ambient');
const sfx = document.getElementById('sfx');
function playSound(src, volume=1) {
  sfx.src = src;
  sfx.volume = volume;
  sfx.play().catch(()=>{});
}

function playAmbient(src, volume=0.3) {
  ambient.src = src;
  ambient.volume = volume;
  ambient.play().catch(()=>{});
}

let gameState;
function initState() {
  gameState = { health: 3, inventory: [], hasTorch: false, hasPotion: false };
  document.body.style.background = 'var(--bg-dark)';
  updateUI();
  playAmbient('https://www.soundjay.com/ambient/sounds/dungeon-ambience-1.mp3', 0.2);
}

function updateUI() {
  const fill = document.getElementById('healthFill');
  const pct = Math.max(0, Math.min(100, (gameState.health / 3) * 100));
  fill.style.width = pct + '%';
  let inv = gameState.inventory.length ? gameState.inventory.join(', ') : 'None';
  document.getElementById('inventory').textContent = 'Inventory: ' + inv;
}

function clearChoices() {
  const ch = document.getElementById('choices');
  ch.innerHTML = '';
}

function typeStory(text, cb) {
  const el = document.getElementById('story');
  el.classList.remove('show');
  el.classList.add('fade-slide');
  el.textContent = '';
  el.classList.add('typing');
  let i=0;
  function step(){
    if(i<text.length){
      el.textContent += text[i++];
      setTimeout(step, 30);
    } else {
      el.classList.remove('typing');
      el.classList.add('show');
      cb && setTimeout(cb, 200);
    }
  }
  setTimeout(step, 100);
}

function showChoices(options) {
  const ch = document.getElementById('choices');
  options.forEach(([text, fn], idx) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.onclick = fn;
    ch.appendChild(btn);
    setTimeout(() => btn.classList.add('show'), idx * 100);
  });
}

function level1() {
  clearChoices();
  typeStory("You awaken in a damp cell—cold stone beneath your fingers. What do you do?", () => {
    showChoices([
      ['Pick up the glowing torch', () => {
        gameState.hasTorch = true; gameState.inventory.push('Torch');
        playSound('https://www.soundjay.com/fire/sounds/torch-click-01.mp3');
        document.body.style.background = 'var(--bg-cell)';
        updateUI();
        level2();
      }],
      ['Open the rusty door (risky)', () => {
        gameState.health--; playSound('https://www.soundjay.com/mechanical/sounds/door-creak-03.mp3');
        updateUI();
        level2();
      }],
      ['Search the cell floor', () => {
        if (!gameState.hasPotion) {
          gameState.hasPotion = true;
          gameState.inventory.push('Potion');
          playSound('https://www.soundjay.com/misc/sounds/bottle-clink-1.mp3');
        }
        level2();
      }]
    ]);
  });
}

function level2() {
  clearChoices();
  typeStory("The corridor diverges: cold air lingers left, faint music drifts right.", () => {
    showChoices([
      ['Cold tunnel', () => {
        if (!gameState.hasTorch) { gameState.health--; playSound('https://www.soundjay.com/human/sounds/cough-01.mp3'); }
        document.body.style.background = 'var(--bg-corridor)';
        updateUI(); level3();
      }],
      ['Musical tunnel', () => {
        if (gameState.hasTorch) { gameState.health = Math.min(3, gameState.health + 1); playSound('https://www.soundjay.com/musical/sounds/bell-toll-02.mp3'); }
        document.body.style.background = 'var(--bg-corridor)';
        updateUI(); level3();
      }],
      ['Drink potion (if you have one)', () => {
        if (gameState.hasPotion) {
          gameState.health = 3; gameState.hasPotion = false;
          const i = gameState.inventory.indexOf('Potion');
          if (i >= 0) gameState.inventory.splice(i,1);
          updateUI(); playSound('https://www.soundjay.com/magic/sounds/potion-pour-01.mp3');
        }
        level3();
      }]
    ]);
  });
}

function level3() {
  clearChoices();
  typeStory('A whispering wall asks: "What solves existence but cannot be held?"', () => {
    showChoices([
      ['A Shadow', () => wrongAnswer()],
      ['A Candle', () => wrongAnswer()],
      ['Time', () => {
        playSound('https://www.soundjay.com/magic/sounds/magic-chime-03.mp3');
        document.body.style.background = 'var(--bg-puzzle)';
        level4();
      }]
    ]);
  });
}

function wrongAnswer() {
  gameState.health--; playSound('https://www.soundjay.com/human/sounds/sigh-01.mp3');
  updateUI(); level4();
}

function level4() {
  clearChoices();
  typeStory('You step into the Monster Lair… a deep growl echoes. Choose:', () => {
    showChoices([
      ['Sneak past quietly', () => {
        if (!gameState.hasTorch) gameState.health--;
        else playSound('https://www.soundjay.com/misc/sounds/footsteps-echo-1.mp3');
        document.body.style.background = 'var(--bg-lair)';
        updateUI(); level5();
      }],
      ['Fight with torch', () => {
        if (gameState.hasTorch) playSound('https://www.soundjay.com/human/sounds/screaming-1.mp3');
        else gameState.health -= 2;
        document.body.style.background = 'var(--bg-lair)';
        updateUI(); level5();
      }],
      ['Run back', () => {
        gameState.health--; playSound('https://www.soundjay.com/human/sounds/gasp-01.mp3');
        document.body.style.background = 'var(--bg-lair)';
        updateUI(); level5();
      }]
    ]);
  });
}

function level5() {
  clearChoices();
  typeStory('Three glowing doors appear… Red, Silver, Green. Which leads to freedom?', () => {
    showChoices([
      ['Red door', () => finish(false)],
      ['Silver door', () => finish(true)],
      ['Green door', () => finish(false)]
    ]);
  });
}

function finish(win) {
  clearChoices();
  if (gameState.health <= 0) {
    playSound('https://www.soundjay.com/misc/sounds/bell-toll-1.mp3');
    document.body.style.background = 'var(--bg-lose)';
    typeStory('You collapse from your wounds. Game Over.', null);
  } else if (win) {
    playSound('https://www.soundjay.com/magic/sounds/magic-fairy-02.mp3');
    document.body.style.background = 'var(--bg-win)';
    typeStory('The silver door opens—freedom at last! You win!', null);
  } else {
    playSound('https://www.soundjay.com/explosion/sounds/explosion-small-01.mp3');
    document.body.style.background = 'var(--bg-lose)';
    typeStory('A trap! Acid floods in—you perish. Game Over.', null);
  }
}

document.getElementById('restart').onclick = () => { initState(); level1(); };
initState(); level1();