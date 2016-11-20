import { NativeModules } from 'react-native'

const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource')

const RNSound = NativeModules.RNSound
const IsAndroid = RNSound.IsAndroid

class Sound {
  constructor(source, props) {
    this._source = source
    this._key = props.key
    this._duration = props.duration
    this._numberOfChannels = props.numberOfChannels
    this._volume = 1
    this._pan = 0
    this._numberOfLoops = 0
  }

  static load(source) {
    resolvedSource = resolveAssetSource(source)
    return RNSound.prepare(resolvedSource).then(props => {
      sound = new Sound(resolvedSource, props)
      sound._key = props.key
      sound._duration = props.duration
      sound._numberOfChannels = props.numberOfChannels
      return sound
    })
  }

  isLoaded() { return this._key !== undefined }
  play(onEnd) {
    if (this.isLoaded()) {
      RNSound.play(this._key, function(successfully) {
        onEnd && onEnd(successfully)
      })
    }
    return this
  }
  pause() {
    if (this.isLoaded()) {
      RNSound.pause(this._key)
    }
    return this
  }

  stop() {
    if (this.isLoaded()) {
      RNSound.stop(this._key)
    }
    return this
  }

  release() {
    if (this.isLoaded()) {
      RNSound.release(this._key)
      delete this._key
    }
    return this
  }

  getDuration() { return this._duration }

  getNumberOfChannels() { return this._numberOfChannels }

  getVolume() { return this._volume }

  setVolume(value) {
    this._volume = value
    if (this.isLoaded()) {
      RNSound.setVolume(this._key, value)
    }
    return this
  }

  getPan() { return this._pan }

  setPan(value) {
    if (this.isLoaded()) {
      RNSound.setPan(this._key, this._pan = value)
    }
    return this
  }

  getNumberOfLoops() { return this._numberOfLoops }

  setNumberOfLoops(value) {
    this._numberOfLoops = value
    if (this.isLoaded()) {
      if (IsAndroid) {
        RNSound.setLooping(this._key, !!value)
      } else {
        RNSound.setNumberOfLoops(this._key, value)
      }
    }
    return this
  }

  getCurrentTime(callback) {
    if (this.isLoaded()) {
      RNSound.getCurrentTime(this._key, callback)
    }
  }

  setCurrentTime(value) {
    if (this.isLoaded()) {
      RNSound.setCurrentTime(this._key, value)
    }
    return this
  }

  // ios only
  setCategory(value) {
    RNSound.setCategory(this._key, value)
  }
}

Sound.enable = function(enabled) {
  RNSound.enable(enabled)
}

Sound.enableInSilenceMode = function(enabled) {
  if (!IsAndroid) {
    RNSound.enableInSilenceMode(enabled)
  }
}

Sound.enable(true)

export default Sound
