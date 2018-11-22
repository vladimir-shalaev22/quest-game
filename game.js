(function (game) {
  /* Перечисление констант игры */
  var SCREEN_INTRO = 'SCREEN_INTRO'
  var SCREEN_LEFT_BOTTOM = 'SCREEN_LEFT_BOTTOM'
  var ACTION_NONE = 'ACTION_NONE'
  var CELL_TYPE_START = 'CELL_TYPE_START'
  var CELL_TYPE_SIMPLE = 'CELL_TYPE_SIMPLE'
  var CELL_TYPE_QUESTION = 'CELL_TYPE_QUESTION'

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

  /* Выводим начальное состояние */
  console.log(state)
})(window)
