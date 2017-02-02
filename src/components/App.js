import React from 'react';
import io from 'socket.io-client';

import LineChart from './LineChart';

const socket = io();

const styles = {
  height: 300,
  width: 500,
  padding: 30
}

const dummyData = [2, 14, 6];

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      graphs: []
    }
    const socket = this.props.socket;
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.fetchGraphs();
    socket.on('graph updated', (data) => {
      // console.log('in graph updated', data);
      this.fetchGraphs();
    });
  }

  fetchGraphs() {
    fetch('/graphs')
      .then(res => res.json())
      .then(graphs => this.setState({graphs}))
  }

  addGraph(e) {
    console.log('in addGraph');
    e.preventDefault();
    const data = this.refs.symb.value.toUpperCase();
    if (data) {
      this.refs.symb.value = '';
      fetch('/graphs', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({data})
      })
      .then(res => res.json())
      // .then(json => console.log(json))
    }
  }

  listItems() {
    return this.state.graphs.map((i, ind) => (
      <li key={ind}>{i}</li>
    ));
  }

  render() {
    // console.log(this.state);
    return (
      <div>
        <h2>App Component</h2>
        <LineChart {...styles} data={dummyData}/>
        {this.listItems()}
        <form>
          <input
            ref="symb"
            type="text"
            style={{textTransform: "uppercase"}}
            autoFocus
          />
          <button onClick={this.addGraph.bind(this)}>Add</button>
        </form>
      </div>
    )
  }
}
