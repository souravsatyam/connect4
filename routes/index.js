var express = require('express');
const { route } = require('./users');
const fs = require('fs');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/new', function (req, res) {
  let matrix = new Array;
  let game_chart = {};
  for (let i=0; i < 6; i++) {
    matrix[i] = new Array;
    for (let j = 0; j < 7; j++) {
      matrix[i][j] = 0;
    }
  }
  game_chart = {
    last_move: 0,
    game_chart: matrix
  }
  fs.writeFile('./gamelog.json', JSON.stringify(game_chart), ()=> {
    return res.status(200).json({status: true});
  })
});


router.post('/move', function (req, res) {
  const {player, move} = req.body;
  

  fs.readFile('./gamelog.json', "utf8",  (err,  data) => {
      let all_move = JSON.parse(data);

      //check if same player made 2 move
      // if (all_move.last_move == player) {
      //   return res.status(403).json({end: false, message: 'Invalid move'});
      // }

      // Check if all move has been made
      if (all_move.game_chart[0][move] !== 0) {
          return res.status(403).json({end: false, message: 'Move cannot be made'});
      }


      
      for (let i=all_move.game_chart.length - 1; i >= 0 ; i--) {
        
        if (all_move.game_chart[i][move] == 0) {
          all_move.game_chart[i][move] = player;
          break;
        }
      }
      
      all_move.last_move = (all_move.last_move == 1 ||  all_move.last_move == 0 ) ? 2: 1;

      fs.writeFile('./gamelog.json', JSON.stringify(all_move), ()=> {
        let winner1 = checkWinner(all_move.game_chart, 1);
        let winner2 = checkWinner(all_move.game_chart, 2);
        if (winner1 === true) {
          return res.status(200).json({end:true, message: "RED wins"});
        }else if (winner2 === true){
          return res.status(200).json({end:true, message: "YELLOW wins"});
        } else {
          return res.status(200).json({end:false});
        }
      })
  })
  

});

router.get('/board', function(req, res) {

  


  fs.readFile('./gamelog.json', "utf8",  (err,  data) => { 
        let all_move = JSON.parse(data);
        let winner1 = checkWinner(all_move.game_chart, 1);
        let winner2 = checkWinner(all_move.game_chart, 2);
        if (winner1 === true) {
          return res.status(200).json({end:true, message: "RED wins"});
        }else if (winner2 === true){
          return res.status(200).json({end:true, message: "YELLOW wins"});
        } 
      return res.status(200).json({data: JSON.parse(data)});
  });
});


function checkWinner(b, val) {
  var win=3, len=b.length, r=0, c=0, dr=0, dl=0;
  for(var i=0;i<len-1;i++){
      for(var j=0;j<len-1;j++){

      // COL WIN CHECK //
          (b[j][i]===val) ? c++ : c=0;

      // ROW WIN CHECK //
          (b[i][j]===val) ? r++ : r=0;

      // DIAG WIN CHECK //
      
          (b[i][j]===val && b[i+1][j+1]===val) ? dr++ : dr=0;
          (b[j][i]===val && b[i+1][j+1]===val) ? dl++ : dl=0;
      // WIN CHECK FOR ALL 4
          if(c===win || r===win){  return true;}
      }
      r=0;
  }

  return false;
}

module.exports = router;
