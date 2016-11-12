import React, { Component } from 'react'
import { Button, Text, View } from 'react-native'

import Sound from '@vovkasm/react-native-sound'

class App extends Component {
  componentDidMount() {
    this.sample1 = new Sound('sample1.wav', Sound.MAIN_BUNDLE)
  }
  render() {
    return <View>
      <Text>Play sample1.wav</Text>
      <Button title="Play" onPress={()=>{
        this.sample1.play()
      }}></Button>
    </View>
  }
}

export default App
