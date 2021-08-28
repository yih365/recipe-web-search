/* global firebase */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "api-key",
  authDomain: "auth-domain.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "storage-bucket.appspot.com",
  messagingSenderId: "id-number",
  appId: "app:id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const RECIPE_COLLECTION = "recipes";
