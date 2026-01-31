import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWnZnvVVqsS4PlRstyMhJKvQ2x-ltoPGs",
    authDomain: "dresses-c6543.firebaseapp.com",
    projectId: "dresses-c6543",
    storageBucket: "dresses-c6543.firebasestorage.app",
    messagingSenderId: "625076160641",
    appId: "1:625076160641:web:85ec0d28832cc31b3e2580"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
