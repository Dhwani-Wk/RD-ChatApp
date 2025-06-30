// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdXWKuJ1GYvLE9eX_UjLaXvqzUypIW1ZI",
    authDomain: "rd-chatapp-aa882.firebaseapp.com",
    projectId: "rd-chatapp-aa882",
    storageBucket: "rd-chatapp-aa882.firebasestorage.app",
    messagingSenderId: "670679207508",
    appId: "1:670679207508:web:a87cc5a5abd45c8f4327c1"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signin = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name:"",
            avatar: "",
            bio:"Hey, I am using RD Chat App",
            lastSeen: Date.now()
        });
        await setDoc(doc(db, "chats", user.uid), {
            chatsData:[]
        })
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
    
}

const resetPass = async (email) => {
    if (!email) {
        toast.error("Enter Your Email");
        return null;
    }
    try {
        const userRef = collection(db,'users');
        const q = query(userRef,where("email","==",email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent")
        }
        else{
            toast.error("Email Doen't Exists")
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message)
    }
}


export {signin, login, logout, auth, db, resetPass}