var __GAME__ = {};

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
      {type: CELL_TYPE_START, position: [52, 548], next: 1},
      {type: CELL_TYPE_SIMPLE, position: [119, 482], next: 2},
      {type: CELL_TYPE_SIMPLE, position: [171, 430], next: 3},
      {type: CELL_TYPE_SIMPLE, position: [230, 384], next: 4},
      {type: CELL_TYPE_SIMPLE, position: [368, 374], next: 5},
      {type: CELL_TYPE_SIMPLE, position: [436, 376], next: 6},
      {type: CELL_TYPE_SIMPLE, position: [499, 409], next: 7},
      {type: CELL_TYPE_FINISH, position: [567, 427], next: 0}
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
      progress: 0,
      player: 0
    }
  }

  /* Подписчики на изменения стейта */
  var listeners = []

  /* Определяет закончил ли игрок игру */
  function isFinished(player) {
    return player.isFinished
  }

  /* Вычисляет следующий экран игры, в случае если мы в SCREEN_GAMEPLAY */
  function processGameplayScreen(state, action, movement) {
    switch (action.type) {
      case GAME_NEXT_FRAME:
        if (movement.progress < 1) {
          return SCREEN_GAMEPLAY
        } else {
          switch (staticData.cells[movement.endCell].type) {
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
  function processScreen(state, action, movement) {
    switch (state.screen) {
      case SCREEN_INTRO:
        return action.type === GAME_START ? SCREEN_PREPARE : SCREEN_INTRO
      case SCREEN_PREPARE:
        return action.type === GAME_START && state.players.length > 0 ?
          SCREEN_DICE : SCREEN_PREPARE
      case SCREEN_DICE:
        return action.type === GAME_MAKE_TURN ? SCREEN_GAMEPLAY : SCREEN_DICE
      case SCREEN_GAMEPLAY:
        return processGameplayScreen(state, action, movement)
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
  function processPlayers(state, action, movement) {
    var endCellType = staticData.cells[state.movement.endCell].type
    var players = state.players.slice()
    switch (action.type) {
      case GAME_ADD_PLAYER:
        return state.players.concat(action.player)
      case GAME_END:
      case GAME_QUIT:
        return []
      case GAME_NEXT_FRAME:
        if (movement.progress === 1 && state.screen === SCREEN_GAMEPLAY) {
          return updatePlayers(state, endCellType)
        } else {
          return state.players
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
  function processCurrent(state, action, players, movement) {
    var endCellType = staticData.cells[movement.endCell].type
    var isGameOver = players.every(isFinished)
    var next = state.currentPlayer + 1
    var max = players.length
    switch (action.type) {
      case GAME_NEXT_FRAME:
        if (movement.progress < 1) {
          return {
            players: players,
            current: state.currentPlayer
          }
        } else if (state.screen === SCREEN_GAMEPLAY) {
          switch (endCellType) {
            case CELL_TYPE_FINISH:
            case CELL_TYPE_SIMPLE:
            case CELL_TYPE_SKIP:
              return !isGameOver ? findNext(players, next < max ? next : 0, max)
                : {players: players, current: 0}
            default:
              return {players: players, current: state.currentPlayer}
          }
        } else {
          return {players: players, current: state.currentPlayer}
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
          player: state.currentPlayer,
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
    var movement = processMovement(state, action)
    var updatedPlayers = processPlayers(state, action, movement)
    var next = processCurrent(state, action, updatedPlayers, movement)
    return {
      screen: processScreen(state, action, movement),
      players: next.players,
      currentPlayer: next.current,
      movement: movement
    }
  }

  function dispatch(action) {
    state = nextState(state, action)
    listeners.forEach(function (listener) {
      if (typeof listener === 'function') {
        listener(state)
      }
    })
    console.log(state)
  }

  function subscribe(callback) {
    listeners.push(callback)
    callback(state)
  }

  function addPlayer(player) {
    dispatch({type: GAME_ADD_PLAYER, player: Object.assign({
      isFinished: false,
      isRight: false,
      toSkip: false,
      position: 0,
      score: 0
    }, player)})
  }

  function makeTurn() {
    dispatch({type: GAME_MAKE_TURN, dice: Date.now() % 6 + 1})
  }

  Object.assign(game, {
    state: state,
    dispatch: dispatch,
    subscribe: subscribe,
    addPlayer: addPlayer,
    makeTurn: makeTurn,
    staticData: staticData
  })
})(__GAME__);

/* Работа с визуальной частью */
(function initVisual(game) {
  var gameView = {
    canvas: document.getElementById('canvas'),
    screens: {
      intro: {
        root: document.getElementById('intro-screen'),
        start: document.getElementById('start-game')
      },
      prepare: {
        root: document.getElementById('prepare-screen'),
        start: document.getElementById('start-game-2'),
        list: document.getElementById('players-list'),
        name: document.getElementById('player-name'),
        add: document.getElementById('add-player')
      },
      dice: {
        root: document.getElementById('dice-screen'),
        cta: document.getElementById('dice-cta'),
        result: document.getElementById('dice-result'),
        action: document.getElementById('make-turn')
      }
    }
  }, ctx = gameView.canvas.getContext('2d')

  function updateScreen(name, isOpen) {
    gameView.screens[name].root
      .setAttribute('class', isOpen ? 'game__screen game__screen_active' : 'game__screen')
  }

  function makePlayersList(state) {
    if (state.players.length > 0) {
      return state.players.map(function playerName(player) {
        return player.name
      }).join(', ') + ', поздравляем, вы в игре!'
    } else {
      return 'Как вас зовут? Или придумаем ник?'
    }
  }

  function calcMovementPosition(state) {
    var start = game.staticData.cells[state.movement.startCell].position
    var end = game.staticData.cells[state.movement.endCell].position
    return [
      start[0] + (end[0] - start[0]) * state.movement.progress,
      start[1] + (end[1] - start[1]) * state.movement.progress
    ]
  }

  function renderField(state) {
    ctx.clearRect(0, 0, 800, 600)
    game.staticData.cells.forEach(function renderCell(cell) {
      ctx.fillStyle = 'rgba(46, 42, 94, 1)'
      ctx.fillRect(cell.position[0] - 20, cell.position[1] - 20, 40, 40)
    })
    state.players.forEach(function renderPlayer(player, index) {
      var cell = game.staticData.cells[player.position]
      var position = calcMovementPosition(state)
      if (index !== state.currentPlayer && state.movement.progress < 1) {
        ctx.fillStyle = 'rgba(0, 150, 136, 1)'
        ctx.fillRect(cell.position[0] - 15, cell.position[1] - 15, 30, 30)
      } else {
        ctx.fillStyle = 'rgba(0, 150, 136, 1)'
        ctx.fillRect(position[0] - 15, position[1] - 15, 30, 30)
      }
    })
  }

  function updateView(state) {
    updateScreen('intro', state.screen === 'SCREEN_INTRO')
    updateScreen('prepare', state.screen === 'SCREEN_PREPARE')
    updateScreen('dice', state.screen === 'SCREEN_DICE')
    gameView.screens.prepare.list.innerText = makePlayersList(state)
    renderField(state)
  }

  gameView.screens.intro.start.addEventListener('click', function (event) {
    event.preventDefault()
    game.dispatch({type: 'GAME_START'})
  })

  gameView.screens.prepare.add.addEventListener('click', function (event) {
    var name = gameView.screens.prepare.name.value
    event.preventDefault()
    if (name !== '') {
      gameView.screens.prepare.name.value = ''
      game.addPlayer({name: name})
    }
  })

  gameView.screens.prepare.start.addEventListener('click', function (event) {
    event.preventDefault()
    game.dispatch({type: 'GAME_START'})
  })

  gameView.screens.dice.action.addEventListener('click', function (event) {
    var dice = Date.now() % 6 + 1
    event.preventDefault()
    gameView.screens.dice.result.innerText = 'У вас выпало: ' + dice
    setTimeout(function () {
      game.dispatch({type: 'GAME_MAKE_TURN', dice: dice})
      gameView.screens.dice.result.innerText = 'Бросьте игральную кость на удачу!'
    }, 500)
  })

  game.subscribe(updateView)

  function animate() {
    game.dispatch({type: 'GAME_NEXT_FRAME', delta: 15})
    setTimeout(animate, 1000)
  }

  animate()
})(__GAME__)
