// @flow
import * as firebase from 'firebase';
import 'firebase/firestore';
import getEnvVars from '../environment';

const {
    firebaseApiKey, firebaseAuthDomain, firebaseDatabaseUrl, firebaseStorageBucket, firebaseProjectId, firebaseMessagingSenderId,
} = getEnvVars();

// Initialize Firebase
export const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    databaseURL: firebaseDatabaseUrl,
    storageBucket: firebaseStorageBucket,
    projectId: firebaseProjectId,
    messagingSenderId: firebaseMessagingSenderId,
};

firebase.initializeApp(firebaseConfig);
// const firebaseApp = firebase.initializeApp(firebaseConfig);
// const firebaseAnalytics = firebase.analytics();

const db = firebase.firestore();

export { db };

// const storageRef = firebase.storage().ref();
// const avatars = storageRef.child('avatars');
// export const maleAvatars = avatars.child('male');
// export const femaleAvatars = avatars.child('female');
//
// export const notes = storageRef.child('notes');
