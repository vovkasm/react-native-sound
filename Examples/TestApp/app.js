import React, { Component } from 'react'
import { Button, Text, View } from 'react-native'
import Sound from '@vovkasm/react-native-sound'

class App extends Component {
  componentDidMount() {
    this.sample1 = new Sound({uri:'sample1.wav'})
    this.sample2 = new Sound(require('./sample2.wav'))
  }
  render() {
    return <View>
      <Text>Play sample1.wav from app bundle (uri:'sample1.wav')</Text>
      <Button title="Play sample1.wav" onPress={()=>{ this.sample1.play() }}></Button>
      <Text>Play sample2.wav from assets ("require('./sample2.wav')")</Text>
      <Button title="Play sample2.wav" onPress={()=>{ this.sample2.play() }}></Button>
    </View>
  }
}

export default App
