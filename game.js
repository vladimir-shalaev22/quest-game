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
  var ANIMATION_SPEED = 0.003
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
    questions: [
      {
        text: 'Сколько депутатов состоит в  Барнаульской городской думе?',
        answers: ['7', '50', '40'],
        score: 100,
        right: 2
      },
      {
        text: 'Кто был избран главой города Барнаула в 2017 году?',
        answers: [
          'Дугин Сергей Иванович',
          'Собянин Сергей Семенович',
          'Волков Михаил Давидович'
        ],
        score: 50,
        right: 0
      }
    ],
    cells: [
      {type: CELL_TYPE_START, position: [64,1148], next: 1},
      {type: CELL_TYPE_SIMPLE, position: [118,1083], next: 2},
      {type: CELL_TYPE_SIMPLE, position: [172,1029], next: 3},
      {type: CELL_TYPE_SIMPLE, position: [228,985], next: 4},
      {type: CELL_TYPE_SKIP, position: [300,957], left: 5, right: 11},
      {type: CELL_TYPE_SIMPLE, position: [241,906], next: 6},
      {type: CELL_TYPE_QUESTION, position: [181,871], next: 7, question: 0},
      {type: CELL_TYPE_SIMPLE, position: [120,832], next: 8},
      {type: CELL_TYPE_SKIP, position: [117,760], next: 9},
      {type: CELL_TYPE_SIMPLE, position: [120,690], next: 10},
      {type: CELL_TYPE_QUESTION, position: [75,637], next: 11, question: 1},
      {type: CELL_TYPE_QUESTION, position: [370,973], next: 12, question: 0},
      {type: CELL_TYPE_SIMPLE, position: [435,979], next: 13},
      {type: CELL_TYPE_SIMPLE, position: [500,1009], next: 14},
      {type: CELL_TYPE_SKIP, position: [567,1027], next: 15},
      {type: CELL_TYPE_SIMPLE, position: [640,1024], next: 16},
      {type: CELL_TYPE_SIMPLE, position: [710,1030], next: 17},
      {type: CELL_TYPE_SIMPLE, position: [756,976], next: 18},
      {type: CELL_TYPE_SIMPLE, position: [747,903], next: 19},
      {type: CELL_TYPE_SIMPLE, position: [750,835], next: 20},
      {type: CELL_TYPE_QUESTION, position: [700,790], next: 21, question: 1},
      {type: CELL_TYPE_SIMPLE, position: [633,760], next: 22},
      {type: CELL_TYPE_SIMPLE, position: [560,789], next: 23},
      {type: CELL_TYPE_SKIP, position: [487,805], next: 24},
      {type: CELL_TYPE_SIMPLE, position: [417,802], next: 25},
      {type: CELL_TYPE_SIMPLE, position: [342,795], next: 26},
      {type: CELL_TYPE_QUESTION, position: [331,724], next: 27, question: 0},
      {type: CELL_TYPE_SIMPLE, position: [307,658], next: 28},
      {type: CELL_TYPE_SIMPLE, position: [384,651], next: 29},
      {type: CELL_TYPE_FINISH, position: [453,636], next: 29}
    ]
  }

  /* Начальное состояние игры */
  var state = {
    screen: SCREEN_INTRO,
    players: [],
    currentPlayer: 0
  }

  /* Подписчики на изменения стейта */
  var listeners = []

  /* Обновляет состояние игрока */
  function updatePlayer(player, delta) {
    if (player.isMoving) {
      var progress = Math.min(player.progress + delta * ANIMATION_SPEED, 1)
      var isMoving = progress < 1
      var turnIsDone = !isMoving
      var endCellType = staticData.cells[player.target].type
      if (turnIsDone) {
        return Object.assign({}, player, {
          isMoving: isMoving,
          progress: progress,
          position: player.target,
          toSkip: endCellType === CELL_TYPE_SKIP,
          isFinished: endCellType === CELL_TYPE_FINISH,
          isRight: false
        })
      } else {
        return Object.assign({}, player, {progress: progress})
      }
    } else {
      return player
    }
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

  /* Вычисляет состояние игроков */
  function processPlayers(state, action) {
    var current = state.players[state.currentPlayer]
    var players = state.players.slice()
    switch (action.type) {
      case GAME_ADD_PLAYER:
        return state.players.concat(action.player)
      case GAME_END:
      case GAME_QUIT:
        return []
      case GAME_NEXT_FRAME:
        if (state.screen === SCREEN_GAMEPLAY) {
          return players.map(function (player) {
            return updatePlayer(player, action.delta)
          })
        } else {
          return state.players
        }
      case GAME_MAKE_ANSWER:
        players[state.currentPlayer] = Object.assign({}, players[state.currentPlayer], {
          isRight: action.isRight,
          score: players[state.currentPlayer].score + action.score
        })
        return players
      case GAME_MAKE_TURN:
        players[state.currentPlayer] = Object.assign({}, players[state.currentPlayer], {
          isMoving: true,
          progress: 0,
          target: findEndCell(current, action.dice)
        })
        return players
      default:
        return state.players
    }
  }

  /* Определеят тип ячейки куда движется игрок */
  function getEndCellType(player) {
    return staticData.cells[player.target].type
  }

  /* Определяет закончил ли игрок игру */
  function isFinished(player) {
    return player.isFinished
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
    if (players.length < 1) {
      return {players: players, current: state.currentPlayer}
    }
    var current = players[state.currentPlayer]
    var isGameOver = players.every(isFinished)
    var endCellType = getEndCellType(current)
    var next = state.currentPlayer + 1
    var max = players.length
    switch (action.type) {
      case GAME_NEXT_FRAME:
        if (current.isMoving) {
          return {
            players: players,
            current: state.currentPlayer
          }
        } else if (state.screen === SCREEN_GAMEPLAY) {
          switch (endCellType) {
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
      case GAME_RESUME:
        return state.screen === SCREEN_CONGRATULATIONS && !isGameOver ?
          findNext(players, next < max ? next : 0, max)
          : {players: players, current: 0}
      case GAME_MAKE_ANSWER:
        return !isGameOver ? findNext(players, next < max ? next : 0, max)
          : {players: players, current: 0}
      default:
        return {players: players, current: state.currentPlayer}
    }
  }

  /* Вычисляет следующий экран игры, в случае если мы в SCREEN_GAMEPLAY */
  function processGameplayScreen(state, action, players) {
    var current = players[state.currentPlayer]
    switch (action.type) {
      case GAME_NEXT_FRAME:
        if (current.isMoving) {
          return SCREEN_GAMEPLAY
        } else {
          switch (staticData.cells[current.target].type) {
            case CELL_TYPE_SIMPLE: return SCREEN_DICE
            case CELL_TYPE_QUESTION: return SCREEN_QUESTION
            case CELL_TYPE_RETURN: return SCREEN_GAMEPLAY
            case CELL_TYPE_SKIP: return SCREEN_DICE
            case CELL_TYPE_FINISH: return SCREEN_CONGRATULATIONS
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
  function processScreen(state, action, players) {
    switch (state.screen) {
      case SCREEN_INTRO:
        return action.type === GAME_START ? SCREEN_PREPARE : SCREEN_INTRO
      case SCREEN_PREPARE:
        return action.type === GAME_START && state.players.length > 0 ?
          SCREEN_DICE : SCREEN_PREPARE
      case SCREEN_DICE:
        return action.type === GAME_MAKE_TURN ? SCREEN_GAMEPLAY : SCREEN_DICE
      case SCREEN_GAMEPLAY:
        return processGameplayScreen(state, action, players)
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
          return players.every(isFinished) ? SCREEN_SCORE : SCREEN_DICE
        } else {
          return SCREEN_CONGRATULATIONS
        }
      case SCREEN_SCORE:
        return action.type === GAME_END ? SCREEN_INTRO : SCREEN_SCORE
      default:
        return state.screen
    }
  }

  function nextState(state, action) {
    var players = processPlayers(state, action)
    var next = processCurrent(state, action, players)
    return {
      screen: processScreen(state, action, players),
      players: next.players,
      currentPlayer: next.current
    }
  }

  function dispatch(action) {
    state = nextState(state, action)
    listeners.forEach(function (listener) {
      if (typeof listener === 'function') {
        listener(state)
      }
    })
  }

  function subscribe(callback) {
    listeners.push(callback)
    callback(state)
  }

  function addPlayer(player) {
    dispatch({type: GAME_ADD_PLAYER, player: Object.assign({
      isFinished: false,
      isMoving: false,
      isRight: false,
      toSkip: false,
      progress: 0,
      position: 0,
      target: 0,
      score: 0
    }, player)})
  }

  function makeTurn() {
    dispatch({type: GAME_MAKE_TURN, dice: Date.now() % 6 + 1})
  }

  function getState() {
    return state
  }

  Object.assign(game, {
    state: state,
    dispatch: dispatch,
    subscribe: subscribe,
    addPlayer: addPlayer,
    makeTurn: makeTurn,
    staticData: staticData,
    getState: getState
  })
})(__GAME__);

/* Работа с визуальной частью */
(function initVisual(game) {
  var prevState = {
    screen: -1,
    players: -1,
    currentPlayer: -1
  }
  var gameView = {
    canvas: document.getElementById('canvas'),
    screens: {
      gameplay: document.getElementById('gameplay'),
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
      },
      question: {
        root: document.getElementById('question-screen'),
        message: document.getElementById('question-message'),
        text: document.getElementById('question-text'),
        answerA: document.getElementById('make-answer-a'),
        answerB: document.getElementById('make-answer-b'),
        answerC: document.getElementById('make-answer-c')
      },
      congratulations: {
        root: document.getElementById('congratulations-screen'),
        message: document.getElementById('congratulations-message'),
        result: document.getElementById('congratulations-result'),
        resume: document.getElementById('congratulations-resume')
      },
      score: {
        root: document.getElementById('score-screen'),
        results: document.getElementById('score-results'),
        finish: document.getElementById('score-finish')
      }
    }
  }, ctx = gameView.canvas.getContext('2d')

  var sprites = {
    'cell': 'images/cell.png',
    'start': 'images/cell-s.png',
    'question': 'images/cell-q.png',
    'warning': 'images/cell-w.png',
    'finish': 'images/cell-f.png',
    'start': 'images/cell-s.png',
    'player': 'images/player.png'
  }

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

  function easeOutCubic(t) {
    return (--t) * t * t + 1
  }

  function viewportOffset(p) {
    var origin = [p[0] - 400, p[0] + 400, p[1] - 300, p[1] + 300]
    var left = origin[1] <= 1600 ? Math.max(origin[0], 0) : 800
    var top = origin[3] <= 1200 ? Math.max(origin[2], 0) : 600
    return [left, top]
  }

  function calcMovementPosition(player) {
    if (player.isMoving) {
      var start = game.staticData.cells[player.position].position
      var end = game.staticData.cells[player.target].position
      var p = easeOutCubic(player.progress)
      return [
        start[0] + (end[0] - start[0]) * p,
        start[1] + (end[1] - start[1]) * p
      ]
    } else {
      return game.staticData.cells[player.position].position
    }
  }

  function renderField(state) {
    if (state.players.length > 0) {
      var current = state.players[state.currentPlayer]
      var viewport = viewportOffset(calcMovementPosition(current))
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, 800, 600)
      ctx.translate(-viewport[0], -viewport[1])
    }
    game.staticData.cells.forEach(function renderCell(cell) {
      var sprite;
      var offset;
      ctx.fillStyle = 'rgba(46, 42, 94, 1)'
      switch (cell.type) {
        case 'CELL_TYPE_SKIP':
        case 'CELL_TYPE_RETURN':
          offset = 30; sprite = sprites.warning; break;
        case 'CELL_TYPE_START':
          offset = 45; sprite = sprites.start; break;
        case 'CELL_TYPE_FINISH':
          offset = 45; sprite = sprites.finish; break;
        case 'CELL_TYPE_QUESTION':
          offset = 30; sprite = sprites.question; break;
        default:
          offset = 30; sprite = sprites.cell
      }
      ctx.drawImage(sprite, cell.position[0] - offset, cell.position[1] - offset)
    })
    state.players.forEach(function renderPlayer(player) {
      var position = calcMovementPosition(player)
      if (player.isMoving) {
        ctx.fillStyle = 'rgba(250, 236, 0, 1)'
      } else {
        ctx.fillStyle = 'rgba(0, 150, 136, 1)'
      }
      ctx.drawImage(sprites.player, position[0] - 16, position[1] - 25)
      ctx.textAlign = 'right'
      ctx.font = '16px Pacifico'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillText(player.name, position[0] - 25, position[1] + 4)
    })
  }

  function updateDiceScreen(state) {
    if (state.players.length > 0 && prevState.currentPlayer !== state.currentPlayer) {
      gameView.screens.dice.cta.innerText =
        state.players[state.currentPlayer].name + ', ваш ход'
    }
  }

  function loadQuestion(state) {
    var cid = state.players[state.currentPlayer].target
    var qcell = game.staticData.cells[cid]
    var question = game.staticData.questions[qcell.question]
    gameView.screens.question.text.style.display = 'block'
    gameView.screens.question.answerA.style.display = 'inline-block'
    gameView.screens.question.answerB.style.display = 'inline-block'
    gameView.screens.question.answerC.style.display = 'inline-block'
    gameView.screens.question.text.innerText = question.text
    gameView.screens.question.answerA.innerText = question.answers[0]
    gameView.screens.question.answerB.innerText = question.answers[1]
    gameView.screens.question.answerC.innerText = question.answers[2]
    gameView.screens.question.message.setAttribute('class', 'game__guide')
    gameView.screens.question.message.innerText =
      state.players[state.currentPlayer].name + ', ответьте на следующий вопрос:'
  }

  function loadScore(state) {
    var content = state.players.sort(function (a, b) {
      return a.score > b.score ? -1 : a.score === b.score ? 0 : 1
    }).reduce(function (result, player) {
      var scoreLine = '<li class="game__score">' + player.name + ' набрал(а) '
        + player.score + ' очков</li>'
      return result + scoreLine
    }, '')
    gameView.screens.score.results.innerHTML = content
  }

  function updateCongratulations(state) {
    gameView.screens.congratulations.result.innerText =
      'Вы набрали ' + state.players[state.currentPlayer].score +' очков'
  }

  function updateGameplayScreen(state) {
    var className = state.screen === 'SCREEN_GAMEPLAY' ? 'game__canvas'
      : 'game__canvas game__canvas_blur'
    gameView.screens.gameplay.setAttribute('class', className)
  }

  function updateView(state) {
    if (prevState.screen !== state.screen) {
      console.log('Экран изменился!')
      if (state.screen === 'SCREEN_QUESTION') {
        loadQuestion(state)
      }
      if (state.screen === 'SCREEN_SCORE') {
        loadScore(state)
      }
      if (state.screen === 'SCREEN_CONGRATULATIONS') {
        updateCongratulations(state)
      }
      updateGameplayScreen(state)
      updateScreen('intro', state.screen === 'SCREEN_INTRO')
      updateScreen('prepare', state.screen === 'SCREEN_PREPARE')
      updateScreen('dice', state.screen === 'SCREEN_DICE')
      updateScreen('question', state.screen === 'SCREEN_QUESTION')
      updateScreen('congratulations', state.screen === 'SCREEN_CONGRATULATIONS')
      updateScreen('score', state.screen === 'SCREEN_SCORE')
      firstTime = false
    }
    gameView.screens.prepare.list.innerText = makePlayersList(state)
    updateDiceScreen(state)
    renderField(state)
    prevState = state
  }

  function processAnswer(event) {
    var state = game.getState()
    var cid = state.players[state.currentPlayer].target
    var qcell = game.staticData.cells[cid]
    var question = game.staticData.questions[qcell.question]
    var answer = parseInt(event.target.getAttribute('data-id'))
    var isRight = question.right === answer - 1
    event.preventDefault()
    gameView.screens.question.message.setAttribute('class', 'game__guide game__guide_message')
    gameView.screens.question.text.style.display = 'none'
    gameView.screens.question.answerA.style.display = 'none'
    gameView.screens.question.answerB.style.display = 'none'
    gameView.screens.question.answerC.style.display = 'none'
    if (isRight) {
      gameView.screens.question.message.innerText =
        'Правильно! Вам начисляется ' + question.score + ' очков!'
    } else {
      gameView.screens.question.message.innerText =
        'Увы, ответ неверный :( '
    }
    setTimeout(function endAnswer() {
      game.dispatch({
        type: 'GAME_MAKE_ANSWER',
        isRight: isRight,
        score: isRight ? question.score : 0
      })
    }, 1000)
  }

  gameView.screens.question.answerA.addEventListener('click', processAnswer)
  gameView.screens.question.answerB.addEventListener('click', processAnswer)
  gameView.screens.question.answerC.addEventListener('click', processAnswer)

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

  gameView.screens.congratulations.resume.addEventListener('click', function (event) {
    event.preventDefault()
    game.dispatch({type: 'GAME_RESUME'})
  })

  gameView.screens.score.finish.addEventListener('click', function (event) {
    event.preventDefault()
    game.dispatch({type: 'GAME_END'})
  })

  gameView.screens.dice.action.addEventListener('click', function (event) {
    var dice = Date.now() % 6 + 1
    event.preventDefault()
    gameView.screens.dice.result.innerText = 'У вас выпало: ' + dice
    setTimeout(function () {
      game.dispatch({type: 'GAME_MAKE_TURN', dice: dice})
      gameView.screens.dice.result.innerText = 'Бросьте игральную кость!'
    }, 500)
  })

  function animate() {
    game.dispatch({type: 'GAME_NEXT_FRAME', delta: 10})
    setTimeout(animate, 50)
  }

  function loader() {
    var total = Object.getOwnPropertyNames(sprites).length
    Object.getOwnPropertyNames(sprites).forEach((sprite) => {
      var img = new Image()
      img.addEventListener('load', function load() {
        sprites[sprite] = img
        if (--total <= 0) {
          document.getElementById('loading-screen').setAttribute('class', 'game__screen')
          game.subscribe(updateView)
          animate()
        }
      })
      img.src = sprites[sprite]
    })
  }

  loader()
})(__GAME__)
