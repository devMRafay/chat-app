import { useEffect, useState } from "react"
import { db, firestore } from "../Config/firebase"
import { Link } from "react-router-dom"
import "../App.css"

const MessageScreen = () =>{
    
    const [id, setId] = useState("")
    const [roomData, setRoomData] = useState([])
    const [roomID, setRoomId] =useState("")
    const [text, setText] = useState("")
    const [Message, setMessage] = useState([])
    
    
    // var roomId = localStorage.getItem("roomId")
    var roomId = localStorage.getItem("currentRoomID")
    
    // const realTimeData = () => {
        //     }
        useEffect(()=>{
            getRoomData()
        },[])
        
        const getRoomData = async () => {
            var userId = localStorage.getItem("uid")
            setRoomId(roomId)
            setId(userId)
            // var roomId = localStorage.getItem("roomId")
            // setRoomId(roomId)
            var data = []
            await firestore.collection("conversation").doc(roomId).get()
            .then((snap)=>{
                console.log(snap.data())
                data.push(snap.data())
            }).catch((e)=>{
                console.log(e)
            })
            // console.log(data[0 ])
            setRoomData([...data])
        }
        
        
        const deleteMessage = async (messageKey) => {
            console.log(messageKey)
            // await firestore.collection("messages").doc(messageKey).delete()
            
        }

        useEffect(()=>{
        // var roomId = localStorage.getItem("roomId")
        const unsubscribe = firestore.collection("message").where("roomId", "==", roomID)
        .onSnapshot((snapshoot)=>{
            const newMessage = snapshoot.docs.map((doc)=>({
                id:doc.id,
                ...doc.data()  
            }))
            setMessage(newMessage)
        },(error) => {
            console.error("Error listening to messages: ", error)
        }
    );
     return () => unsubscribe();

    },[id])
    
    
    const sendMessage = async () => {
        
        // console.log(SenderRecieverChattingData)
        
        // messageKey generate from database
        var messageKey = db.ref("message").push().key;
        
        var SenderRecieverChattingData = {
            messages : text,
            senderId : id,
            recieverId : roomData[0]["SenderId"] == id ? roomData[0]["RecieverId"] :roomData[0]["SenderId"],
            roomId : roomData[0]["roomId"],
            messageKey
        }
        setText("");
        await firestore.collection("message").doc(messageKey).set(SenderRecieverChattingData).then((snap)=>{
            alert("message send successfully!")
        }).catch((error)=>{
            alert(error.code)
        })
        
        console.log(SenderRecieverChattingData.messages)

        
    }
    return(
        <>

            <div className="navbar" style={{ display: "flex", justifyContent: "space-around" }}>
                <Link to={"/user"}>User List Page</Link>
                <Link to={"/Request"}>Request</Link>
                <Link to={"/chatList"}>Friend List Page</Link>
            </div>

            {/* <h1>Message Screen</h1> */}

            <div className="msgContainer">
            {
                Message.map((v,i)=>{
                    // console.log(v)
                    return(
                        <>
                        
                        {/* <div>{v}</div> */}

                        <div >{v.senderId == id ?
                            <>
                            <h1 className="sender" style={{textAlign:"right"}}>{v.messages}</h1>
                            <button onClick={()=> deleteMessage(v.messageKey)}>delete</button> 

                            </>
                            :
                            <>
                            <h1 className="reciever">{v.messages}</h1> 
                            
                            </>
                            
                        }
                        </div> 
                        </>
                    )
                })
            }
            </div>
        
        <div className="msgBox">

            <input className="msg" type="text" value={text} onChange={(e)=>{setText(e.target.value)}}/>
            <button className="btn" onClick={()=> sendMessage()}>Send Message</button>        
        
        </div>
        </>
    )

}
export default MessageScreen