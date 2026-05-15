import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Footer is intentionally rendered as an empty spacer (no blue strip).
// The bottom tab bar now sits at the bottom of the screen and handles
// any required bottom safe-area padding itself.
const Footer: React.FC = () => {
  const insets = useSafeAreaInsets();

  if (insets.bottom <= 0) {
    return null;
  }

  return <View style={[styles.footer, { height: 0, paddingBottom: 0 }]} />;
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'transparent',
    height: 0,
  },
});

export default Footer;
