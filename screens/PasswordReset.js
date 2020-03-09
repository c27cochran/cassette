import React from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import * as firebase from 'firebase';
import { Block, Button, Input, Text, theme } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';
import { materialTheme } from '../constants/';
import { HeaderHeight, validateEmail } from "../constants/utils";

const { height, width } = Dimensions.get('window');

export default class PasswordReset extends React.Component {
  state = {
    email: '',
    active: {
      email: false,
    },
    loading: false,
    errorEmail: false,
    errorMessage: null,
    emailSent: false,
  };

  handleResetPassword = () => {
    this.setState({ loading: true });
    const { email } = this.state;
    if (email.length === 0) {
      this.setState({ errorEmail: true, loading: false });
    }
    const emailValid = validateEmail(email);
    this.setState({ errorEmail: !emailValid, loading: false });

    if (emailValid) {
      firebase.auth().sendPasswordResetEmail(email).then(() => {
        this.setState({ emailSent: true, errorMessage: false, loading: false });
      }).catch((error) => {
        this.setState({ loading: false, errorMessage: error.message });
      });
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
    const { loading, email, errorEmail, errorMessage, emailSent } = this.state;

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
              <Block flex style={{marginTop: theme.SIZES.BASE * 3}}>
                <Text color="white" style={{fontFamily: 'Damion', textAlign: 'center'}} size={75}>
                  Cassette
                </Text>
                <Text
                  color="white"
                  style={{fontFamily: 'PermanentMarker', textAlign: 'center', marginBottom: 15, marginTop: -15}}
                  size={24}
                >
                  Reset Your Password
                </Text>
                {
                  errorMessage &&
                  <Block center style={styles.dialogContainer}>
                    {
                      errorMessage.includes('no user record') ?
                        <TouchableOpacity onPress={() => navigation.navigate('Sign Up')}>
                          <Text style={[styles.dialogText, styles.errorTextRed]}>
                            Email not found.
                          </Text>
                          <Text style={styles.dialogText}>
                            <Text style={styles.errorTextRed}>Please try again or&nbsp;</Text>
                            <Text styles={styles.fakeLink} color='#00BCD4'>
                              create a new account.
                            </Text>
                          </Text>
                        </TouchableOpacity>
                        :
                        <Text style={[styles.dialogText, styles.errorTextRed]}>
                          {errorMessage}
                        </Text>
                    }
                  </Block>
                }
                {
                  emailSent &&
                    <Block center>
                      <Block center style={styles.dialogContainer}>
                        <Text style={styles.dialogText}>
                          An email has been sent to {email}. Please reset your password within the
                          next 30 minutes.
                        </Text>
                      </Block>
                    </Block>
                }
                {
                  !emailSent &&
                    <Block>
                      <Block center>
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
                      </Block>
                      <Block style={{marginTop: 20}}>
                        <Button
                          round
                          shadowless
                          style={{height: 48}}
                          color={materialTheme.COLORS.BUTTON_COLOR_ALTERNATE}
                          style={styles.social}
                          onPress={() => this.handleResetPassword()}
                        >
                          <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                            Reset Password
                          </Text>
                        </Button>
                      </Block>
                    </Block>
                }
                <Block center style={{marginTop: 20}}>
                  <Button
                    round
                    shadowless
                    style={{height: 48}}
                    color={materialTheme.COLORS.BUTTON_COLOR}
                    style={styles.social}
                    onPress={() => navigation.navigate('Sign In')}
                  >
                    <Text size={20} color='white' style={{fontFamily: 'Muli-Bold'}}>
                      Go Back
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
  dialogContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1.25,
    borderRadius: 4,
  },
  dialogText: {
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
