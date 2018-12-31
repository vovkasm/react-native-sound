'use strict'
const path = require('path')

module.exports = {
  projectRoot: path.resolve(__dirname, 'samples/RNSoundSample'),
  watchFolders: [__dirname],

  resolver: {
    extraNodeModules: {
      '@vovkasm/react-native-sound': __dirname
    }
  }
}
