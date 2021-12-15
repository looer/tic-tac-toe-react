import React from 'react';
import ReactDOM from 'react-dom';
import ConfettiExplosion from '@reonomy/react-confetti-explosion';
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
  const last = props.last ? "last" : "square";
  return (
    <button
      className={last}
      onClick={() => { props.onClick() }}
      style={{ color: props.value === 'X' ? 'red' : 'blue' }}
    >
      {props.value}
    </button>
  )
}


class Board extends React.Component {

  renderSquare(i) {
    return <Square
      key={i}
      last={this.props.position === i}
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
    />
  }

  generateRow = (index, max) => {
    let rows = []

    for (index; index < max; index++) {
      rows.push(this.renderSquare(index))
    }
    return rows
  }

  generateBoard = (cols, rows) => {
    let board = []

    for (let i = 0; i < cols * rows; i++) {
      if (i % cols === 0) {
        board.push(
          <div className="board-row" key={i}>
            {this.generateRow(i, i + cols)}
          </div>
        )
      }
    }
    return board
  }

  render() {
    return (
      <div>
        <div>{this.generateBoard(3, 3)}</div>
      </div>
    );
  }
}


class Game extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: null,
      }],
      isExploding: false,
      stepNumber: 0,
      xIsNext: true
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O'
    this.setState({
      history: history.concat([{
        squares: squares,
        position: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      isExploding: false,
    })
  }
  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber]
    const winner = calculateWinner(current.squares)

    if (winner && !this.state.isExploding) {
      this.setState({
        isExploding: true,
      })
    }
    const moves = history.map((step, move) => {
      let row = 0
      let col = 0

      if (step.position != null) {
        row = Math.ceil((step.position + 1) / 3)
        col = step.position % 3 + 1
      }
      const desc = move ?
        'Go to move: ' + (move % 2 ? 'X' : 'O') + ' in ' + row + ', ' + col :
        'Restart'
      return (
        <li key={move}>
          <button className='history'
            style={{
              backgroundColor: move % 2 ? 'rgb(136, 5, 31)' : 'rgb(2, 2, 128)',
              boxShadow: move % 2 ? '0px 0px 6px 2px rgb(136, 40, 61)' : '0px 0px 6px 2px rgb(40, 40, 128)',
            }}
            onClick={() => this.jumpTo(move)}>
            {desc}</button>
        </li>
      )
    })

    let status
    if (winner) {
      status = `Winner is ${winner}!`
    } else if (this.state.stepNumber === 9) {
      status = 'It`s a Draw!'
    } else {
      status = 'Next player is ' + (this.state.xIsNext ? 'X' : 'O')

    }

    return (
      <div className="game">
        {this.state.isExploding && <ConfettiExplosion />}
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            position={current.position} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
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

ReactDOM.render(
  <div>
    <h1>Tic Tac Toe</h1>
    <p className='subtitle'>Written in React - Made by <a href='https://github.com/looer'>Lorenzo Cella</a></p>

    <Game />
  </div>,
  document.getElementById('root')
);