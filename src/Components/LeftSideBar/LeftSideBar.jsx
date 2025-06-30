import React, { useContext, useEffect, useState } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../Configrations/Firebase'
import { AppContext } from '../../Contexts/AppContext'
import { toast } from 'react-toastify'
import { logout } from '../../Configrations/Firebase'

const LeftSideBar = () => {

  const navigate = useNavigate();
  const {userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible} = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false)

  const inputHandler = async (e) => {
    const input = e.target.value.trim().toLowerCase();
    if (!input) {
      setShowSearch(false);
      setUser(null);
      return;
    }
  
    try {
      setShowSearch(true);
      const userRef = collection(db, 'users');
      const q = query(
        userRef,
        where("username", ">=", input),
        where("username", "<=", input + "\uf8ff")
      );
      const querySnap = await getDocs(q);
  
      let found = null;
  
      querySnap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.id !== userData.id) {
          const alreadyInChat = chatData.some(chat => chat.rId === data.id);
          if (!alreadyInChat) {
            found = data;
          }
        }
      });
  
      setUser(found);
    } catch (error) {
      console.error("Search error:", error);
    }
  };
  

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatRef = collection(db, "chats");
  
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: []
      });
  
      const chatItemForThem = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: userData.id,
        updatedAt: Date.now(),
        messageSeen: true
      };
  
      const chatItemForMe = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true
      };
  
      await setDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion(chatItemForThem)
      }, { merge: true });
  
      await setDoc(doc(chatRef, userData.id), {
        chatsData: arrayUnion(chatItemForMe)
      }, { merge: true });
  
      setUser(null); // clear search
      setShowSearch(false); // hide search list

      const uSnap = await getDoc(doc(db,"users",user.id));
      const uData = uSnap.data();
      setChat({
        messagesId:newMessageRef.id,
        lastMessage:"",
        rId:user.id,
        updatedAt:Date.now(),
        messageSeen:true,
        userData:uData,
      })
      setShowSearch(false)
      setChatVisible(true)
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const setChat = async (item) => {
    try {
        setMessagesId(item.messageId);
    setChatUser(item)
    const userChatsRef = doc(db,'chats',userData.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatsData = userChatsSnapshot.data();
    const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId===item.messageId);
    userChatsData.chatsData[chatIndex].messageSeen = true;
    await updateDoc(userChatsRef, {
        chatsData:userChatsData.chatsData
    })
    setChatVisible(true)
    } catch (error) {
        toast.error(error.message)
    }
    
  }

  useEffect(()=>{

    const updateChatUserData = async () => {
        
        if (chatUser) {
            const userRef = doc(db,"users",chatUser.userData.id);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setChatUser(prev=>({...prev, userData:userData}))
        }
    }
  },[chatData])
  
  return (
    <div className={`ls ${chatVisible? "hidden": ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className= 'logo' alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={()=>navigate('/ProfileUpdate')}>Edit Profile</p>
              <hr />
              <p onClick={()=>logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search' />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user
        ? <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
          : chatData.map((item, index) => {
            return(
              <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
            <img src={item.userData?.avatar} alt="" />
            <div>
              <p>{item.userData?.name}</p>
              <span>{item.lastMessage}</span>
            </div>
          </div>
            ); 
          })
        }
      </div>
    </div>
  )
}

export default LeftSideBar 