# @vovkasm/react-native-sound

React Native module for playing sound clips on iOS and Android.

## Feature matrix

Feature | iOS | Android
---|---|---|---
Load sound from the app bundle | ✓ | ✓
Load sound from other directories | ✓ | ✓
Load sound from the network | ✓ | ✓
Play sound | ✓ | ✓
Playback completion callback | ✓ | ✓
Pause | ✓ | ✓
Resume | ✓ | ✓
Stop | ✓ | ✓
Release resource | ✓ | ✓
Get duration | ✓ | ✓
Get number of channels | ✓ |
Get/set volume | ✓ | ✓
Get/set pan | ✓ |
Get/set loops | ✓ | ✓
Get/set current time | ✓ | ✓

## Installation

Install and link package from your app directory:

```sh
npm install @vovkasm/react-native-sound --save
react-native link
```

## Demo project

TODO...

## Basic usage

```js
import Sound from '@vovkasm/react-native-sound';

const whoosh = new Sound(require('./whoosh.mp3'), (error) => {
  if (error) {
    console.log('failed to load the sound', error);
  } else { // loaded successfully
    console.log('duration in seconds: ' + whoosh.getDuration() +
        'number of channels: ' + whoosh.getNumberOfChannels());
  }
});

// Play the sound with an onEnd callback
whoosh.play((success) => {
  if (success) {
    console.log('successfully finished playing');
  } else {
    console.log('playback failed due to audio decoding errors');
  }
});

// Reduce the volume by half
whoosh.setVolume(0.5);

// Position the sound to the full right in a stereo field
whoosh.setPan(1);

// Loop indefinitely until stop() is called
whoosh.setNumberOfLoops(-1);

// Get properties of the player instance
console.log('volume: ' + whoosh.getVolume());
console.log('pan: ' + whoosh.getPan());
console.log('loops: ' + whoosh.getNumberOfLoops());

// Enable playback in silence mode (iOS only)
// Sound.enableInSilenceMode(true);

// Seek to a specific point in seconds
whoosh.setCurrentTime(2.5);

// Get the current playback point in seconds
whoosh.getCurrentTime((seconds) => console.log('at ' + seconds));

// Pause the sound
whoosh.pause();

// Stop the sound and rewind to the beginning
whoosh.stop();

// Release the audio player resource
whoosh.release();
```

## API

TODO... generate automatically from code

## THANKS

Thanks to Zhen Wang for his hard work! He is author of react-native-sound from which this package was initially forked.

## License

This project is licensed under the MIT License.
