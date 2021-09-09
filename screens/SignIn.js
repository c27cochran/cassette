import React from 'react';
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Block, Button, Input, Text, theme } from 'galio-framework';
import * as firebase from 'firebase';
import "firebase/firestore";
import * as Facebook from 'expo-facebook';
import * as GoogleSignIn from 'expo-google-sign-in';

import { LinearGradient } from 'expo-linear-gradient';
import { materialTheme } from '../constants/';
import { HeaderHeight } from "../constants/utils";
import {Icon} from "../components";
import getEnvVars from '../environment';
import moment from "moment";
import {db} from "../config/firebase-config";
const { facebookAppId } = getEnvVars();

const { width } = Dimensions.get('window');

export default class SignIn extends React.Component {
  state = {
    email: '',
    password: '',
    active: {
      email: false,
      password: false,
    },
    loading: false,
    errorMessage: null,
  };

  onLoginSuccess = () => {
    // this.setState({ loading: false });
    this.props.navigation.navigate('App');
  };

  checkUserExists = (user) => {
    db.collection('users')
      .where('email', '==', user.user.email).get()
      .then(snapshot => {
        if (snapshot.empty) {
          this.onLoginSuccessCreate(user);
          return;
        } else {
          this.onLoginSuccess();
          return;
        }
      })
      .catch(err => {
        this.onLoginFailure('Something went wrong. Please try again.');
        console.log('Error getting documents', err);
      });
  };

  onLoginSuccessCreate = (user) => {
    // TODO: check data structure for Google sign in
    const now = moment();
    const data = {
      email: user.user.email,
      uid: user.user.uid,
      fullName: user.additionalUserInfo.profile.name,
      firstName: user.additionalUserInfo.profile.first_name,
      lastName: user.additionalUserInfo.profile.last_name,
      avatar: user.additionalUserInfo.profile.picture.data.url,
      points: 0,
      creationTime: now.toISOString(),
    };
    const fbUser = firebase.auth().currentUser;
    fbUser.updateProfile({
      displayName: data.fullName,
      photoURL: data.avatar,
    });
    db.collection('users')
      .doc(data.email)
      .set(data)
      .then(() => {
        console.log('New user has been added', data.fullName);
        this.props.navigation.navigate('App');
      })
      .catch(error => {
        console.error('Create user failed', error.message);
        this.onLoginFailure('Something went wrong. Please try again.');
        this.setState({ loading: false });
      });
  };

  onLoginFailure = (errorMessage) => {
    this.setState({ errorMessage, loading: false });
  };

  renderLoading = () => {
    if (this.state.loading) {
      return (
        <Block flex middle>
          <ActivityIndicator size={'large'} />
        </Block>
      );
    }
  };

  handleChange = (name, value) => {
    this.setState({ [name]: value });
  };

  handleEmailLogin = async () => {
    this.setState({ loading: true });
    const { email, password } = this.state;
    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(this.onLoginSuccess)
      .catch(error => {
        let errorCode = error.code;
        let errorMessage = error.message;
        if (errorCode === 'auth/user-not-found') {
          this.onLoginFailure('Account not found.');
        } else if (errorCode === 'auth/wrong-password') {
          this.onLoginFailure('Please check your password.');
        } else {
          this.onLoginFailure(errorMessage);
        }
      });
  };

  handleFacebookLogin = async () => {
    try {
      this.setState({ loading: true });
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(facebookAppId, {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        const facebookProfileData = await firebase.auth().signInWithCredential(credential);
        this.checkUserExists(facebookProfileData)
      } else {
        this.setState({ loading: false });
      }
    } catch ({ message }) {
      this.onLoginFailure(message);
    }
  };

  handleGoogleLogin = async () => {
    try {
      this.setState({ loading: true });
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      const data = await GoogleSignIn.GoogleAuthentication.prototype.toJSON();
      if (type === 'success') {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
        const googleProfileData = await firebase.auth().signInWithCredential(credential);
        console.log('googleProfileData', googleProfileData);
        this.checkUserExists(googleProfileData);
      } else {
        this.setState({ loading: false });
      }
    } catch ({ message }) {
      this.onLoginFailure(message);
    }
  };

  toggleActive = (name) => {
    const { active } = this.state;
    active[name] = !active[name];

    this.setState({ active });
  };

  render() {
    const { navigation } = this.props;
    const { email, password, loading, errorMessage } = this.state;

    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1.1 }}
        locations={[0.2, 1]}
        colors={['#550a46', '#4a69bb']}
        style={[styles.signin, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}
      >
        {
          loading &&
            this.renderLoading()
        }
        {
          !loading &&
            <Block flex middle>
              {/*<StatusBar barStyle="light-content" />*/}
              <KeyboardAvoidingView behavior="padding" enabled>
                <Block flex middle style={{marginTop: theme.SIZES.BASE * 3}}>
                  <Text color="white" style={{fontFamily: 'Damion'}} size={75}>
                    Cassette
                  </Text>
                  <Text
                    color="white"
                    style={{fontFamily: 'PermanentMarker', textAlign: 'center', marginBottom: 15, marginTop: -15}}
                    size={24}
                  >
                    Log in
                  </Text>
                  {
                    errorMessage &&
                      <Block center style={styles.errorContainer}>
                        {
                          errorMessage.includes('not found') ?
                            <TouchableOpacity onPress={() => navigation.navigate('Sign Up')}>
                              <Text style={[styles.errorText, styles.errorTextRed]}>
                                {errorMessage}
                              </Text>
                              <Text style={styles.errorText}>
                                <Text style={styles.errorTextRed}>Please try again or&nbsp;</Text>
                                <Text styles={styles.fakeLink} color='#00BCD4'>
                                  create a new account.
                                </Text>
                              </Text>
                            </TouchableOpacity>
                          :
                            <Text style={[styles.errorText, styles.errorTextRed]}>
                              {errorMessage}
                            </Text>
                        }
                      </Block>
                  }
                  <Block center>
                    <Input
                      borderless
                      color="white"
                      placeholder="Email"
                      type="email-address"
                      autoCapitalize="none"
                      bgColor='transparent'
                      value={email}
                      onBlur={() => this.toggleActive('email')}
                      onFocus={() => this.toggleActive('email')}
                      placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                      onChangeText={text => this.handleChange('email', text)}
                      style={[styles.input, this.state.active.email ? styles.inputActive : null]}
                    />
                    <Input
                      password
                      viewPass
                      borderless
                      color="white"
                      iconColor="white"
                      placeholder="Password"
                      bgColor='transparent'
                      onBlur={() => this.toggleActive('password')}
                      onFocus={() => this.toggleActive('password')}
                      placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                      onChangeText={text => this.handleChange('password', text)}
                      style={[styles.input, this.state.active.password ? styles.inputActive : null]}
                    />
                    <Text
                      color={theme.COLORS.WHITE}
                      size={theme.SIZES.FONT * 0.75}
                      onPress={() => navigation.navigate('Password Reset')}
                      style={{ alignSelf: 'flex-end', lineHeight: theme.SIZES.FONT * 2 }}
                    >
                      Forgot your password?
                    </Text>
                  </Block>
                  <Block flex top style={{ marginTop: 20 }}>
                    <Button
                      round
                      shadowless
                      color={materialTheme.COLORS.BUTTON_COLOR_ALTERNATE}
                      style={styles.social}
                      onPress={() => this.handleEmailLogin()}
                    >
                      <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                        LET'S GO
                      </Text>
                    </Button>
                    <Block center style={{ marginVertical: theme.SIZES.BASE * 1.875 }}>
                      <Text size={20} color='white' style={styles.lineWithText}>
                        ─────   OR   ─────
                      </Text>
                    </Block>
                    <Block style={{ marginBottom: theme.SIZES.BASE * 1.875 }}>
                      <Button
                        round
                        color={theme.COLORS.FACEBOOK}
                        shadowless
                        iconColor={theme.COLORS.WHITE}
                        style={styles.social}
                        onPress={() => this.handleFacebookLogin()}
                      >
                        <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                          <Icon size={20} name="facebook" family="font-awesome" color="white" />
                          &nbsp;&nbsp;Sign in with Facebook
                        </Text>
                      </Button>
                    </Block>
                    <Block>
                      <Button
                        round
                        color="#4285F4"
                        shadowless
                        iconColor={theme.COLORS.WHITE}
                        style={styles.social}
                        onPress={() => this.handleGoogleLogin()}
                      >
                        <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                          <Icon size={20} name="google" family="font-awesome" color="white" />
                          &nbsp;&nbsp;Sign in with Google
                        </Text>
                      </Button>
                    </Block>
                    <Button
                      color="transparent"
                      shadowless
                      onPress={() => navigation.navigate('Sign Up')}
                      style={{marginTop: 10}}
                    >
                      <Text
                        center
                        color={theme.COLORS.WHITE}
                        size={theme.SIZES.FONT}
                        style={{marginTop:20}}
                      >
                        {"Don't have an account? Sign Up"}
                      </Text>
                    </Button>
                  </Block>
                </Block>
              </KeyboardAvoidingView>
            </Block>
        }
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  signin: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  social: {
    // width: theme.SIZES.BASE * 3.5,
    height: theme.SIZES.BASE * 3.5,
    borderRadius: theme.SIZES.BASE * 1.75,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 1
  },
  input: {
    width: width * 0.9,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
  },
  inputActive: {
    borderBottomColor: "white",
  },
  lineWithText: {
    fontFamily: 'Muli-Bold',
    textAlign: 'center',
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
    // lineHeight: 0.1,
  },
  errorContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1.25,
    borderRadius: 4,
  },
  errorText: {
    fontFamily: 'Muli-Bold',
    fontSize: 16,
  },
  errorTextRed: {
    color: materialTheme.COLORS.ERROR,
  },
  fakeLink: {
    color: materialTheme.COLORS.INFO,
  },
});
