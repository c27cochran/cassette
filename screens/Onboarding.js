import React from 'react';
import { ImageBackground, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { Block, Button, Text, theme } from 'galio-framework';
import * as firebase from 'firebase';

const { height, width } = Dimensions.get('screen');

import materialTheme from '../constants/Theme';
import Images from '../constants/Images';
import {Icon} from "../components";

export default class Onboarding extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.navigation.navigate('App');
      }
    });
  }

  render() {
    const { navigation } = this.props;

    return (
      <Block flex style={styles.container}>
        {/*<StatusBar barStyle="light-content" />*/}
        <Block flex center>
          <ImageBackground
            source={Images.Onboarding}
            style={{ height: height, width, zIndex: 1 }}
          />
        </Block>
        <Block flex={12} space="between" style={styles.padded}>
          <Block style={{ position: 'relative' }}>
            <Block style={{ marginBottom: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE * 2, zIndex: 3 }}>
              <Block>
                <Text color="rgba(255,255,255,1)" style={{fontFamily: 'Damion'}} size={90}>Cassette</Text>
              </Block>
              <Block>
                <Text color="rgba(255,255,255,0.85)" style={{marginLeft: 5, marginTop: -16, fontFamily: 'PermanentMarker'}} size={36}>
                  Life's MixTape
                </Text>
              </Block>
            </Block>
          </Block>
          <Block />
          <Block bottom style={{ marginBottom: -theme.SIZES.BASE * 8, padding: theme.SIZES.BASE * 2, zIndex: 3, borderRadius: 5 }}>
            <Block row style={{marginBottom: 20}}>
              <Icon size={40} name="star" family="MaterialIcons" color="rgba(255,255,255,0.8)" />
              <Icon size={40} name="star" family="MaterialIcons" color="rgba(255,255,255,0.8)" />
              <Icon size={40} name="star" family="MaterialIcons" color="rgba(255,255,255,0.8)" />
              <Icon size={40} name="star" family="MaterialIcons" color="rgba(255,255,255,0.8)" />
              <Icon size={40} name="star-half" family="MaterialIcons" color="rgba(255,255,255,0.8)" />
            </Block>
            <Block row>
              <Text color="white" style={[styles.textShadow, {fontFamily: 'Muli-ExtraBold'}]} size={24}>
                Why listen to strangers?
              </Text>
            </Block>
            <Block style={{ paddingTop: 20 }}>
              <Text size={20} color='white' style={{fontFamily: 'Muli-ExtraBold'}}>
                See what your friends are into.
              </Text>
            </Block>
            <Block style={{ paddingTop: 10 }}>
              <Text size={20} color='white' style={{fontFamily: 'Muli-ExtraBold'}}>
                Get paid for your opinion.
              </Text>
            </Block>
          </Block>
          <Block center style={{ paddingBottom: 30 }}>
            <Button
              shadowless
              style={styles.button}
              color={materialTheme.COLORS.BUTTON_COLOR_ALTERNATE}
              onPress={() => navigation.navigate('Sign In')}
            >
              <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                GET STARTED
              </Text>
            </Button>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BLACK,
  },
  padded: {
    // paddingHorizontal: theme.SIZES.BASE * 2,
    position: 'relative',
    bottom: theme.SIZES.BASE,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 8,
    marginLeft: 12,
    borderRadius: 2,
    height: 22
  },
  gradient: {
    zIndex: 1,
    position: 'absolute',
    top: 33 + theme.SIZES.BASE,
    left: 0,
    right: 0,
    height: 66,
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 1,
  },
});
