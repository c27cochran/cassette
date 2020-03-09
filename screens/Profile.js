import React from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Image, ImageBackground, Platform } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';
import * as firebase from 'firebase';

import { Icon } from '../components';
import { Images, materialTheme } from '../constants';
import { HeaderHeight } from "../constants/utils";
import { db } from '../config/firebase-config';

const { width } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

export default class Profile extends React.Component {
  state = {
    avatarUrl: null,
  };

  componentDidMount() {
    const fbUser = firebase.auth().currentUser;
    db.collection('users')
      .where('email', '==', fbUser.email).get()
      .then(snapshot => {
        // console.log('snapshot', snapshot);
        if (snapshot.empty) {
          return;
        }

        snapshot.forEach(doc => {
          const data = doc.data();
          console.log('data', data);
          this.setState({ avatarUrl: data.avatar })
        });
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });
  }

  render() {
    const { avatarUrl } = this.state;
    const fbUser = firebase.auth().currentUser;
    return (
      <View style={{ flex:1, backgroundColor: 'transparent' }}>
        <View>
          <Image style={{ height: width, width: width, position: 'absolute', top:0, left:0 }} source={Images.ProfileCover} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.6)']} style={styles.gradient} />
        </View>
        <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
          <Block flex style={styles.profileDetails}>
            {
              fbUser &&
                <Block left style={styles.profileAvatar}>
                  <Image source={{ uri: fbUser.photoURL }} resizeMode="cover" style={styles.avatarImage} />
                </Block>
            }
            <Block style={styles.profileTexts}>
              <Text color="white" size={28} style={styles.profileName}>{fbUser.displayName}</Text>
              <Block row space="between">
                <Block row>
                  <Block middle style={styles.pro}>
                    <Text size={16} style={styles.proText}>Tastemaker</Text>
                  </Block>
                </Block>
                <Block>
                  <Text color={theme.COLORS.WHITE} size={16}>
                    <Icon name="map-marker" family="font-awesome" color={theme.COLORS.WHITE} size={16} />
                    {`  `} Somewhere, US
                  </Text>
                </Block>
              </Block>
            </Block>
          </Block>
          <Block style={styles.options}>
            <Block row space="between" style={{ padding: theme.SIZES.BASE, }}>
              <Block middle>
                <Text bold size={12} style={{marginBottom: 8}}>36</Text>
                <Text muted size={12}>Orders</Text>
              </Block>
              <Block middle>
                <Text bold size={12} style={{marginBottom: 8}}>5</Text>
                <Text muted size={12}>Bids & Offers</Text>
              </Block>
              <Block middle>
                <Text bold size={12} style={{marginBottom: 8}}>2</Text>
                <Text muted size={12}>Messages</Text>
              </Block>
            </Block>
            <Block row space="between" style={{ paddingVertical: 16, alignItems: 'baseline' }}>
              <Text size={16}>Recently viewed</Text>
              <Text size={12} color={theme.COLORS.PRIMARY} onPress={() => this.props.navigation.navigate('Home')}>View All</Text>
            </Block>
            <Block row space="between" style={{ flexWrap: 'wrap' }} >
              {Images.Viewed.map((img, imgIndex) => (
                <Image
                  source={{ uri: img }}
                  key={`viewed-${img}`}
                  resizeMode="cover"
                  style={styles.thumb}
                />
              ))}
            </Block>
          </Block>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  profileAvatar: {
    borderRadius: 4,
    marginVertical: 8,
    marginLeft: theme.SIZES.BASE * 2,
    width: thumbMeasure,
    height: thumbMeasure,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.5,
  },
  profileName: {
    fontFamily: 'PermanentMarker',
    paddingBottom: 8,
    marginTop: -10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.5,
  },
  profileImage: {
    width: width * 1.1,
    height: 'auto',
  },
  profileContainer: {
    width: width,
    height: 'auto',
    flex: 1,
  },
  profileDetails: {
    paddingTop: theme.SIZES.BASE * 4,
    paddingBottom: theme.SIZES.BASE * 2,
    marginTop: theme.SIZES.BASE * 7,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  profileTexts: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    // paddingVertical: theme.SIZES.BASE,
    // paddingBottom: theme.SIZES.BASE * 2,
    zIndex: 2
  },
  pro: {
    backgroundColor: materialTheme.COLORS.SECONDARY,
    paddingHorizontal: 6,
    marginRight: theme.SIZES.BASE / 2,
    borderRadius: 4,
    height: 26,
    // width: 38,
  },
  proText: {
    color: materialTheme.COLORS.TEXT,
  },
  seller: {
    marginRight: theme.SIZES.BASE / 2,
  },
  options: {
    position: 'relative',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE,
    marginBottom: 0,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    borderBottomLeftRadius: 13,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
  },
  avatarImage: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: 100,
    height: 100
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: thumbMeasure,
    height: thumbMeasure
  },
  gradient: {
    zIndex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    position: 'absolute',
  },
});
