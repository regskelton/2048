var game = (function () {

    var cells, size, moves;

    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;
    
        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = createArray.apply(this, args);
        }
    
        return arr;
    }



    var runTests = function () {
        var testBoards = [
            { 
                "in": [
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0]
                ],
                "out":[
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0]
                ],
                "moved":false
            },
            { 
                "in": [
                    [2,0,0,0],
                    [0,2,0,0],
                    [0,0,2,0],
                    [0,0,0,2]
                ],
                "out":[
                    [2,0,0,0],
                    [2,0,0,0],
                    [2,0,0,0],
                    [2,0,0,0]
                ],
                "moved":true
            },
            { 
                "in": [
                    [2,2,0,0],
                    [2,0,2,0],
                    [2,0,0,2],
                    [0,2,2,0]
                ],
                "out":[
                    [4,0,0,0],
                    [4,0,0,0],
                    [4,0,0,0],
                    [4,0,0,0]
                ],
                "moved":true
            },
            { 
                "in": [
                    [0,0,2,2],
                    [2,2,2,0],
                    [2,2,2,2],
                    [2,2,0,2]
                ],
                "out":[
                    [4,0,0,0],
                    [4,2,0,0],
                    [4,4,0,0],
                    [4,2,0,0]
                ],
                "moved":true
            },
            { 
                "in": [
                    [2,4,2,0],
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0],
                ],
                "out":[
                    [2,4,2,0],
                    [0,0,0,0],
                    [0,0,0,0],
                    [0,0,0,0],
                ],
                "moved":false
            },
            { 
                "in": [
                    [16,4,2,0],
                    [32,8,4,2],
                    [64,32,16,4],
                    [128,64,32,16],        
                ],
                "out":[
                    [16,4,2,0],
                    [32,8,4,2],
                    [64,32,16,4],
                    [128,64,32,16],        
                ],
                "moved":false
            },
            { 
                "in": [
                    [16,4,2,0],
                    [32,8,4,2],
                    [64,32,16,4],
                    [128,64,32,16],        
                ],
                "out":[
                    [16,4,2,2],
                    [32,8,4,4],
                    [64,32,16,16],
                    [128,64,32,0],        
                ],
                "move": game.moveUp,
                "moved":true
            },
    
    
    
        ];

        var tests = testBoards;

        for (t = 0; t < tests.length; t++) {
            console.log("Running test " + t);

            var size= tests[t].in[0].length;

            game.newGame(size);

            for ( r =0; r < size; r++) {
                for( c=0; c < size; c++) {
                    game.setCell(r,c,tests[t].in[r][c]);
                }
            }

            if( tests[t].move) {
                moved= tests[t].move();
            } else {
                moved= game.moveLeft();
            }
            
            for ( r =0; r < size; r++) {
                for( c=0; c < size; c++) {
                    out= game.getCell(r,c);
                    if( out != tests[t].out[r][c]) {
                        console.log("Test" + t + "(" + r + "," + c + ")=" + out + ", not " + tests[t].out[r][c] + ".");
                    } else {
                       // console.log("Test" + t + "(" + r + "," + c + ")=" + cells[r][c] + ", yes " + tests[t].out[r][c] + ".");
                    }
                }
            }

            if( moved != tests[t].moved) {
                console.log("Moved - expected " + tests[t].moved +", got" + moved);
            }
        }
    };

    var xmur3= function(str) {
        for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
            h = h << 13 | h >>> 19;
        return function() {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }
  
    var mulberry32 = function(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    var seed = xmur3("apples");

    var rand = mulberry32(seed());
    




    var setCell= function(r,c,v) {
        cells[r][c]= v;
    };

    var getCell= function(r,c) {
        return cells[r][c];
    };
    return {
        newGame: function (inSize) {
            if( inSize < 1) {
                console.log( "Error, grid must be at least 1x1");
            }

            moves=0;
            size= inSize;
            cells = createArray( size, size);

            for ( r =0; r < size; r++) {
                for( c=0; c < size; c++) {
                    cells[r][c]= 0;
                }
            }
        },

        getMoves: function() {
            return moves;
        },

        moveLeft: function() {
            var moved= false;

            //start at top left, and scan cells across each row and column - we can skip the last column, since we never write anything into there
            for ( r =0; r < size; r++) {
                for( c=0; c < size-1; c++) {

                    // if this cell is empty, then scan all columns to right to find first non-empty cell, and move its content to here (if we find one)
                    if( cells[r][c] == 0) {
                        for( d=c; d<size; d++) {
                            if( cells[r][d]!=0) {
                                moved= true;
                                cells[r][c]= cells[r][d];
                                cells[r][d]= 0;
                                break;
                            }
                        }
                    } 

                    //if this cell is not empty, scan right to find first non-empty cell, and if it's the same value as this cell, double our cell, and zero the other one
                    if( cells[r][c] != 0) {
                        for( d=c+1; d<size; d++) {
                            if( cells[r][d]== 0) {
                                continue;
                            }

                            if( cells[r][c]==cells[r][d]) {
                                moved= true;
                                cells[r][c]+=cells[r][d];
                                cells[r][d] = 0;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }

            console.log( "Moved left - " + (moved ? 'yes' : 'no'));

            return moved;
        },

        moveRight: function() {
            var moved= false;

            for ( r =size-1; r >= 0; r--) {
                for( c=size-1; c >=0; c--) {
                    if( cells[r][c] == 0) {
                        for( d=c-1; d>=0; d--) {
                            if( cells[r][d]!=0) {
                                moved= true;
                                cells[r][c]= cells[r][d];
                                cells[r][d]= 0;
                                break;
                            }
                        }
                    } 

                    if( cells[r][c] != 0) {
                        for( d=c-1; d>=0; d--) {
                            if( cells[r][d]== 0) {
                                continue;
                            }

                            if( cells[r][c]==cells[r][d]) {
                                moved= true;
                                cells[r][c]+=cells[r][d];
                                cells[r][d] = 0;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }

            console.log( "Moved right - " + (moved ? 'yes' : 'no'));

            return moved;
        },

        moveUp: function() {
            var moved= false;

            for ( r =0; r < size-1; r++) {
                for( c=0; c < size; c++) {
                    if( cells[r][c] == 0) {
                        for( d=r; d<size; d++) {
                            if( cells[d][c]!=0) {
                                moved= true;
                                cells[r][c]= cells[d][c];
                                cells[d][c]= 0;
                                break;
                            }
                        }
                    } 

                    if( cells[r][c] != 0) {
                        for( d=r+1; d<size; d++) {
                            if( cells[d][c]==0) {
                                continue;
                            }

                            if( cells[r][c]==cells[d][c]) {
                                moved= true;
                                cells[r][c]+=cells[d][c];
                                cells[d][c] = 0;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }

            console.log( "Moved up - " + (moved ? 'yes' : 'no'));

            return moved;
        },

        moveDown: function() {
            var moved= false;

            for ( r =size-1; r >= 0; r--) {
                for( c=size-1; c >=0; c--) {
                    if( cells[r][c] == 0) {
                        for( d=r-1; d>=0; d--) {
                            if( cells[d][c]!=0) {
                                moved= true;
                                cells[r][c]= cells[d][c];
                                cells[d][c]= 0;
                                break;
                            }
                        }
                    } 

                    if( cells[r][c] != 0) {
                        for( d=r-1; d>=0; d--) {
                            if( cells[d][c]==0){
                                continue;
                            }

                            if( cells[r][c]==cells[d][c]) {
                                moved= true;
                                cells[r][c]+=cells[d][c];
                                cells[d][c] = 0;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }

            console.log( "Moved down - " + (moved ? 'yes' : 'no'));

            return moved;
        },

        getCells: function() {
            return cells;
        },

        getCell: function(r,c) {
            return getCell(r,c);
        },

        setCell: function(r,c, value) {
            setCell(r,c,value)
        },

        play: function() {
            var r, c;

            while( true)
            {
                //r= Math.floor(Math.random() * size);
                //c= Math.floor(Math.random() * size);

                r= Math.floor(rand() * size);
                c= Math.floor(rand() * size);

//                console.log( "Play ("+r+","+c+")");

                if( getCell(r,c)==0) {
                    moves++;
                    setCell(r,c,2);
                    console.log( moves + " moves");
                    console.log( cells);
                    return true;
                }
            }
        },

        _tests: function () {
            return runTests();
        }
    }

    
})();

var uiController = (function () {

var DOM = {
        // dimensions: document.querySelector('.info__dimensions--value'),
        // momentum: document.querySelector('.info__momentum--value'),
        // kinetic: document.querySelector('.info__kinetic--value'),
        // potential: document.querySelector('.info__potential--value'),
        // total: document.querySelector('.info__total--value'),
        moves: document.querySelector('.info__moves'),
        board: document.querySelector('.board'),
        moveLeftBtn: document.querySelector('.move_left'),
        moveRightBtn: document.querySelector('.move_right'),
        moveUpBtn: document.querySelector('.move_up'),
        moveDownBtn: document.querySelector('.move_down'),
        moveUndoBtn: document.querySelector('.move_undo'),
    };

    var addBoard= function(size, moves) {
        var text="";

        if (moves > 0){
            text+= '<hr/><div>Move ' + moves + '</div>';                
        }

        for( r=0; r<size; r++) {
            text+= '<tr>';

            for( c=0; c<size; c++) {
                text+=  '<td><div class="cell_' + moves + "_" + r + '_' + c + '"/></td>';
            }
            text+= '</tr>';  
        }

        DOM.board.insertAdjacentHTML('afterbegin', text);                
    }

    return {
        init: function(size, onClick){
            addBoard( size, 0);

            DOM.moveLeftBtn.addEventListener('click', function(){ onClick(game.moveLeft, true)});
            DOM.moveRightBtn.addEventListener('click', function(){ onClick(game.moveRight, false)});
            DOM.moveUpBtn.addEventListener('click', function(){ onClick(game.moveUp, false)});
            DOM.moveDownBtn.addEventListener('click', function(){ onClick(game.moveDown, false)});
        },

        update: function( cells) {
            size= cells[0].length;
            moves= game.getMoves();

            addBoard( size, moves);
                       
            for( r=0; r<size; r++) {   
                for( c=0; c<size; c++) {
                    var txt= ".cell_" + moves + "_" + r + "_" + c;

                    document.querySelector(txt).innerHTML= cells[r][c];
                }
            } 

            DOM.moves.innerHTML= game.getMoves();
        }
    }



/*
<table class="board">
<tr class="row_0">
  <td><div class="cell_0_0"</td>
  <td><div class="cell_0_1"</td>
  <td><div class="cell_0_2"</td>
  <td><div class="cell_0_3"</td>
</tr>
<tr class="row_1">
  <td><div class="cell_1_0"</td>
  <td><div class="cell_1_1"</td>
  <td><div class="cell_1_2"</td>
  <td><div class="cell_1_3"</td>
</tr>
<tr class="row_2">
  <td><div class="cell_2_0"</td>
  <td><div class="cell_2_1"</td>
  <td><div class="cell_2_2"</td>
  <td><div class="cell_2_3"</td>
</tr>
<tr class="row_3">
  <td><div class="cell_3_0"</td>
  <td><div class="cell_3_1"</td>
  <td><div class="cell_3_2"</td>
  <td><div class="cell_3_3"</td>
</tr>
</table>
*/
})();




var controller = (function (game, UICtrl) {
    var timerId;

    var play = function () {
        
        if( !game.moveLeft()) {
            if(!game.moveDown()) {
                if( !game.moveRight()) {
                    if( !game.moveUp()) {
                        console.log("uh oh");

                        clearInterval( timerId);

                        return;
                    } 
                } 
            }
        }
    
        game.play();

        UICtrl.update( game.getCells());
    }

    var makeMove= function(fn, continuous){
        do {
            if( fn())
            {
                game.play();
    
                UICtrl.update( game.getCells());
            } else {
                continuous= false;
            }
        } while (continuous)

    }

    

    
    return {
        init: function () {
            console.log('2048 init');

            

            game._tests();

            UICtrl.init(5, makeMove);

            game.newGame(5);
    
            game.play();  

            UICtrl.update( game.getCells());

            //play();

            timerId= setInterval(play, 5);

            console.log("Jump to hyperspace...");
        }
    };
})(game, uiController);

controller.init();