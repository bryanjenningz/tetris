import React, { Component } from "react";
import "./App.css";

const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
const blocks = ["R", "L", "S", "Z", "O", "I"];
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const randomInt = (lo, hi) => Math.floor(lo + Math.random() * (hi - lo + 1));
const randomChoice = choices => choices[randomInt(0, choices.length - 1)];

const blockRotation = ({ block, rotation }) => {
  switch (block) {
    case "R":
      return [
        [
          [true, true, true, false],
          [false, false, true, false],
          [false, false, false, false],
          [false, false, false, false]
        ],
        [
          [false, true, false, false],
          [false, true, false, false],
          [true, true, false, false],
          [false, false, false, false]
        ],
        [
          [true, false, false, false],
          [true, true, true, false],
          [false, false, false, false],
          [false, false, false, false]
        ],
        [
          [true, true, false, false],
          [true, false, false, false],
          [true, false, false, false],
          [false, false, false, false]
        ]
      ][rotation];
    case "L":
      return [
        [
          [true, true, true, false],
          [true, false, false, false],
          [false, false, false, false],
          [false, false, false, false]
        ],
        [
          [true, true, false, false],
          [false, true, false, false],
          [false, true, false, false],
          [false, false, false, false]
        ],
        [
          [false, false, true, false],
          [true, true, true, false],
          [false, false, false, false],
          [false, false, false, false]
        ],
        [
          [true, false, false, false],
          [true, false, false, false],
          [true, true, false, false],
          [false, false, false, false]
        ]
      ][rotation];
    case "S": {
      const horizontalS = [
        [true, true, false, false],
        [false, true, true, false],
        [false, false, false, false],
        [false, false, false, false]
      ];
      const verticalS = [
        [false, true, false, false],
        [true, true, false, false],
        [true, false, false, false],
        [false, false, false, false]
      ];
      return [horizontalS, verticalS, horizontalS, verticalS][rotation];
    }
    case "Z": {
      const horizontalZ = [
        [true, true, false, false],
        [false, true, true, false],
        [false, false, false, false],
        [false, false, false, false]
      ];
      const verticalZ = [
        [false, true, false, false],
        [true, true, false, false],
        [true, false, false, false],
        [false, false, false, false]
      ];
      return [horizontalZ, verticalZ, horizontalZ, verticalZ][rotation];
    }
    case "O":
      return [
        [true, true, false, false],
        [true, true, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ];
    case "I": {
      const horizontalI = [
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false]
      ];
      const verticalI = [
        [true, false, false, false],
        [true, false, false, false],
        [true, false, false, false],
        [true, false, false, false]
      ];
      return [verticalI, horizontalI, verticalI, horizontalI][rotation];
    }
    default:
      throw new Error(`Invalid block: ${block}`);
  }
};

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
  const blockGrid = blockRotation({ block, rotation });
  return blockGrid.some((row, j) =>
    row.some(
      (isShown, i) =>
        isShown &&
        (x + i < 0 ||
          x + i >= width ||
          y + j >= width ||
          (grid[y + j] && grid[y + j][x + i]))
    )
  );
};

const copy = x => JSON.parse(JSON.stringify(x));

const addBlockToGrid = ({ block, x, y, rotation, grid }) => {
  const newGrid = copy(grid);
  const blockGrid = blockRotation({ block, rotation });
  for (let j = 0; j < blockGrid.length; j++) {
    for (let i = 0; i < blockGrid[0].length; i++) {
      if (blockGrid[j][i] && newGrid[y + j]) {
        newGrid[y + j][x + i] = colors[blocks.indexOf(block)];
      }
    }
  }
  return newGrid;
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
            ...addedGrid.filter(row => !row.every(color => color))
          ];
          this.setState({
            x: INITIAL_X,
            y: INITIAL_Y,
            block: randomChoice(blocks),
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
    window.addEventListener("keydown", e => {
      const { block, x, y, rotation, grid } = this.state;
      switch (e.keyCode) {
        case 37: // left
          if (!isCollision({ block, x: x - 1, y, rotation, grid })) {
            this.setState({ x: x - 1 });
          }
          return;
        case 38: // up
          const rightRotation = (rotation + 1) % 4;
          if (!isCollision({ block, x, y, rotation: rightRotation, grid })) {
            this.setState({ rotation: rightRotation });
          }
          return;
        case 39: // right
          if (!isCollision({ block, x: x + 1, y, rotation, grid })) {
            this.setState({ x: x + 1 });
          }
          return;
        case 40: // down
          if (!isCollision({ block, x, y: y + 1, rotation, grid })) {
            this.setState({ y: y + 1 });
          }
          return;
        default:
          return;
      }
    });
  }

  render() {
    const { grid, block, x, y, rotation } = this.state;
    const blockGrid = blockRotation({ block, rotation });
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
        {blockGrid.map((row, j) => (
          <div key={j}>
            {row.map(
              (isShown, i) =>
                isShown ? (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: (i + x) * BLOCK_WIDTH,
                      top: (j + y) * BLOCK_WIDTH,
                      width: BLOCK_WIDTH,
                      height: BLOCK_WIDTH,
                      background: colors[blocks.indexOf(block)]
                    }}
                  />
                ) : (
                  <span key={i} />
                )
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default App;
