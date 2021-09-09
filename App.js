import React from 'react';
import { Platform, StatusBar, Image } from 'react-native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { Block, GalioProvider } from 'galio-framework';
import * as firebase from 'firebase';
import {firebaseConfig} from "./config/firebase-config";
import * as Facebook from 'expo-facebook'
import { NavigationContainer } from '@react-navigation/native';

// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens';
enableScreens();
import getEnvVars from './environment';
const { facebookAppId, facebookAppName } = getEnvVars();

import Screens from './navigation/Screens';
import { Images, materialTheme } from './constants/';

const assetImages = [
  Images.Profile,
  Images.ProfileCover,
  Images.Avatar,
  Images.Onboarding,
  Images.Products.Auto,
  Images.Products.Motocycle,
  Images.Products.Watches,
  Images.Products.Makeup,
  Images.Products.Accessories,
  Images.Products.Fragrance,
  Images.Products.BMW,
  Images.Products.Mustang,
  Images.Products['Harley-Davidson'],
];

// cache product images
// products.map(product => assetImages.push(product.image));

// cache categories images
// Object.keys(categories).map(key => {
//   categories[key].map(category => assetImages.push(category.image));
// });

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    fontLoaded: false,
  };

  async componentDidMount() {

    Facebook.initializeAsync(facebookAppId, facebookAppName);

    await Font.loadAsync({
      'Damion': require('./assets/fonts/Damion.ttf'),
      'Federant': require('./assets/fonts/Federant.ttf'),
      'Sacramento': require('./assets/fonts/Sacramento.ttf'),
      'PermanentMarker': require('./assets/fonts/PermanentMarker.ttf'),
      'HKGrotesk-Bold': require('./assets/fonts/HKGrotesk-Bold.otf'),
      'HKGrotesk-Medium': require('./assets/fonts/HKGrotesk-Medium.otf'),
      'HKGrotesk-Regular': require('./assets/fonts/HKGrotesk-Regular.otf'),
      'HKGrotesk-Light': require('./assets/fonts/HKGrotesk-Light.otf'),
      'Rubik-Regular': require('./assets/fonts/Rubik-Regular.ttf'),
      'Muli-ExtraBold': require('./assets/fonts/Muli-ExtraBold.ttf'),
      'Muli-Bold': require('./assets/fonts/Muli-Bold.ttf'),
      'Muli-Regular': require('./assets/fonts/Muli-Regular.ttf'),
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else if (!this.state.fontLoaded) {
      return (
        <AppLoading />
      )
    } else {
      return (
        <NavigationContainer>
          <GalioProvider theme={materialTheme}>
            <Block flex>
              {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
              <Screens />
            </Block>
          </GalioProvider>
        </NavigationContainer>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}
