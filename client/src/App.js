import React, { Component } from 'react';
import { Grid, Segment, Header, Card, Table, Button, Message, TextArea } from 'semantic-ui-react';
import Webcam from 'react-webcam';
import { subscribeToTimer, setVibrate } from './api';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
      alerting: false,
      socketVals: '[ 0, 0, 0, 0 ]',
      image: null,
      notes: '',
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

  // Example api call for testing
  callApi = async () => {
    const response = await fetch('http://localhost:5000/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  // toggles expanded card
  toggleExpanded() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  // calls setVibrate to tell arduino to start vibration motor
  toggleAlert() {
    const { alerting } = this.state;
    setVibrate(!alerting);
    this.setState({ alerting: !alerting });
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  }

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    this.setState({ image: imageSrc });
  };

  render() {
    const { expanded, socketVals } = this.state;
    // const arr = JSON.parse(socketVals);
    const arr = [35, 0, 0, 85]
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
              <Message info compact>
                <Message.Header>Standard Readings</Message.Header>
                <div><span className="leftside">BPM</span>:<span className="rightside"> 60 - 100</span></div>
                <div><span className="leftside">Temperature (external)</span>:<span className="rightside"> 93.6F or 34C</span></div>
                <div><span className="leftside">Blood Pressure</span>:<span className="rightside"> ###</span></div>
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
                        <Table.Cell width={2}>
                          <p className="main">0000</p>
                          <p className="sub">BAND ID</p>
                        </Table.Cell>
                        <Table.Cell width={2} negative={bpmavg < 60 || bpm > 120} positive={!(bpmavg < 60 || bpm > 120)}>
                          <p className="main">{bpm.toFixed(1)}</p>
                          <p className="sub">BPM</p>
                        </Table.Cell>
                        <Table.Cell width={2} negative={bpmavg < 60 || bpm > 120} positive={!(bpmavg < 60 || bpm > 120)}>
                          <p className="main">{bpmavg.toFixed(1)}</p>
                          <p className="sub">AVG BPM</p>
                        </Table.Cell>
                        <Table.Cell width={2} negative={tempF < 90 || tempF > 100} positive={!(tempF < 90 || tempF > 100)}>
                          <p className="main">{`${tempF.toFixed(1)}\xB0F`}</p>
                          <p className="sub">TEMP (F)</p>
                        </Table.Cell>
                        <Table.Cell width={2} negative={tempF < 90 || tempF > 100} positive={!(tempF < 90 || tempF > 100)}>
                          <p className="main">{`${tempC.toFixed(1)}\xB0C`}</p>
                          <p className="sub">TEMP (C)</p>
                        </Table.Cell>
                        <Table.Cell width={2}>
                          <p className="main">TODO</p>
                          <p className="sub">BP</p>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                  <Button className="show-button" onClick={() => this.toggleExpanded()}> { expanded ? 'show less' : 'show more' } </Button>
                  { expanded &&
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width="8">
                          { this.state.image ?
                            (<div>
                              <Button fluid onClick={() => this.setState({ image: null })}>Retake</Button>
                              <br />
                              <img src={this.state.image} />
                            </div>)
                            :
                            (<div>
                              <Button fluid onClick={this.capture}>Capture photo</Button>
                               <Webcam
                                 audio={false}
                                 height={280}
                                 ref={this.setRef}
                                 screenshotFormat="image/jpeg"
                                 width={350}
                               />
                             </div>)
                           }
                        </Grid.Column>
                        <Grid.Column width="8">
                          <TextArea autoHeight placeholder='Patient Notes...' value={this.state.notes} onChange={(e, inputState) => { this.setState({ notes: inputState.value }); }} />
                        </Grid.Column>
                      </Grid.Row>
                      <Grid.Row>
                        <Grid.Column width="16">
                          <Button color="green" fluid onClick={() => this.toggleAlert()}>
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
