import { useEffect, useRef, useState } from "react"
import { db, firestore } from "../config/firebase"
import { Link, useNavigate } from "react-router-dom"
import "../App.css"

const MessageScreen = () => {
  const [id, setId] = useState("")
  const [roomData, setRoomData] = useState([])
  const [roomID, setRoomId] = useState("")
  const [text, setText] = useState("")
  const [Message, setMessage] = useState([])
  const [hoveredMsg, setHoveredMsg] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const messagesEndRef = useRef(null)
  const nav = useNavigate()

  var roomId = localStorage.getItem("currentRoomID")
  const myName = localStorage.getItem("name") || ""
  const myImage = localStorage.getItem("image") || ""

  const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

  useEffect(() => { getRoomData() }, [])
  useEffect(() => { scrollToBottom() }, [Message])

  const getRoomData = async () => {
    var userId = localStorage.getItem("uid")
    setRoomId(roomId)
    setId(userId)
    var data = []
    await firestore.collection("conversation").doc(roomId).get()
      .then((snap) => { data.push(snap.data()) })
      .catch(console.log)
    setRoomData([...data])
  }

  useEffect(() => {
    const unsubscribe = firestore.collection("message").where("roomId", "==", roomID)
      .onSnapshot((snapshot) => {
        const newMessage = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        newMessage.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        setMessage(newMessage)
      }, console.error)
    return () => unsubscribe()
  }, [id])

  const sendMessage = async () => {
    if (!text.trim() || !roomData[0]) return
    var messageKey = db.ref("message").push().key
    var data = {
      messages: text,
      senderId: id,
      recieverId: roomData[0]["SenderId"] === id ? roomData[0]["RecieverId"] : roomData[0]["SenderId"],
      roomId: roomData[0]["roomId"],
      messageKey,
      timestamp: Date.now()
    }
    setText("")
    await firestore.collection("message").doc(messageKey).set(data).catch(console.log)
  }

  const deleteMessage = async (msg) => {
    await firestore.collection("message").doc(msg.messageKey).delete().catch(console.log)
    setHoveredMsg(null)
  }

  const clearChat = async () => {
    const snapshot = await firestore.collection("message").where("roomId", "==", roomID).get()
    const batch = firestore.batch()
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit().catch(console.log)
    setShowClearConfirm(false)
  }

  const otherName = roomData[0]
    ? (roomData[0]["SenderId"] === id ? roomData[0]["RecieverName"] : roomData[0]["SenderName"])
    : "Chat"

  const otherImage = roomData[0]
    ? (roomData[0]["SenderId"] === id ? roomData[0]["RecieverImage"] : roomData[0]["SenderImage"])
    : ""

  const formatTime = (ts) => {
    if (!ts) return ""
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">ChatApp</span>
        <div className="navbar-links">
          <Link to="/user">People</Link>
          <Link to="/Request">Requests</Link>
          <Link to="/chatList">Friends</Link>
        </div>
      </nav>

      <div className="chat-layout">
        <div className="chat-top">
          <button className="back-btn" onClick={() => nav("/chatList")}>← Back</button>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
            {otherImage ? <img src={otherImage} alt={otherName} /> : getInitials(otherName)}
          </div>
          <div className="chat-top-info">
            <div className="chat-top-name">{otherName}</div>
            <div className="chat-top-sub">Active now</div>
          </div>
          <button className="btn-clear-chat" onClick={() => setShowClearConfirm(true)}>
            🗑 Clear chat
          </button>
        </div>

        {showClearConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <div className="confirm-icon">🗑</div>
              <p className="confirm-title">Clear entire chat?</p>
              <p className="confirm-sub">This will delete all messages for both users. This cannot be undone.</p>
              <div className="confirm-actions">
                <button className="btn-secondary-sm" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                <button className="btn-danger-sm" onClick={clearChat}>Yes, clear</button>
              </div>
            </div>
          </div>
        )}

        <div className="messages-area">
          {Message.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>Send a message to start chatting</p>
            </div>
          )}

          {Message.map((v, i) => {
            const isMine = v.senderId === id
            const showDate = i === 0 || (
              Message[i - 1].timestamp &&
              new Date(v.timestamp).toDateString() !== new Date(Message[i - 1].timestamp).toDateString()
            )
            return (
              <div key={v.id}>
                {showDate && v.timestamp && (
                  <div className="date-label">
                    {new Date(v.timestamp).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                  </div>
                )}
                <div
                  className={`msg-row ${isMine ? "mine" : "theirs"}`}
                  style={{ marginBottom: 2 }}
                  onMouseEnter={() => setHoveredMsg(v.id)}
                  onMouseLeave={() => setHoveredMsg(null)}
                >
                  {!isMine && (
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                      {otherImage ? <img src={otherImage} alt={otherName} /> : getInitials(otherName)}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: isMine ? "row-reverse" : "row" }}>
                      <div className="bubble">{v.messages}</div>
                      {hoveredMsg === v.id && isMine && (
                        <button className="msg-delete-btn" onClick={() => deleteMessage(v)} title="Delete message">✕</button>
                      )}
                    </div>
                    <div className="bubble-time">
                      {formatTime(v.timestamp)}
                      {isMine && <span style={{ color: "var(--primary)", marginLeft: 4 }}>✓✓</span>}
                    </div>
                  </div>
                  {isMine && (
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                      {myImage ? <img src={myImage} alt={myName} /> : getInitials(myName)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 11, flexShrink: 0 }}>
            {myImage ? <img src={myImage} alt={myName} /> : getInitials(myName)}
          </div>
          <div className="input-wrap">
            <textarea
              placeholder="Type a message…"
              value={text}
              rows={1}
              onChange={(e) => {
                setText(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
              }}
            />
          </div>
          <button className="send-btn" onClick={sendMessage}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

export default MessageScreen