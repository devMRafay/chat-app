import { useEffect, useState } from "react"
import { db, firestore } from "../Config/firebase"
import { Link, useNavigate } from "react-router-dom"

function Request(){


    const nav = useNavigate()
    const [RequestData, setRequestData] = useState([])
    const [id, setId] = useState()
    const getAllRequest = async () => {

        var userId = localStorage.getItem("uid")
        setId(userId)

        var SenderRequest = []    
        await firestore.collection("Request").where("SenderId", "==", userId)
        .get().then((snap)=>{
            snap.forEach((doc)=>{
                console.log(doc.data())
                SenderRequest.push(doc.data())
            }) 
        })
        
        var RecieverRequest = []
        
        await firestore.collection("Request").where("RecieverId", "==", userId)
        .get().then((snap)=>{
            snap.forEach((doc)=>{
                console.log(doc.data())
                RecieverRequest.push(doc.data())
            })
        })
        
        var allRequest = [...SenderRequest,...RecieverRequest]
        
        setRequestData([...SenderRequest,...RecieverRequest])
        
    }
        

    useEffect(()=>{
        getAllRequest()
    },[])
    

    const AcceptRequest = async (ind) => {
        console.log(RequestData[ind])
        var userData = RequestData[ind]

        RequestData[ind]["Loading"] = true
        setRequestData([...RequestData])

        var roomId = db.ref("conversation").push().key;
        await firestore.collection("conversation").doc(roomId)
        .set({
            SenderId : userData["SenderId"],
            SenderEmail : userData["SenderEmail"],
            SenderName : userData["SenderName"],
            SenderImage : userData["SenderImage"],
            RecieverId :    userData["RecieverId"],
            RecieverEmail:  userData["RecieverEmail"],
            RecieverName :  userData["RecieverName"],
            RecieverImage : userData["RecieverImage"],
            roomId
           
    }) 

        await firestore.collection("Request").doc(RequestData[ind]["RequestId"])
        .update({
           RequestStatus: "accepted",
           roomId
        })

        RequestData[ind]["RequestStatus"] = "accepted"
        RequestData[ind]["roomId"] = roomId
        console.log(RequestData[ind])
        setRequestData([...RequestData])


    }

    const NavigateToChat = (index) => {
        console.log(RequestData[index]["roomId"])
        // localStorage.setItem("roomId", RequestData[index]["roomId"])
        localStorage.setItem("currentRoomID", RequestData[index]["roomId"])
        nav("/chatScreen")
    }

    return(

        <>
        
            <div className="navbar" style={{ display: "flex", justifyContent: "space-around" }}>
                <Link to={"/user"}>User List Page</Link>
                <Link to={"/Request"}>Request</Link>
                <Link to={"/chatList"}>Friend List Page</Link>
            </div>

            {/* <h1> All Request </h1> */}
            {
                RequestData.map((v,i)=>{
                    return(
                        <>
                    <div className="flex">

                        <h1>{v.SenderId ==id ? v.RecieverName :v.SenderName}</h1>
                        
                        {v.SenderId ==id ?
                            <h3> 
                                {v.RequestStatus == "pending" ? 
                                `status: ${v.RequestStatus}` : <button onClick={()=> NavigateToChat(i)}>chat</button>} 
                            </h3> : null}
                        
                        {v.SenderId !=id && v.RequestStatus == "pending" && v.Loading == null?
                        <button onClick={()=> AcceptRequest(i)}>Accept</button> : 
                        v.SenderId != id && v.RequestStatus == "pending" && v.Loading != null? 
                        <b>Loading...</b> 
                        :null}

                        {v.SenderId !=id && v.RequestStatus == "accepted" ? 
                        <button onClick={()=> NavigateToChat(i)}> chat </button> : null}
                        
                        

                    </div>
                        </>  
                    )       
                })
             }             
       
        </>
    )

}

export default Request