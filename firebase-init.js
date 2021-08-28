/* global firebase */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk-7bPkiuRUGjz_8_-9hGjZ4w35-RyqUo",
  authDomain: "recipe-manage-web.firebaseapp.com",
  projectId: "recipe-manage-web",
  storageBucket: "recipe-manage-web.appspot.com",
  messagingSenderId: "74225911594",
  appId: "1:74225911594:web:ce22c176702c4cb68d0053"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const RECIPE_COLLECTION = "recipes";