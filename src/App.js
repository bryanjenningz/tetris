import React, { Component } from "react";
import "./App.css";

const blocks = ["7", "L", "S", "Z", "O", "I"];
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const randomInt = (lo, hi) => Math.floor(lo + Math.random() * (hi - lo + 1));
const randomChoice = choices => choices[randomInt(0, choices.length - 1)];

const BLOCK_WIDTH = 10;
const SCREEN_WIDTH = 500;

class App extends Component {
  state = {
    block: randomChoice(blocks),
    futureBlocks: range(0, 300).map(() => randomChoice(blocks)),
    x: 0,
    y: 0,
    grid: range(0, 9).map(() => range(0, 9).map(() => null))
  };

  render() {
    const { grid } = this.state;
    return (
      <div
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH,
          background: "white",
          margin: "0 auto"
        }}
      >
        {grid.map((row, y) => (
          <div key={y}>
            {row.map((color, x) => (
              <div
                key={x}
                style={{
                  width: BLOCK_WIDTH,
                  height: BLOCK_WIDTH,
                  background: color
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default App;
