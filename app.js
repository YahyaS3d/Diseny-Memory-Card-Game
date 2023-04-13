
const disneyAPIBaseUrl = "https://api.disneyapi.dev/characters";
const game = document.getElementById('game');
let firstPick;
let isPaused = true;
let matches = 0;
let intervalId;

const colors = {
  'Disney': '#F5F5F5', // default color
  'Disney Channel': '#3E3A84',
  'Marvel': '#D93F2A',
  'Star Wars': '#FFE81F'
};

const loadCharacters = async () => {
  const results = await fetch(disneyAPIBaseUrl);
  const characters = await results.json();
  return characters.data;
}
function fitPicks() {
    const successDiv = document.getElementById('success');
    successDiv.classList.remove('hidden');
    setTimeout(function() {
        successDiv.classList.add('hidden');
    }, 4000); // hide the error message after 4 seconds
  }
function showError() {
    const errorDiv = document.getElementById('error');
    errorDiv.classList.remove('hidden');
    setTimeout(function() {
      errorDiv.classList.add('hidden');
    }, 4000); // hide the error message after 4 seconds
  }
  const showSuccess = async (character, isMatched) => {
    if (!isMatched) {
        return;
    }
    const characterId = character.dataset.characterid;
    const url = `${disneyAPIBaseUrl}/id/${characterId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function() {
        if (this.status === 200) {
            const details = JSON.parse(this.responseText);

            const successDiv = document.getElementById('success');
            const filmList = details.data.films.map(film => `<li>${film}</li>`).join('');
            const seriesList = details.data.series.map(series => `<li>${series}</li>`).join('');
            const gameList = details.data.videoGames.map(game => `<li>${game}</li>`).join('');
            const attractionList = details.data.attractions.map(attraction => `<li>${attraction}</li>`).join('');
            const message = `
              <div>Very nice! You succeeded!</div>
              <div>Film(s) in which he appeared:</div>
              <ul>${filmList}</ul>
              <div>Series/series:</div>
              <ul>${seriesList}</ul>
              <div>Video Games:</div>
              <ul>${gameList}</ul>
              <div>Attractions:</div>
              <ul>${attractionList}</ul>
            `;

            successDiv.innerHTML = message;
            successDiv.classList.remove('hidden');

            setTimeout(function() {
              successDiv.classList.add('hidden');
            }, 5000); // hide the success message after 5 seconds
        }
    };

    xhr.send();
};

  const startGame = () => {
    let timeElapsed = 0;
    //akra 
    document.getElementById('start-game-btn').style.display = 'none';
    // Display timer next to start game button
    const timerElement = document.createElement('span');
    timerElement.id = 'timer';
    document.getElementById('start-game-btn').insertAdjacentElement('afterend', timerElement);
  
    // Update timer every second
    intervalId = setInterval(() => {
      timeElapsed++;
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  
    // Make AJAX call to get current time
    fetch('http://yahyasa.mysoft.jce.ac.il/ex1/time/get_current_time.php')
      .then(response => response.text())
      .then(time => {
        console.log(`Current time is ${time}`);
        // Call function to show playing cards
        displayCharacters();
      })
      .catch(error => console.error(error));

      setTimeout(async () => {
        const loadedCharacters = await loadCharacters();
        displayCharacters([...loadedCharacters, ...loadedCharacters]);
        isPaused = false;
      }, 200);
  }


  const resetGame = async() => {
    const finishGameDiv = document.getElementById('finish-game');
    finishGameDiv.classList.add('hidden');
    clearInterval(intervalId); // Clear the interval to stop the timer
    game.innerHTML = '';
    isPaused = true;
    firstPick = null;
    matches = 0;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = '00:00'; // Reset the timer to 00:00
    setTimeout(async () => {
      const loadedCharacters = await loadCharacters();
      displayCharacters([...loadedCharacters, ...loadedCharacters]);
      isPaused = false;
      // Start the timer again
      let timeElapsed = 0;
      intervalId = setInterval(() => {
        timeElapsed++;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }, 1000);
    }, 200);
  }

const displayCharacters = (characters) => {
    // Randomly select 10 characters
    const selectedCharacters = [];
    while (selectedCharacters.length < 10) {
      const index = Math.floor(Math.random() * characters.length);
      const character = characters[index];
      if (!selectedCharacters.includes(character)) {
        selectedCharacters.push(character);
      }
    }
  
    // Create pairs of cards for each selected character
    let characterPairs = [];
    selectedCharacters.forEach((character) => {
      characterPairs.push(character);
      characterPairs.push(character);
    });
  
    // Randomize the order of cards
    let currentIndex = characterPairs.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [characterPairs[currentIndex], characterPairs[randomIndex]] = [characterPairs[randomIndex], characterPairs[currentIndex]];
    }
  
    // Create HTML for cards
    let characterHTML = '';
    characterPairs.forEach((character) => {
      const color = colors[character.franchise] || colors['Disney'];
      const isNameFirst = Math.random() < 0.5;
      characterHTML += `
        <div class="card" onclick="clickCard(event)" data-charactername="${character.name}" style="background-color:${color};">
          <div class="front">
          </div>
          <div class="back rotated" style="background-color:${color};">
            <img src="${character.imageUrl}" alt="${character.name}"  />
            <h2>${character.name}</h2>
          </div>
        </div>
      `;
    });
  
    game.innerHTML = characterHTML;
  }

  const clickCard = (e) => {
    const characterCard = e.currentTarget;
    const [front, back] = getFrontAndBackFromCard(characterCard)
    if(front.classList.contains("rotated") || isPaused) {
      return;
    }
    isPaused = true;
    rotateElements([front, back]);
    if(!firstPick){
      firstPick = characterCard;
      isPaused = false;
    }
    else {
      const secondCharacterName = characterCard.dataset.charactername;
      const firstCharacterName = firstPick.dataset.charactername;
      if(firstCharacterName !== secondCharacterName) {
          showError();
          const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
          setTimeout(() => {
            rotateElements([front, back, firstFront, firstBack]);
            firstPick = null;
            isPaused = false;
          }, 500)
        } else {
          matches++;
        //   console.log(matches);
          if(matches === 10) {
            finishGame();
          } else {
            fitPicks();
          }
          firstPick = null;
          isPaused = false;
        }
    }  
  }

const getFrontAndBackFromCard = (card) => {
  const front = card.querySelector(".front");
  const back = card.querySelector(".back");
  return [front, back]
}

const rotateElements = (elements) => {
  if(typeof elements !== 'object' || !elements.length) return;
  elements.forEach(element => element.classList.toggle('rotated'));
}

const finishGame = () => {
    clearInterval(intervalId); // stop the timer
    isPaused = true;
    const finishGameDiv = document.getElementById('finish-game');

    const timeElement = document.getElementById('timer');
    const elapsedTimeInSeconds = parseInt(timeElement.textContent.split(':').reduce((acc, val) => (60 * acc) + parseInt(val)));
  
    const clickCount = matches * 2; // each match is 2 clicks
  
    const averageTimePerClick = (elapsedTimeInSeconds / clickCount).toFixed(2);
    let msg = `Congratulations, you finished the game in ${timeElement.textContent} with ${clickCount} clicks. The average time per click is ${averageTimePerClick} seconds.`;
    finishGameDiv.innerText = msg;
    finishGameDiv.classList.remove('hidden');
};