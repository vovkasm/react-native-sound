import { NativeModules } from 'react-native'

const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource')

const RNSound = NativeModules.RNSound
const IsAndroid = RNSound.IsAndroid

let nextKey = 0

class Sound {
  constructor(source, onError) {
    this._source = resolveAssetSource(source)

    this._loaded = false
    this._key = nextKey++
    this._duration = -1
    this._numberOfChannels = -1
    this._volume = 1
    this._pan = 0
    this._numberOfLoops = 0
    RNSound.prepare(this._source, this._key, (error, props) => {
      if (props) {
        if (typeof props.duration === 'number') {
          this._duration = props.duration
        }
        if (typeof props.numberOfChannels === 'number') {
          this._numberOfChannels = props.numberOfChannels
        }
      }
      if (error === null) {
        this._loaded = true
      }
      onError && onError(error)
    })
  }

  isLoaded() { return this._loaded }
  play(onEnd) {
    if (this._loaded) {
      RNSound.play(this._key, function(successfully) {
        onEnd && onEnd(successfully)
      })
    }
    return this
  }
  pause() {
    if (this._loaded) {
      RNSound.pause(this._key)
    }
    return this
  }

  stop() {
    if (this._loaded) {
      RNSound.stop(this._key)
    }
    return this
  }

  release() {
    if (this._loaded) {
      RNSound.release(this._key)
    }
    return this
  }

  getDuration() { return this._duration }

  getNumberOfChannels() { return this._numberOfChannels }

  getVolume() { return this._volume }

  setVolume(value) {
    this._volume = value
    if (this._loaded) {
      if (IsAndroid) {
        RNSound.setVolume(this._key, value, value)
      } else {
        RNSound.setVolume(this._key, value)
      }
    }
    return this
  }

  getPan() { return this._pan }

  setPan(value) {
    if (this._loaded) {
      RNSound.setPan(this._key, this._pan = value)
    }
    return this
  }

  getNumberOfLoops() { return this._numberOfLoops }

  setNumberOfLoops(value) {
    this._numberOfLoops = value
    if (this._loaded) {
      if (IsAndroid) {
        RNSound.setLooping(this._key, !!value)
      } else {
        RNSound.setNumberOfLoops(this._key, value)
      }
    }
    return this
  }

  getCurrentTime(callback) {
    if (this._loaded) {
      RNSound.getCurrentTime(this._key, callback)
    }
  }

  setCurrentTime(value) {
    if (this._loaded) {
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

Sound.MAIN_BUNDLE = RNSound.MainBundlePath
Sound.DOCUMENT = RNSound.NSDocumentDirectory
Sound.LIBRARY = RNSound.NSLibraryDirectory
Sound.CACHES = RNSound.NSCachesDirectory

export default Sound
