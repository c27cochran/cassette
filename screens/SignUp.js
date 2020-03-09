import React from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as firebase from 'firebase';
import moment from 'moment';
import { Block, Button, Input, Text, theme } from 'galio-framework';
import * as Facebook from 'expo-facebook';
import * as GoogleSignIn from 'expo-google-sign-in';
import { LinearGradient } from 'expo-linear-gradient';
import { materialTheme } from '../constants/';
import { HeaderHeight, validateEmail } from "../constants/utils";
import {Icon} from "../components";
import {db} from '../config/firebase-config';
import getEnvVars from '../environment';
const { facebookAppId } = getEnvVars();

const { height, width } = Dimensions.get('window');

export default class SignUp extends React.Component {
  state = {
    fullName: '',
    email: '',
    password: '',
    active: {
      fullName: false,
      email: false,
      password: false,
    },
    loading: false,
    errorMessage: null,
    errorEmail: false,
    errorName: false,
    errorPassword: false,
  };

  checkUserExists = (user, fullName, avatarUrl) => {
    db.collection('users')
      .where('email', '==', user.user.email).get()
      .then(snapshot => {
        if (snapshot.empty) {
          this.onSignUpSuccess(user, fullName, avatarUrl);
          return;
        } else {
          this.props.navigation.navigate('App');
          return;
        }
      })
      .catch(err => {
        this.onLoginFailure('Something went wrong. Please try again.');
        console.log('Error getting documents', err);
      });
  };

  onSignUpSuccess = (user, fullName, avatarUrl) => {
    let firstName, lastName;
    if (fullName) {
      const splitName = fullName.split(' ');
      firstName = splitName[0];
      lastName = splitName[1];
    }
    const now = moment();
    const data = {
      email: user.user.email,
      uid: user.user.uid,
      fullName: fullName || user.additionalUserInfo.profile.name,
      firstName: fullName ? firstName : user.additionalUserInfo.profile.first_name,
      lastName: fullName ? lastName : user.additionalUserInfo.profile.last_name,
      avatar: avatarUrl || user.additionalUserInfo.profile.picture.data.url,
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
        Alert.alert('Something went wrong. Please try again.');
        this.setState({ loading: false });
      });
  };

  handleEmailSignUp = async () => {
    const { fullName, email, password, errorName, errorEmail, errorPassword } = this.state;
    const avatarUrl = 'https://firebasestorage.googleapis.com/v0/b/cassette-lifes-mixtape.appspot.com/o/bizUse%2Fcassette-app-icon-small.png?alt=media&token=3f414e45-90e1-439a-985a-24a55df6cd75';

    if (fullName.length < 4) {
      this.setState({ errorName: true});
    } else {
      this.setState({ errorName: false});
    }

    if (password.length < 6) {
      this.setState({ errorPassword: true});
    } else {
      this.setState({ errorPassword: false});
    }

    const emailValid = validateEmail(email);
    this.setState({ errorEmail: !emailValid });

    if (!errorEmail && !errorPassword && !errorName) {
      this.setState({ loading: true });
      await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((user) => this.checkUserExists(user, fullName, avatarUrl))
        .catch(error => {
          this.setState({ loading: false });
          let errorCode = error.code;
          let errorMessage = error.message;
          if (errorCode === 'auth/weak-password') {
            this.setState({ errorPassword: true });
          } else if (errorCode === 'auth/email-already-in-use') {
            Alert.alert('Email address already taken. Please enter a different email.');
          } else if (errorCode === 'auth/invalid-email') {
            this.setState({ errorEmail: true });
          } else {
            // TODO: add email address
            Alert.alert('Something went wrong. Please try again or email our support team.');
          }
        });
    }
  };

  handleFacebookSignUp = async () => {
    try {
      this.setState({ loading: true });
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(facebookAppId, {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        const facebookProfileData = await firebase.auth().signInWithCredential(credential);
        // console.log('facebook', facebookProfileData.additionalUserInfo);
        this.checkUserExists(facebookProfileData);
      } else {
        this.setState({ loading: false });
      }
    } catch ({ message }) {
      this.setState({ loading: false });
      Alert.alert(`Facebook Login Error: ${message}`);
    }
  };

  handleGoogleSignUp = async () => {
    try {
      this.setState({ loading: true });
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      if (type === 'success') {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken,);
        const googleProfileData = await firebase.auth().signInWithCredential(credential);
        this.checkUserExists(googleProfileData);
      } else {
        this.setState({ loading: false });
      }
    } catch ({ message }) {
      this.setState({ loading: false });
      Alert.alert('login: Error:' + message);
    }
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

  toggleActive = (name) => {
    const { active } = this.state;
    active[name] = !active[name];

    this.setState({ active });
  };

  render() {
    const { navigation } = this.props;
    const { loading, fullName, email, errorEmail, errorName, errorPassword } = this.state;

    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0.25, y: 1.1 }}
        locations={[0.2, 1]}
        colors={['#4a69bb', '#550a46']}
        style={[styles.signup, { flex: 1, paddingTop: theme.SIZES.BASE * 4 }]}
      >
        {
          loading &&
          this.renderLoading()
        }
        {
          !loading &&
            <Block flex middle>
              <KeyboardAvoidingView behavior="padding" enabled>
                <Block flex middle style={{marginTop: theme.SIZES.BASE * 3}}>
                  <Text color="white" style={{fontFamily: 'Damion', textAlign: 'center'}} size={75}>
                    Cassette
                  </Text>
                  <Text
                    color="white"
                    style={{fontFamily: 'PermanentMarker', textAlign: 'center', marginBottom: 15, marginTop: -15}}
                    size={24}
                  >
                    Create an Account
                  </Text>
                  <Block center>
                    <Input
                      bgColor='transparent'
                      placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                      borderless
                      color={errorName ? theme.COLORS.ERROR : 'white'}
                      help={errorName ? 'Full name must be at least 3 letters.' : null}
                      type="default"
                      placeholder="Full Name"
                      value={fullName}
                      style={[
                        styles.input,
                        this.state.active.fullName ? styles.inputActive : null,
                        errorName ? styles.inputError : null,
                      ]}
                      onChangeText={text => this.handleChange('fullName', text)}
                      onBlur={() => this.toggleActive('fullName')}
                      onFocus={() => this.toggleActive('fullName')}
                    />
                    <Input
                      bgColor='transparent'
                      placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                      borderless
                      color={errorEmail ? theme.COLORS.ERROR : 'white'}
                      help={errorEmail ? 'Email invalid' : null}
                      type="email-address"
                      placeholder="Email"
                      autoCapitalize="none"
                      value={email}
                      style={[
                        styles.input,
                        this.state.active.email ? styles.inputActive : null,
                        errorEmail ? styles.inputError : null,
                      ]}
                      onChangeText={text => this.handleChange('email', text)}
                      onBlur={() => this.toggleActive('email')}
                      onFocus={() => this.toggleActive('email')}
                    />
                    <Input
                      bgColor='transparent'
                      placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                      borderless
                      color={errorPassword ? theme.COLORS.ERROR : 'white'}
                      help={errorPassword ? 'Password must be at least 6 characters' : null}
                      password
                      viewPass
                      placeholder="Password"
                      iconColor="white"
                      style={[
                        styles.input,
                        this.state.active.password ? styles.inputActive : null,
                        errorPassword ? styles.inputError : null
                      ]}
                      onChangeText={text => this.handleChange('password', text)}
                      onBlur={() => this.toggleActive('password')}
                      onFocus={() => this.toggleActive('password')}
                    />
                  </Block>
                  <Block flex top style={{marginTop: 20}}>
                    <Button
                      round
                      shadowless
                      style={{height: 48}}
                      color={materialTheme.COLORS.BUTTON_COLOR_ALTERNATE}
                      style={styles.social}
                      onPress={() => this.handleEmailSignUp()}
                    >
                      <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                        SIGN UP
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
                        onPress={() => this.handleFacebookSignUp()}
                      >
                        <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                          <Icon size={20} name="facebook" family="font-awesome" color="white" />
                          &nbsp;&nbsp;Sign up with Facebook
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
                        onPress={() => this.handleGoogleSignUp()}
                      >
                        <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                          <Icon size={20} name="google" family="font-awesome" color="white" />
                          &nbsp;&nbsp;Sign up with Google
                        </Text>
                      </Button>
                    </Block>
                    <Button color="transparent" shadowless
                            onPress={() => navigation.navigate('Sign In')}
                            style={{marginTop: 10}}
                    >
                      <Text center color={theme.COLORS.WHITE} size={theme.SIZES.FONT}>
                        Already have an account? Sign In
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
  signup: {
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
  inputError: {
    borderBottomColor: theme.COLORS.ERROR,
  },
  lineWithText: {
    fontFamily: 'Muli-Bold'
  },
});
