import React, { Component } from 'react'
import { AppRegistry, Text, View } from 'react-native'

class TestApp extends Component {
  render() {
    return <View>
      <Text>Hello!</Text>
    </View>
  }
}

export default TestApp

AppRegistry.registerComponent('TestApp', () => TestApp)
