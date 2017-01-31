import React from 'react';
import io from 'socket.io-client';

const socket = io();

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
      console.log('in graph updated', data);
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
      .then(json => console.log(json))
    }
  }

  listItems() {
    return this.state.graphs.map((i, ind) => (
      <li key={ind}>{i}</li>
    ));
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <h2>App Component</h2>
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
