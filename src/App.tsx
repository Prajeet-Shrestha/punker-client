import { Component } from 'react';
import { PhaserGame } from './game/Game.class';
import socketService from './socket/socketService';

// socketService.connect('http://localhost:8085/');

export class App extends Component {
  componentDidMount(): void {
    console.log('hey');
  }
  async connect() {
    const res = await socketService.connect('http://localhost:8085/').catch((err) => {
      console.log(err);
    });
  }
  render() {
    return (
      <div className='App'>
        <div id='canvas_game'></div>
      </div>
    );
  }
}

export default App;
