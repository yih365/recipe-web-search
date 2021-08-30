/* global firebase */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "apiKey",
  authDomain: "authDomain.firebaseapp.com",
  projectId: "projectId",
  storageBucket: "storageBucket.appspot.com",
  messagingSenderId: "messagingSenderId",
  appId: "appId"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const RECIPE_COLLECTION = "recipes";
