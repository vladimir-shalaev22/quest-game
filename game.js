var __GAME__ = {};

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

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
  var ANIMATION_SPEED = 0.001
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
        text: 'Кто может голосовать?',
        answers: [
          'Люди находящиеся под арестом',
          'Люди достигшие 18 лет',
          'Недееспособные'
        ],
        score: 50,
        right: 1
      },
      {
        text: 'Где нужно голосовать?',
        answers: [
          'ТИК',
          'Банкомат',
          'Соц. сети'
        ],
        score: 50,
        right: 0
      },
      {
        text: 'Кто является руководителем Барнаульской городской думы?',
        answers: [
          'Фракции  Барнаульской городской думы',
          'Аппарат  Барнаульской городской думы',
          'Председатель Барнаульской городской думы'
        ],
        score: 100,
        right: 2
      },
      {
        text: 'Сколько депутатов состоит в  Барнаульской городской думе?',
        answers: [
          '7',
          '50',
          '40'
        ],
        score: 100,
        right: 2
      },
      {
        text: 'Какой из комитетов  Барнаульской городской думы не является правовым?',
        answers: [
          'По социальной политике',
          'По бюджету, налогам и финансам',
          'По личным вопросам граждан'
        ],
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
      },
      {
        text: 'Сколько фракций существует в  Барнаульской городской думе?',
        answers: [
          '2',
          '5',
          '12'
        ],
        score: 100,
        right: 1
      },
      {
        text: 'В каком году была основана Барнаульская городская дума?',
        answers: [
          '1785',
          '1954',
          '2001'
        ],
        score: 100,
        right: 0
      },
      {
        text: 'Сколько было зданий у Барнаульской городской думы?',
        answers: [
          '1',
          '4',
          '2'
        ],
        score: 100,
        right: 2
      },
      {
        text: 'Как звали первую женщину — председателя Барнаульской городской думы?',
        answers: [
          'Аношкина Вера Степановна',
          'Уланова Галина Сегеевна',
          'Зубович Людмила Николаевна'
        ],
        score: 150,
        right: 2
      },
      {
        text: 'Сколько районов имеет город Барнаул?',
        answers: [
          '8',
          '5',
          '4'
        ],
        score: 50,
        right: 1
      },
      {
        text: 'Какой номер совета был в 2017 году?',
        answers: [
          'VII',
          'V',
          'X'
        ],
        score: 100,
        right: 0
      },
      {
        text: 'Сколько глав существует в уставе городского округа г. Барнаула Алтайского края?',
        answers: [
          '13',
          '26',
          '9'
        ],
        score: 100,
        right: 0
      },
      {
        text: 'Как изображен герб города Барнаула?',
        answers: [
          'Форма щита. Изображен орел',
          'Форма щита. На зеленом фоне изображена лошадь. На голубом фоне изображена печь',
          'Форма щита. Изображение золотого двуглавого орла. Всадник поражающий копьем дракона'
        ],
        score: 50,
        right: 1
      },
      {
        text: 'Какой из существующих парламентов существует  Барнаульской городской думе?',
        answers: [
          'Одиночный',
          'Палата представителей',
          'Молодежный'
        ],
        score: 100,
        right: 2
      },
      {
        text: 'Депутат городской думы обязан:',
        answers: [
          'Нарушать права человека',
          'Действовать по личной инициативе',
          'Лично принимать участие в заседаниях  Барнаульской городской думы'
        ],
        score: 50,
        right: 2
      },
      {
        text: 'Полномочия Барнаульской городской думы могут быть прекращены в случае?',
        answers: [
          'Принятия Думой решения о самороспуске',
          'Утверждения структуры администрации города по представлению главы города Барнаула.',
          'Утверждения плана приватизации муниципального имущества'
        ],
        score: 100,
        right: 0
      },
      {
        text: 'Главный документ Барнаульской городской думы — это?',
        answers: [
          'Договор',
          'Регламент',
          'Заявление'
        ],
        score: 100,
        right: 1
      },
      {
        text: 'Сколько партий было в выборах 2017 году?',
        answers: [
          '8',
          '5',
          '10'
        ],
        score: 100,
        right: 0
      },
      {
        text: 'На сколько лет избираются созывы Барнаульской городской думы?',
        answers: [
          '3',
          '7',
          '5'
        ],
        score: 100,
        right: 2
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
      {type: CELL_TYPE_QUESTION, position: [370,973], next: 12, question: 2},
      {type: CELL_TYPE_SIMPLE, position: [435,979], next: 13},
      {type: CELL_TYPE_SIMPLE, position: [500,1009], next: 14},
      {type: CELL_TYPE_SKIP, position: [567,1027], next: 15},
      {type: CELL_TYPE_SIMPLE, position: [640,1024], next: 16},
      {type: CELL_TYPE_SIMPLE, position: [710,1030], next: 17},
      {type: CELL_TYPE_SIMPLE, position: [756,976], next: 18},
      {type: CELL_TYPE_SIMPLE, position: [747,903], next: 19},
      {type: CELL_TYPE_SIMPLE, position: [750,835], next: 20},
      {type: CELL_TYPE_QUESTION, position: [700,790], next: 21, question: 3},
      {type: CELL_TYPE_SIMPLE, position: [633,760], next: 22},
      {type: CELL_TYPE_SIMPLE, position: [560,789], next: 23},
      {type: CELL_TYPE_SKIP, position: [487,805], next: 24},
      {type: CELL_TYPE_SIMPLE, position: [417,802], next: 25},
      {type: CELL_TYPE_SIMPLE, position: [342,795], next: 26},
      {type: CELL_TYPE_QUESTION, position: [331,724], next: 27, question: 4},
      {type: CELL_TYPE_SIMPLE, position: [307,658], next: 28},
      {type: CELL_TYPE_SIMPLE, position: [384,651], next: 29},
      {type: CELL_TYPE_SIMPLE, position: [453,636], next: 30},
      {type: CELL_TYPE_SIMPLE, position: [238,561], next: 31},
      {type: CELL_TYPE_SIMPLE, position: [175,523], next: 32},
      {type: CELL_TYPE_QUESTION, position: [124,474], next: 33, question: 5},
      {type: CELL_TYPE_SIMPLE, position: [67,423], next: 34},
      {type: CELL_TYPE_SKIP, position: [66,349], next: 35},
      {type: CELL_TYPE_SIMPLE, position: [117,280], next: 36},
      {type: CELL_TYPE_SIMPLE, position: [195,286], next: 37},
      {type: CELL_TYPE_SIMPLE, position: [202,217], next: 38},
      {type: CELL_TYPE_QUESTION, position: [139,180], next: 39, question: 6},
      {type: CELL_TYPE_SIMPLE, position: [79,138], next: 40},
      {type: CELL_TYPE_SIMPLE, position: [139,93], next: 41},
      {type: CELL_TYPE_QUESTION, position: [187,37], next: 42, question: 7},
      {type: CELL_TYPE_SIMPLE, position: [253,46], next: 43},
      {type: CELL_TYPE_SIMPLE, position: [327,73], next: 44},
      {type: CELL_TYPE_SIMPLE, position: [358,135], next: 45},
      {type: CELL_TYPE_SKIP, position: [288,154], next: 46},
      {type: CELL_TYPE_SIMPLE, position: [328,213], next: 47},
      {type: CELL_TYPE_SIMPLE, position: [376,261], next: 48},
      {type: CELL_TYPE_SIMPLE, position: [321,310], next: 49},
      {type: CELL_TYPE_SKIP, position: [309,378], next: 50},
      {type: CELL_TYPE_QUESTION, position: [372,420], next: 51, question: 8},
      {type: CELL_TYPE_SIMPLE, position: [432,460], next: 52},
      {type: CELL_TYPE_SIMPLE, position: [477,517], next: 53},
      {type: CELL_TYPE_SIMPLE, position: [543,543], next: 54},
      {type: CELL_TYPE_SIMPLE, position: [616,529], next: 55},
      {type: CELL_TYPE_SIMPLE, position: [682,486], next: 56},
      {type: CELL_TYPE_SIMPLE, position: [639,424], next: 57},
      {type: CELL_TYPE_SKIP, position: [636,353], next: 58},
      {type: CELL_TYPE_SIMPLE, position: [708,343], next: 59},
      {type: CELL_TYPE_QUESTION, position: [702,268], next: 60, question: 9},
      {type: CELL_TYPE_SKIP, position: [753,219], next: 61},
      {type: CELL_TYPE_SIMPLE, position: [691,186], next: 62},
      {type: CELL_TYPE_SIMPLE, position: [708,117], next: 63},
      {type: CELL_TYPE_SIMPLE, position: [648,76], next: 64},
      {type: CELL_TYPE_SIMPLE, position: [574,73], next: 65},
      {type: CELL_TYPE_SIMPLE, position: [514,36], next: 66},
      {type: CELL_TYPE_SIMPLE, position: [1220,1164], next: 67},
      {type: CELL_TYPE_SIMPLE, position: [1278,1116], next: 68},
      {type: CELL_TYPE_SIMPLE, position: [1223,1059], next: 69},
      {type: CELL_TYPE_QUESTION, position: [1275,1003], next: 70, question: 10},
      {type: CELL_TYPE_SIMPLE, position: [1300,933], next: 71},
      {type: CELL_TYPE_SIMPLE, position: [1353,981], next: 72},
      {type: CELL_TYPE_SIMPLE, position: [1368,1047], next: 73},
      {type: CELL_TYPE_SKIP, position: [1408,1107], next: 74},
      {type: CELL_TYPE_SIMPLE, position: [1459,1156], next: 75},
      {type: CELL_TYPE_SIMPLE, position: [1528,1156], next: 76},
      {type: CELL_TYPE_QUESTION, position: [11524,1083], next: 77, question: 11},
      {type: CELL_TYPE_SIMPLE, position: [1513,1011], next: 78},
      {type: CELL_TYPE_SIMPLE, position: [1450,978], next: 79},
      {type: CELL_TYPE_SIMPLE, position: [1446,907], next: 80},
      {type: CELL_TYPE_SIMPLE, position: [1462,835], next: 81},
      {type: CELL_TYPE_SIMPLE, position: [1479,765], next: 82},
      {type: CELL_TYPE_SKIP, position: [1407,751], next: 83},
      {type: CELL_TYPE_SIMPLE, position: [1345,712], next: 84},
      {type: CELL_TYPE_SIMPLE, position: [1296,658], next: 85},
      {type: CELL_TYPE_SIMPLE, position: [1270,727], next: 86},
      {type: CELL_TYPE_SKIP, position: [1251,790], next: 87},
      {type: CELL_TYPE_SIMPLE, position: [1179,798], next: 88},
      {type: CELL_TYPE_SIMPLE, position: [1122,846], next: 89},
      {type: CELL_TYPE_SIMPLE, position: [1123,917], next: 90},
      {type: CELL_TYPE_SIMPLE, position: [1054,954], next: 91},
      {type: CELL_TYPE_SKIP, position: [1063,1021], next: 92},
      {type: CELL_TYPE_SIMPLE, position: [1070,1092], next: 93},
      {type: CELL_TYPE_SIMPLE, position: [1002,1114], next: 94},
      {type: CELL_TYPE_QUESTION, position: [952,1063], next: 95, question: 12},
      {type: CELL_TYPE_SIMPLE, position: [897,1012], next: 96},
      {type: CELL_TYPE_SKIP, position: [892,945], next: 97},
      {type: CELL_TYPE_QUESTION, position: [925,877], next: 98, question: 13},
      {type: CELL_TYPE_SIMPLE, position: [928,805], next: 99},
      {type: CELL_TYPE_QUESTION, position: [970,753], next: 100, question: 14},
      {type: CELL_TYPE_SIMPLE, position: [1032,723], next: 101},
      {type: CELL_TYPE_SIMPLE, position: [1066,658], next: 102},
      {type: CELL_TYPE_SIMPLE, position: [994,654], next: 103},
      {type: CELL_TYPE_SIMPLE, position: [928,636], next: 104},
      {type: CELL_TYPE_SKIP, position: [850,561], next: 105},
      {type: CELL_TYPE_SIMPLE, position: [838,492], next: 106},
      {type: CELL_TYPE_SIMPLE, position: [892,447], next: 107},
      {type: CELL_TYPE_QUESTION, position: [961,424], next: 108, question: 15},
      {type: CELL_TYPE_SIMPLE, position: [1020,464], next: 109},
      {type: CELL_TYPE_SIMPLE, position: [1072,519], next: 110},
      {type: CELL_TYPE_SIMPLE, position: [1138,546], next: 111},
      {type: CELL_TYPE_SKIP, position: [1152,472], next: 112},
      {type: CELL_TYPE_SIMPLE, position: [1144,403], next: 113},
      {type: CELL_TYPE_SIMPLE, position: [1095,354], next: 114},
      {type: CELL_TYPE_SKIP, position: [1024,325], next: 115},
      {type: CELL_TYPE_QUESTION, position: [960,291], next: 116, question: 16},
      {type: CELL_TYPE_SIMPLE, position: [891,265], next: 117},
      {type: CELL_TYPE_SIMPLE, position: [840,219], next: 118},
      {type: CELL_TYPE_SIMPLE, position: [900,180], next: 119},
      {type: CELL_TYPE_QUESTION, position: [969,151], next: 120, question: 17},
      {type: CELL_TYPE_SIMPLE, position: [1033,120], next: 121},
      {type: CELL_TYPE_SIMPLE, position: [1102,121], next: 122},
      {type: CELL_TYPE_SIMPLE, position: [1147,175], next: 123},
      {type: CELL_TYPE_SIMPLE, position: [1158,238], next: 124},
      {type: CELL_TYPE_SIMPLE, position: [1198,295], next: 125},
      {type: CELL_TYPE_QUESTION, position: [1219,366], next: 126, question: 18},
      {type: CELL_TYPE_SIMPLE, position: [1254,423], next: 127},
      {type: CELL_TYPE_SIMPLE, position: [1308,468], next: 128},
      {type: CELL_TYPE_SIMPLE, position: [1363,433], next: 129},
      {type: CELL_TYPE_SIMPLE, position: [1405,495], next: 130},
      {type: CELL_TYPE_SKIP, position: [1452,547], next: 131},
      {type: CELL_TYPE_SIMPLE, position: [1522,546], next: 132},
      {type: CELL_TYPE_QUESTION, position: [1513,477], next: 133, question: 19},
      {type: CELL_TYPE_SIMPLE, position: [1558,421], next: 134},
      {type: CELL_TYPE_SIMPLE, position: [1500,373], next: 135},
      {type: CELL_TYPE_SIMPLE, position: [1459,310], next: 136},
      {type: CELL_TYPE_SIMPLE, position: [1461,234], next: 137},
      {type: CELL_TYPE_SIMPLE, position: [1395,240], next: 138},
      {type: CELL_TYPE_SKIP, position: [1351,181], next: 139},
      {type: CELL_TYPE_SIMPLE, position: [1380,123], next: 140},
      {type: CELL_TYPE_SIMPLE, position: [1443,84], next: 141},
      {type: CELL_TYPE_FINISH, position: [1531,54], next: 141},
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
    'player': 'images/player.png',
    'background': 'images/background.jpg'
  }

  var lasttime = 0;

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
      ctx.drawImage(sprites.background, 0, 0)
      game.staticData.cells.forEach(function renderCell(cell, index) {
        var sprite;
        var offset;
        if (
          viewport &&
          cell.position[0] + 46 < viewport[0] ||
          cell.position[0] - 46 > viewport[0] + 800 ||
          cell.position[1] + 46 < viewport[1] ||
          cell.position[1] - 46 > viewport[1] + 600
        ) {
          return false
        }
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
        if (cell.type === 'CELL_TYPE_SIMPLE') {
          ctx.textAlign = 'center'
          ctx.font = '14px Pacifico'
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.fillText(index, cell.position[0], cell.position[1] + 2)
        }
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

  function updatePrepare(state) {
    if (state.players.length !== prevState.players.length) {
      var className = state.players.length > 0 ?
        'game__start' : 'game__start game__start_disabled'
      gameView.screens.prepare.start.setAttribute('class', className)
    }
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
    updatePrepare(state)
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
    if (name !== '' && game.getState().players.length < 5) {
      gameView.screens.prepare.name.value = ''
      game.addPlayer({name: name})
    }
  })

  gameView.screens.prepare.start.addEventListener('click', function (event) {
    event.preventDefault()
    if (game.getState().players.length > 0) {
      game.dispatch({type: 'GAME_START'})
    }
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

  function animate(time) {
    game.dispatch({type: 'GAME_NEXT_FRAME', delta: time - lasttime})
    lasttime = time
    requestAnimationFrame(animate)
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
