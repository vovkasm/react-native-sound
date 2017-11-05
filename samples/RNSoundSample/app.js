import React from 'react'
import { Button, ScrollView, StyleSheet, Text } from 'react-native'
import { Sound } from '@vovkasm/react-native-sound'

import { Cell, Row } from './components'
import SessionControl from './session-control'

const samples = {
  sample1: {
    source: {uri:'sample1.wav'},
    caption: 'From bundle raw resources: {uri:\'sample1.wav\'}',
  },
  sample2: {
    source: require('./sample2.wav'),
    options: {
      androidStreamType: 'alarm',
    },
    caption: 'From react assets: require(\'./sample2.wav\')'
  },
  sample3: {
    source: {uri: 'http://www.arbenin.info/Goroshina/12%20Mosty.mp3'},
    caption: 'From internet: {uri:\'http://www.arbenin.info/Goroshina/12%20Mosty.mp3\'}'
  },
}

class App extends React.Component {
  constructor(props, ctx) {
    super(props, ctx)
    this.players = {}
    this.state = {}
  }
  render() {
    const comps = Object.keys(samples).map(id => {
      const sample = samples[id]
      const created = this.state[id] !== undefined
      const loaded = created && this.state[id].loaded === true
      let status = 'not loded'
      if (created) {
        status = loaded ? 'ready' : 'loding...'
      }
      return <Cell key={id} caption={sample.caption}>
        <Row><Text>{status}</Text></Row>
        <Row>
          <Button title="Load" onPress={()=>{ this._create(id) }}/>
          <Button title="Play" onPress={()=>{ this._play(id) }}/>
          <Button title="Pause" onPress={()=>{ this._pause(id) }}/>
          <Button title="Stop" onPress={()=>{ this._stop(id) }}/>
          <Button title="Delete" onPress={()=>{ this._release(id) }}/>
        </Row>
      </Cell>
    })
    return <ScrollView contentContainerStyle={styles.contentContainer}><SessionControl/>{comps}</ScrollView>
  }
  doIfPlayerExists(id, cb) {
    if (this.players[id] === undefined) {
      alert(`Player ${id} not loaded`)
      return
    }
    cb(this.players[id])
  }
  _create = (id) => {
    if (this.players[id] !== undefined) {
      alert(`Player ${id} already loaded`)
      return
    }
    Sound.load(samples[id].source, samples[id].options).then(player => {
      this.players[id] = player
      this.setState({ [id]: { loaded: true }})
    }).catch(e => {
      alert(`error: ${e}`)
    })
    this.setState({
      [id]: { loaded: false },
    })
  }
  _play = (id) => { this.doIfPlayerExists(id, player => player.play()) }
  _pause = (id) => { this.doIfPlayerExists(id, player => player.pause()) }
  _stop = (id) => { this.doIfPlayerExists(id, player => player.stop()) }
  _release = (id) => {
    if (this.players[id] === undefined) {
      alert(`Player ${id} not loaded`)
      return
    }
    this.players[id].release()
    delete this.players[id]
    this.setState({ [id]: undefined })
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 20,
  },
})
export default App
