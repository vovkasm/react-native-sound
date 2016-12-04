import { NativeModules } from 'react-native'

const RNSound = NativeModules.RNSound

const SoundSessionIOS = {
  // iOS
  // On iOS this will configure and activate AVSession. Ideally you should activate session only as needed, and deactivate after sounds played.
  // category one of: 'ambient' (default), 'soloAmbient', 'playback', 'record', 'playAndRecord', 'multiRoute'
  // If session already activated, only category will change.
  //
  // Return Promise
  activate(category) {
    return RNSound.activateSessionIOS(category)
  },

  // iOS
  // Deactivate current audio session.
  //
  // Return Promise
  deactivate() {
    return RNSound.deactivateSessionIOS()
  },
}

export default SoundSessionIOS
