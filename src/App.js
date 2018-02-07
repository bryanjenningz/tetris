import React, { Component } from "react";
import "./App.css";

const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
const blocks = ["7", "L", "S", "Z", "O", "I"];
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const randomInt = (lo, hi) => Math.floor(lo + Math.random() * (hi - lo + 1));
const randomChoice = choices => choices[randomInt(0, choices.length - 1)];

const scoreToDropTime = score => {
  const minScoreToTime = {
    0: 1000,
    10: 900,
    20: 800,
    30: 700,
    40: 600,
    50: 500,
    60: 450,
    70: 400,
    80: 350,
    90: 300,
    100: 250,
    110: 225,
    120: 200
  };
  let dropTime = null;
  for (const minScore in minScoreToTime) {
    if (score >= Number(minScore)) {
      dropTime = minScoreToTime[minScore];
    }
  }
  return dropTime;
};

const isCollision = ({ block, x, y, rotation, grid }) => {
  const width = Math.round(SCREEN_WIDTH / BLOCK_WIDTH);
  return x < 0 || x >= width || y >= width;
};

const addBlockToGrid = ({ block, x, y, rotation, grid }) => {
  return [
    ...grid.slice(0, y),
    [
      ...grid[y].slice(0, x),
      blocks[colors.indexOf(block)],
      ...grid[y].slice(x + 1)
    ],
    ...grid.slice(y + 1)
  ];
};

const BLOCK_WIDTH = 50;
const SCREEN_WIDTH = 500;
const INITIAL_X = 4;
const INITIAL_Y = 0;

class App extends Component {
  state = {
    block: randomChoice(blocks),
    futureBlocks: range(0, 300).map(() => randomChoice(blocks)),
    x: INITIAL_X,
    y: INITIAL_Y,
    rotation: 0,
    grid: range(0, 9).map(() => range(0, 9).map(() => null)),
    score: 0,
    lastDropTime: Date.now()
  };

  componentDidMount() {
    const tick = () => {
      const { lastDropTime, score, x, y, block, rotation, grid } = this.state;
      const dropTime = scoreToDropTime(score);
      if (lastDropTime + dropTime <= Date.now()) {
        if (isCollision({ block, x, y: y + 1, rotation, grid })) {
          const addedGrid = addBlockToGrid({ block, x, y, rotation, grid });
          const fullRows = addedGrid.filter(row => row.every(color => color));
          const fullRowsRemovedGrid = [
            ...fullRows.map(() => range(0, 9).map(() => null)),
            ...addedGrid.filter(row => row.some(color => !color))
          ];
          this.setState({
            x: INITIAL_X,
            y: INITIAL_Y,
            score: score + fullRows.length,
            lastDropTime: Date.now(),
            grid: fullRowsRemovedGrid
          });
        } else {
          this.setState({ y: y + 1, lastDropTime: Date.now() });
        }
      }
    };
    setInterval(tick, 10);
  }

  render() {
    const { grid, block, x, y } = this.state;
    return (
      <div
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH,
          background: "white",
          margin: "0 auto",
          position: "relative"
        }}
      >
        {grid.map((row, y) => (
          <div key={y}>
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  position: "absolute",
                  left: x * BLOCK_WIDTH,
                  top: y * BLOCK_WIDTH,
                  width: BLOCK_WIDTH,
                  height: BLOCK_WIDTH,
                  background: color
                }}
              />
            ))}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: x * BLOCK_WIDTH,
            top: y * BLOCK_WIDTH,
            width: BLOCK_WIDTH,
            height: BLOCK_WIDTH,
            background: colors[blocks.indexOf(block)]
          }}
        />
      </div>
    );
  }
}

export default App;
