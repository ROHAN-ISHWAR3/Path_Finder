import React, { Component } from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import './PathfindingVisualizer.css';

const DEFAULT_START_NODE_ROW = 10;
const DEFAULT_START_NODE_COL = 15;
const DEFAULT_FINISH_NODE_ROW = 10;
const DEFAULT_FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      startNode: { row: DEFAULT_START_NODE_ROW, col: DEFAULT_START_NODE_COL },
      finishNode: { row: DEFAULT_FINISH_NODE_ROW, col: DEFAULT_FINISH_NODE_COL },
    };
  }

  componentDidMount() {
    this.updateGrid();
  }

  updateGrid() {
    const { startNode, finishNode } = this.state;
    const grid = [];
    for (let row = 0; row < 20; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        currentRow.push(this.createNode(col, row));
      }
      grid.push(currentRow);
    }
    this.setState({ grid });
  }

  createNode(col, row) {
    const { startNode, finishNode } = this.state;
    return {
      col,
      row,
      isStart: row === startNode.row && col === startNode.col,
      isFinish: row === finishNode.row && col === finishNode.col,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  }

  getNewGridWithWallToggled(grid, row, col) {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  }

  handleMouseDown(row, col) {
    const newGrid = this.getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = this.getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  handleSetStart(row, col) {
    const { finishNode } = this.state;
    if (row === finishNode.row && col === finishNode.col) return; // Prevent setting start node to finish node position

    this.setState(
      { startNode: { row, col } },
      () => this.updateGrid() // Update grid after setting start node
    );
  }

  handleSetFinish(row, col) {
    const { startNode } = this.state;
    if (row === startNode.row && col === startNode.col) return; // Prevent setting finish node to start node position

    this.setState(
      { finishNode: { row, col } },
      () => this.updateGrid() // Update grid after setting finish node
    );
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const { grid, startNode, finishNode } = this.state;
    const startNodeObject = grid[startNode.row][startNode.col];
    const finishNodeObject = grid[finishNode.row][finishNode.col];
    const visitedNodesInOrder = dijkstra(grid, startNodeObject, finishNodeObject);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeObject);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <>
        <nav className="navbar sticky-top navbar-dark bg-dark">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">Path Visualizer</span>
            <div className="mb-0">
              <button onClick={() => this.visualizeDijkstra()}>
                Visualize Dijkstra's Algorithm
              </button>
            </div>
          </div>
        </nav>

        <div className="grid">
          <div id="mainText">
            <ul>
              <li>
                <div className="node-start"></div>Start Node
              </li>
              <li>
                <div className="node-finish"></div>Target Node
              </li>
              <li>
                <div className="node-unvisited"></div>Unvisited Node
              </li>
              <li>
                <div className="visited"></div>
                <div className="node-visited"></div>Visited Nodes
              </li>
              <li>
                <div className="node-shortest-path"></div>Shortest-path Node
              </li>
              <li>
                <div className="node-wall"></div>Wall Node
              </li>
            </ul>
          </div>
          <div id="algorithmDescriptor">
            Dijkstra's Algorithm{' '}
            <i>
              <b>guarantees</b>
            </i>{' '}
            the shortest path!
          </div>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx}>
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall } = node;
                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    row={row}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                    onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                    onMouseUp={() => this.handleMouseUp()}
                    onClick={() => this.handleSetStart(row, col)} // Set start node on click
                    onContextMenu={(e) => {
                      e.preventDefault();
                      this.handleSetFinish(row, col); // Set finish node on right-click
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </>
    );
  }
}
