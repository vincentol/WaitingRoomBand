import React, { Component } from 'react';
import './App.css';
import { Grid, Segment, Header, Card, Table, Button, Message } from 'semantic-ui-react';
import { subscribeToTimer, setVibrate } from './api';

class App extends Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
      alerting: false,
      socketVals: '[ 0, 0, 0, 0 ]',
    }
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleAlert = this.toggleAlert.bind(this);

    subscribeToTimer((err, socketVals) => this.setState({
      socketVals
    }));
  }

  componentDidMount() {
    console.log('here');
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('http://localhost:5000/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  toggleExpanded() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  toggleAlert() {
    const { alerting } = this.state;
    setVibrate(!alerting);
    this.setState({ alerting: !alerting });
  }

  render() {
    const { expanded, socketVals } = this.state;
    const arr = JSON.parse(socketVals);
    const tempC = arr[0];
    const tempF = arr[1];
    const bpm = arr[2];
    const bpmavg = arr[3];
    return (
      <div className="App">
        <Grid as={Segment}>
          <Grid.Row>
            <Grid.Column width="16">
              <Header as="h2">
                Waiting Room Band
              </Header>
              <Message info>
                <Message.Header>Standards</Message.Header>
                <p>BPM: 60 - 100</p>
                <p>Temperature - 98.6F or 37C</p>
                <p>Blood Pressure - ###</p>
              </Message>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row centered>
            <Grid.Column width="10" textAlign="center">
              <Card fluid raised>
                <Card.Content>
                  <Table basic="very" celled>
                    <Table.Body>
                      <Table.Row textAlign="center">
                        <Table.Cell>
                          Band #0000
                        </Table.Cell>
                        <Table.Cell>
                          BPM = {bpm.toFixed(2)} <br />
                          Average BPM = {bpmavg.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell>
                          Temperature = <br /> {`${tempC.toFixed(2)}C / ${tempF.toFixed(2)}F`}
                        </Table.Cell>
                        <Table.Cell>
                          Blood Pressure = {'todo'}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                  <Button className="show-button" onClick={() => this.toggleExpanded()}> { expanded ? 'show less' : 'show more' } </Button>
                  { expanded &&
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width="16">
                          Extra info here
                        </Grid.Column>
                      </Grid.Row>
                      <Grid.Row>
                        <Grid.Column width="16">
                          <Button primary fluid onClick={() => this.toggleAlert()}>
                            { this.state.alerting ? 'Cancel': 'Call In' }
                          </Button>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  }
                </Card.Content>
              </Card>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
