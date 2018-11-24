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
  var ANIMATION_SPEED = 0.01
  /* Типы клеточек по которым мы передвигаемся */
  var CELL_TYPE_START = 'CELL_TYPE_START'
  var CELL_TYPE_SIMPLE = 'CELL_TYPE_SIMPLE'
  var CELL_TYPE_QUESTION = 'CELL_TYPE_QUESTION'
  var CELL_TYPE_RETURN = 'CELL_TYPE_RETURN'
  var CELL_TYPE_SKIP = 'CELL_TYPE_SKIP'
  var CELL_TYPE_FINISH = 'CELL_TYPE_FINISH'
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
        screen: 0
      }
    ]
  }

  /* Начальное состояние игры */
  var state = {
    screen: SCREEN_INTRO,
    players: [],
    currentPlayer: 0,
    movement: {
      startCell: 0,
      endCell: 0,
      progress: 0
    }
  }

  /* Определяет закончил ли игрок игру */
  function isFinished(player) {
    return player.isFinished
  }

  /* Вычисляет следующий экран игры, в случае если мы в SCREEN_GAMEPLAY */
  function processGameplayScreen(state, action) {
    switch (action.type) {
      case GAME_NEXT_FRAME:
        if (state.movement.progress < 1) {
          return SCREEN_GAMEPLAY
        } else {
          switch (staticData.cells[state.movement.endCell].type) {
            case CELL_TYPE_SIMPLE: return SCREEN_DICE
            case CELL_TYPE_QUESTION: return SCREEN_QUESTION
            case CELL_TYPE_RETURN: return SCREEN_GAMEPLAY
            case CELL_TYPE_SKIP: return SCREEN_DICE
            case CELL_TYPE_FINISH: return SCREEN_SCORE
            default: return SCREEN_DICE
          }
        }
      case GAME_PAUSE:
        return SCREEN_PAUSE
      default:
        return SCREEN_GAMEPLAY
    }
  }

  /* Вычисляет следующий экран игры */
  function processScreen(state, action) {
    switch (state.screen) {
      case SCREEN_INTRO:
        return action.type === GAME_START ? SCREEN_PREPARE : SCREEN_INTRO
      case SCREEN_PREPARE:
        return action.type === GAME_START && state.players.length > 0 ?
          SCREEN_DICE : SCREEN_PREPARE
      case SCREEN_DICE:
        return action.type === GAME_MAKE_TURN ? SCREEN_GAMEPLAY : SCREEN_DICE
      case SCREEN_GAMEPLAY:
        return processGameplayScreen(state, action)
      case SCREEN_PAUSE:
        if (action.type === GAME_RESUME) {
          return SCREEN_GAMEPLAY
        } else if (action.type === GAME_QUIT) {
          return SCREEN_INTRO
        } else {
          return SCREEN_PAUSE
        }
      case SCREEN_QUESTION:
        return action.type === GAME_MAKE_ANSWER ? SCREEN_DICE : SCREEN_QUESTION
      case SCREEN_CONGRATULATIONS:
        if (action.type === GAME_RESUME) {
          return state.players.every(isFinished) ? SCREEN_SCORE : SCREEN_DICE
        }
      case SCREEN_SCORE:
        return action.type === GAME_END ? SCREEN_INTRO : SCREEN_SCORE
      default:
        return state.screen
    }
  }

  /* Обновляет должным образом текущего игрока */
  function updatePlayers(state, cellType) {
    var players = state.players.slice()
    var current = state.currentPlayer
    switch (cellType) {
      case CELL_TYPE_FINISH:
        players[current] = Object.assign({}, players[current], {
          position: state.movement.endCell,
          isFinished: true,
          isRight: false
        })
        return players
      case CELL_TYPE_SKIP:
        players[current] = Object.assign({}, players[current], {
          position: state.movement.endCell,
          toSkip: true,
          isRight: false
        })
        return players
      default:
        players[current] = Object.assign({}, players[current], {
          position: state.movement.endCell,
          isRight: false
        })
        return players
    }
  }

  /* Вычисляет состояние игроков */
  function processPlayers(state, action) {
    var endCellType = staticData.cells[state.movement.endCell].type
    var players = state.players.slice()
    switch (action.type) {
      case GAME_ADD_PLAYER:
        return state.players.concat(action.player)
      case GAME_END:
      case GAME_QUIT:
        return []
      case GAME_NEXT_FRAME:
        if (state.movement.progress < 1) {
          return state.players
        } else {
          return updatePlayers(state, endCellType)
        }
      case GAME_MAKE_ANSWER:
        players[state.currentPlayer] = Object.assign({}, players[state.currentPlayer], {
          isRight: action.isRight,
          score: players[state.currentPlayer].score + action.score
        })
        return players
      default:
        return state.players
    }
  }

  /* Поиск следующего игрока */
  function findNext(players, next, max) {
    var updatedPlayers

    if (players[next].isFinished) {
      return findNext(players, next + 1 < max ? next + 1 : 0, max)
    }

    if (!players[next].toSkip) {
      return {
        current: next,
        players: players
      }
    } else {
      updatedPlayers = players.slice()
      updatedPlayers[next] = Object.assign({}, players[next], {
        toSkip: false
      })
      return findNext(updatedPlayers, next + 1 < max ? next + 1 : 0, max)
    }
  }

  /* Вычисляет текущего игрока */
  function processCurrent(state, action, players) {
    var endCellType = staticData.cells[state.movement.endCell].type
    var isGameOver = players.every(isFinished)
    var next = state.currentPlayer + 1
    var max = players.length
    switch (action.type) {
      case GAME_NEXT_FRAME:
        if (state.movement.progress < 0) {
          return {
            players: players,
            current: state.currentPlayer
          }
        } else {
          switch (endCellType) {
            case CELL_TYPE_FINISH:
            case CELL_TYPE_SIMPLE:
            case CELL_TYPE_SKIP:
              return !isGameOver ? findNext(players, next < max ? next : 0, max)
                : {players: players, current: 0}
            default:
              return {players: players, current: state.currentPlayer}
          }
        }
      case GAME_MAKE_ANSWER:
        return !isGameOver ? findNext(players, next < max ? next : 0, max)
          : {players: players, current: 0}
      default:
        return {players: players, current: state.currentPlayer}
    }
  }

  /* Обновляет состояние движения */
  function updateMovement(state, action) {
    var endCellType = staticData.cells[state.movement.endCell].type
    var delta = action.delta * ANIMATION_SPEED
    if (state.screen === SCREEN_GAMEPLAY) {
      if (state.movement.progress < 1) {
        return Object.assign({}, state.movement, {
          progress: Math.min(state.movement.progress + delta, 1)
        })
      } else if (endCellType === CELL_TYPE_RETURN) {
        return {
          startCell: state.movement.endCell,
          endCell: staticData.cells[state.movement.endCell].target,
          progress: 0
        }
      }
    }
    return state.movement
  }

  /* Итерация поиска маршрута */
  function nextCell(cell, left, isRight) {
    if (left === 0 || staticData.cells[cell].type === CELL_TYPE_FINISH) {
      return cell
    } else if (staticData.cells[cell].next) {
      return nextCell(staticData.cells[cell].next, left - 1, isRight)
    } else if (isRight) {
      return nextCell(staticData.cells[cell].right, left - 1, isRight)
    } else {
      return nextCell(staticData.cells[cell].left, left - 1, isRight)
    }
  }

  /* Находит конечный пункт хода */
  function findEndCell(player, dice, left) {
    return nextCell(
      player.position,
      dice,
      player.isRight ? player.isRight : dice % 2 === 0
    )
  }

  /* Вычисляет состояние движения */
  function processMovement(state, action) {
    var currentPlayer = state.players[state.currentPlayer]
    switch (action.type) {
      case GAME_NEXT_FRAME:
        return updateMovement(state, action)
      case GAME_MAKE_TURN:
        return {
          startCell: currentPlayer.position,
          endCell: findEndCell(currentPlayer, action.dice),
          progress: 0
        }
      default:
        return state.movement
    }
  }

  /* Функция вычисляющая следующие состояние */
  function nextState(state, action) {
    var updatedPlayers = processPlayers(state, action)
    var next = processCurrent(state, action, updatedPlayers)
    return {
      screen: processScreen(state, action),
      players: next.players,
      currentPlayer: next.current,
      movement: processMovement(state, action)
    }
  }

  /* Выводим начальное состояние */
  console.log(state)
})(window)
