import { emit } from 'kontra';
import { Game } from './game.js';
import { MonetizeEvent } from './monetizeEvent.js';

const monetizeExample = () => {
  if (document && document.monetization) {
    document.monetization.addEventListener('monetizationprogress', (evt) =>
      emit(MonetizeEvent.progress, evt)
    );
  } else {
    window.addEventListener('monetizationprogress', (evt) =>
      emit(MonetizeEvent.progress, evt)
    );
  }
};

function init() {
  const gameEl = document.getElementById('game');

  monetizeExample();
  new Game(gameEl);
}
init();
