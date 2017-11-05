import React from 'react'
import { Button, Picker, StyleSheet } from 'react-native'
import { SoundSession } from '@vovkasm/react-native-sound'

import { Cell, Row } from './components'

const styles = StyleSheet.create({
  sessionCategory: {
    flex: 1,
  }
})

class SessionControl extends React.Component {
  constructor(props, ctx) {
    super(props, ctx)
    this.state = {
      sessionCategory: 'soloAmbient',
    }
  }
  render() {
    return <Cell caption="Audio Session">
      <Row>
        <Picker style={styles.sessionCategory} selectedValue={this.state.sessionCategory} onValueChange={this.setCategory}>
          <Picker.Item label="ambient" value="ambient"/>
          <Picker.Item label="soloAmbient" value="soloAmbient"/>
          <Picker.Item label="playback" value="playback"/>
          <Picker.Item label="record" value="record"/>
        </Picker>
      </Row>
      <Row>
        <Button title="Activate" onPress={this.activateSession}/>
        <Button title="Deactivate" onPress={this.deactivateSession}/>
      </Row>
    </Cell>
  }
  setCategory = (cat) => {
    this.setState({sessionCategory: cat})
  }
  activateSession = () => {
    SoundSession.activate(this.state.sessionCategory).then(()=>{
      alert('activated successfully')
    }).catch(e => {
      alert('error: ' + e)
    })
  }
  deactivateSession = () => {
    SoundSession.deactivate().then(()=>{
      alert('deactivated successfully')
    }).catch(e => {
      alert('error: ' + e)
    })
  }
}

export default SessionControl
