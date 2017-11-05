import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  caption: {
    justifyContent: 'center',
  },
  captionText: {
    fontWeight: 'bold',
  },
  cell: {
    paddingHorizontal: 8,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
  }
})

export const Cell = props => {
  const caption = props.caption ? <Caption text={props.caption}/> : null
  return <View style={styles.cell}>{caption}{props.children}</View>
}
Cell.propTypes = {
  caption: PropTypes.string,
  children: PropTypes.node,
}

export const Caption = props => {
  return <View style={styles.caption}><Text style={styles.captionText}>{props.text}</Text></View>
}
Caption.propTypes = {
  text: PropTypes.string.isRequired,
}

export const Row = props => {
  return <View style={styles.row}>{props.children}</View>
}
Row.propTypes = {
  children: PropTypes.node
}
