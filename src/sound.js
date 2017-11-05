import { NativeModules } from 'react-native'
import SoundSession from './soundsession'

const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource')

const RNSound = NativeModules.RNSound

class Sound {
  // Loads the sound from source.
  // options - optional object
  // options.androidStreamType - (Android only) Audio stream type, available types: "alarm","dtmf","music" (default), "notification", "ring", "system", "voice_call".
  static load(source, options) {
    resolvedSource = resolveAssetSource(source)
    return RNSound.prepare(resolvedSource, options || {}).then(function(props) {
      return new Sound(resolvedSource, props)
    })
  }

  constructor(source, props) {
    this._source = source
    this._key = props.key
    this._duration = props.duration
    this._numberOfChannels = props.numberOfChannels
    this._volume = 1
    this._pan = 0
    this._numberOfLoops = 0
  }

  isLoaded() { return this._key !== undefined }

  play(onEnd) {
    if (this.isLoaded()) {
      RNSound.play(this._key, function(successfully) {
        onEnd && onEnd(successfully)
      })
    }
  }

  pause() {
    if (this.isLoaded()) {
      RNSound.pause(this._key)
    }
  }

  stop() {
    if (this.isLoaded()) {
      RNSound.stop(this._key)
    }
  }

  release() {
    if (this.isLoaded()) {
      RNSound.release(this._key)
      delete this._key
    }
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
}

export { SoundSession, Sound }
