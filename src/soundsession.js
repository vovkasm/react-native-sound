const SoundSessionIOS = {
  activate(category) {
    throw new Error("SoundSession not implemented on this platform")
  },

  // iOS
  // Deactivate current audio session.
  //
  // Return Promise
  deactivate() {
    throw new Error("SoundSession not implemented on this platform")
  },
}

export default SoundSessionIOS
