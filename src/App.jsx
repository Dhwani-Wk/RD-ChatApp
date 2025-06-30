import React, { useContext, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './Pages/Login/Login'
import Chat from './Pages/Chat/Chat'
import ProfileUpdate from './Pages/ProfileUpdate/ProfileUpdate'
import { ToastContainer, toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './Configrations/Firebase'
import { AppContext } from './Contexts/AppContext'

const App = () => {

  const navigate = useNavigate();
  const {loadUserData} = useContext(AppContext)

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigate('/Chat')
        await loadUserData(user.uid)
      }
      else {
        navigate('/')
      }
    })
  },[])

  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/chat' element={<Chat/>} />
        <Route path='/profileupdate' element={<ProfileUpdate/>} />
      </Routes>
    </>
  )
}

export default App
