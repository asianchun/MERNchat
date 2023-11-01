import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../firebase/AuthContext"
import axios from "axios"
import Spinner from "../components/Spinner"
import Conversations from "../components/Home/Conversations"
import ChatBox from "../components/Home/Chatbox"
import SearchPopup from "../components/SearchPopup"
import { io } from "socket.io-client"

const Home = () => {
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const { currentUser, logout } = useAuth()
  const [socket, setSocket] = useState(null)
  const navigate = useNavigate()

  const logoutUser = async (event) => {
    setError("")

    try {
      await logout()
      navigate("/login")
    } catch (error) {
      setError(error)
    }
  }

  const setConversationMessages = (conversation) => {
    setCurrentConversation(conversation)
  }

  const addConversation = (conversation) => {
    const isExistingConversation = conversations.some(
      (convo) => convo._id === conversation._id
    )

    if (!isExistingConversation) {
      setConversations([...conversations, conversation])
    }

    setCurrentConversation(conversation)
  }

  const updateConversations = (updated) => {
    const update = conversations.map((conversation) => {
      if (conversation._id === updated._id) {
        return updated
      }
      return conversation
    })

    setConversations(update)
  }

  useEffect(() => {
    setLoading(true)

    const socket = io("http://localhost:5555", {
      transports: ["websocket"],
    })

    setSocket(socket)

    axios
      .get(`http://localhost:5555/conversations/${currentUser.uid}`)
      .then((response) => {
        setConversations(response.data.data)
        setCurrentConversation(
          response.data.data[response.data.data.length - 1]
        )
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the socket")
    })
    return () => {}
  }, [socket])

  return (
    <main>
      Home Page
      <section className="flex gap-16">
        <Link to="/profile">My Profile</Link>
        <button onClick={logoutUser}>Log Out</button>
      </section>
      <section>
        <SearchPopup update={addConversation} />
        <div>All conversations</div>
        {loading ? (
          <Spinner />
        ) : (
          <Conversations
            conversations={conversations}
            onHandleClick={setConversationMessages}
          />
        )}
      </section>
      <ChatBox
        conversation={currentConversation}
        update={updateConversations}
      />
    </main>
  )
}

export default Home
