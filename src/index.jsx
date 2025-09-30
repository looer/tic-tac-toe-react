import React, { useState, useCallback, useMemo } from 'react';
import {createRoot} from 'react-dom/client';
import Confetti from 'react-confetti';
import './index.css';

/*
TODO
+ Rewrite Board to use two loops to make the squares instead of hardcoding them.
- Bold the currently selected item in the move list.
- Add a toggle button that lets you sort the moves in either ascending or descending order.
- When someone wins, highlight the three squares that caused the win.
- Export components
+ Display the location for each move in the format (col, row) in the move history list.
+ When no one wins, display a message about the result being a draw.

*/

function Square(props) {
  const isLast = props.last;
  const hasValue = props.value;
  
  return (
    <button
      className={`
        w-20 h-20 text-4xl font-bold border-2 border-gray-300 
        transition-all duration-200 ease-in-out
        ${isLast 
          ? 'bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-400 shadow-lg transform scale-105' 
          : 'bg-white hover:bg-gray-50 hover:shadow-md'
        }
        ${hasValue 
          ? 'cursor-default' 
          : 'cursor-pointer hover:border-gray-400 active:scale-95'
        }
        ${props.value === 'X' 
          ? 'text-red-500' 
          : props.value === 'O' 
            ? 'text-blue-500' 
            : 'text-gray-400'
        }
        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
      `}
      onClick={() => { props.onClick() }}
      disabled={hasValue}
    >
      {props.value}
    </button>
  )
}

function Board(props) {

  const renderSquare = useCallback((i) => {
    return <Square
      key={i}
      last={props.position === i}
      value={props.squares[i]}
      onClick={() => props.onClick(i)}
    />
  }, [props.position, props.squares, props.onClick])

  function generateBoard(cols, rows) {
    let board = []

    for (let i = 0; i < cols * rows; i++) {
      board.push(renderSquare(i))
    }
    return board
  }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          {generateBoard(3, 3)}
        </div>
      </div>
    );
}



function Game(props) {

  const [state, setState] = useState({
      history: [{
        squares: Array(9).fill(null),
        position: null,
      }],
      stepNumber: 0,
      xIsNext: true
    })


  const handleClick = useCallback((i) => {
    const history = state.history.slice(0, state.stepNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = state.xIsNext ? 'X' : 'O'
    setState({
      history: history.concat([{
        squares: squares,
        position: i,
      }]),
      stepNumber: history.length,
      xIsNext: !state.xIsNext,
    })
  }, [state.history, state.stepNumber, state.xIsNext])

  const jumpTo = useCallback((step) => {
    setState(prevState => ({
      ...prevState,
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    }))
  }, [])
  
    const history = state.history
    
    // Add bounds checking to prevent undefined access
    const current = history[state.stepNumber] || history[history.length - 1]
    const winner = calculateWinner(current.squares)
    
    // Derive confetti state - show confetti only when there's a winner and we're at the latest step
    const showConfetti = winner && state.stepNumber === history.length - 1
    const moves = useMemo(() => history.map((step, move) => {
      let row = 0
      let col = 0

      if (step.position != null) {
        row = Math.ceil((step.position + 1) / 3)
        col = step.position % 3 + 1
      }
      const desc = move ?
        (move % 2 ? 'X' : 'O') + ' in ' + row + ', ' + col :
        'Restart'
      return (
        <li key={move} className='flex items-center justify-between group bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-200 border border-white/20'>
          <span className={`font-medium ${move % 2 ? 'text-red-300' : 'text-blue-300'}`}>
            {desc}
          </span>
          <button 
            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg px-3 py-1 text-sm font-medium text-white ${
              move % 2 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => jumpTo(move)}
          >
            Go to move
          </button>
        </li>
      )
    }), [history, jumpTo])

    let status
    if (winner) {
      status = `Winner is ${winner}!`
    } else if (state.stepNumber === 9) {
      status = 'It`s a Draw!'
    } else {
      status = 'Next player is ' + (state.xIsNext ? 'X' : 'O')

    }

    return (
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {showConfetti && <Confetti />}
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => handleClick(i)}
            position={current.position} />
        </div>
        <div className="game-info bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[300px]">
          <div className={`text-2xl font-bold text-center mb-6 p-4 rounded-xl ${
            winner 
              ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white' 
              : state.stepNumber === 9 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'bg-gradient-to-r from-blue-400 to-purple-500 text-white'
          }`}>
            {status}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-3">Move History</h3>
            <ol className="space-y-2">{moves}</ol>
          </div>
        </div>
      </div>
    );
  }

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className='text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
          Tic Tac Toe
        </h1>
        <p className='text-gray-300 text-lg'>
          Written in React 19, Vite and Tailwind v4</p>
          <p className='text-gray-300 text-lg'>
          Made by{' '}
          <a 
            href='https://github.com/looer' 
            className='text-blue-400 hover:text-blue-300 transition-colors duration-200 underline'
          >
            Lorenzo Cella
          </a>
        </p>
      </div>
      <div className='flex justify-center items-center'>
        <Game />
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)