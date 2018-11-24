(function (game) {
  /* Все экраны игры (её стадии) */
  var SCREEN_INTRO = 'SCREEN_INTRO'
  var SCREEN_PREPARE = 'SCREEN_PREPARE'
  var SCREEN_GAMEPLAY = 'SCREEN_GAMEPLAY'
  var SCREEN_PAUSE = 'SCREEN_PAUSE'
  var SCREEN_QUESTION = 'SCREEN_QUESTION'
  var SCREEN_DICE = 'SCREEN_DICE'
  var SCREEN_CONGRATULATIONS = 'SCREEN_CONGRATULATIONS'
  var SCREEN_SCORE = 'SCREEN_SCORE'
  /* Игровые процессы или действия */
  var ACTION_NONE = 'ACTION_NONE'
  /* Типы клеточек по которым мы передвигаемся */
  var CELL_TYPE_START = 'CELL_TYPE_START'
  var CELL_TYPE_SIMPLE = 'CELL_TYPE_SIMPLE'
  var CELL_TYPE_QUESTION = 'CELL_TYPE_QUESTION'
  /* Все возможные действия в игре */
  var GAME_START = 'GAME_START'
  var GAME_PAUSE = 'GAME_PAUSE'
  var GAME_RESUME = 'GAME_RESUME'
  var GAME_QUIT = 'GAME_QUIT'
  var GAME_END = 'GAME_END'
  var GAME_ADD_PLAYER = 'GAME_ADD_PLAYER'
  var GAME_MAKE_TURN = 'GAME_MAKE_TURN'
  var GAME_NEXT_FRAME = 'GAME_NEXT_FRAME'
  var GAME_MAKE_ANSWER = 'GAME_MAKE_ANSWER'

  /* Статичные данные игры */
  var staticData = {
    cells: [
      {
        type: CELL_TYPE_START,
        position: [30, 500],
        screen: SCREEN_LEFT_BOTTOM
      }
    ]
  }

  /* Начальное состояние игры */
  var state = {
    screen: SCREEN_INTRO,
    players: [],
    currentPlayer: 0,
    currentAction: ACTION_NONE,
    movement: {
      startCell: 0,
      endCell: 0,
      progress: 0
    }
  }

  /* Вычисляет следующий экран игры */
  function processScreen(state, action) {
    switch (action.type) {
      case GAME_START:
        if (state.screen === SCREEN_INTRO) {
          return SCREEN_PREPARE;
        } else if (state.screen === SCREEN_PREPARE) {
          return SCREEN_DICE;
        } else {
          return state.screen
        }
      default:
        return state.screen
    }
  }

  /* Вычисляет состояние игроков */
  function processPlayers(state, action) {

  }

  /* Вычисляет текущего игрока */
  function processCurrent(state, action) {

  }

  /* Вычисляет текущее действие */
  function processAction(state, action) {

  }

  /* Вычисляет состояние движения */
  function processMovement(state, action) {

  }

  /* Функция вычисляющая следующие состояние */
  function nextState(state, action) {
    return {
      screen: processScreen(state, action),
      players: processPlayers(state, action),
      currentPlayer: processCurrent(state, action),
      currentAction: processAction(state, action),
      movement: processMovement(state, action)
    }
  }

  /* Выводим начальное состояние */
  console.log(state)
})(window)
