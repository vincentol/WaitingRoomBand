import React, { Component } from 'react';
import { Grid, Segment, Header, Card, Table, Button, Message, TextArea, Icon } from 'semantic-ui-react';
import Webcam from 'react-webcam';
import { subscribeToTimer, setVibrate, calibrate } from './api';
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
      powerClicked: false,
    }
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleAlert = this.toggleAlert.bind(this);
    this.callibrateArduino = this.callibrateArduino.bind(this);

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

  callibrateArduino() {
    calibrate();
    this.setState({ powerClicked: true });
  }

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    this.setState({ image: imageSrc });
  };

  render() {
    const { expanded, socketVals } = this.state;
    const arr = JSON.parse(socketVals);
    const tempC = arr[0];
    const tempF = arr[1];
    const bpm = arr[2];
    const bloodOx = arr[3]
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
                <div><span className="leftside">Beats Per Minute</span>:<span className="rightside"> 60 - 100</span></div>
                <div><span className="leftside">Temperature (external)</span>:<span className="rightside"> 93.6F or 34C</span></div>
                <div><span className="leftside">Blood Oxygen</span>:<span className="rightside"> 94 - 100</span></div>
              </Message>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row centered>
            <Grid.Column width="3" textAlign="right">
              { !this.state.powerClicked && <Button icon onClick={() => { this.callibrateArduino() }}><Icon name='power' /></Button> }
            </Grid.Column>
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
                        <Table.Cell width={2} negative={bpm < 60 || bpm > 120} positive={!(bpm < 60 || bpm > 120)}>
                          <p className="main">{bpm.toFixed(1)}</p>
                          <p className="sub">BPM</p>
                        </Table.Cell>
                        <Table.Cell width={2} negative={tempF < 90 || tempF > 100} positive={!(tempF < 90 || tempF > 100)}>
                          <p className="main">{`${tempF.toFixed(1)}\xB0F`}</p>
                          <p className="sub">TEMP (F)</p>
                        </Table.Cell>
                        <Table.Cell width={2} negative={tempF < 90 || tempF > 100} positive={!(tempF < 90 || tempF > 100)}>
                          <p className="main">{`${tempC.toFixed(1)}\xB0C`}</p>
                          <p className="sub">TEMP (C)</p>
                        </Table.Cell>
                        <Table.Cell width={2} negative={bloodOx < 94 || bloodOx > 100} positive={!(bloodOx < 94 || bloodOx > 100)}>
                          <p className="main">{`${bloodOx.toFixed(1)}`}</p>
                          <p className="sub">BO</p>
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
            <Grid.Column width="3" />
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
