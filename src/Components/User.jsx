import { useEffect, useState } from "react"
import { db, firestore } from "../Config/firebase"
import "../App.css"
import { Link, useNavigate } from "react-router-dom"


function Users(){


    const [user, setUser] = useState([])
    const nav = useNavigate()

    const getUser = async () => {
        var userId = localStorage.getItem("uid")
        var data = [];

        await firestore.collection("users").where("userUid", "!=", userId).get()
        .then((snap)=>{
            // console.log(snap)
            snap.forEach(async (doc) => {
                console.log(doc.id, " => ", doc.data());
                doc.data["send_status"] = false;
                data.push(doc.data())
            });
            // console.log(data)
                        
        })
        .catch((e)=>{
            console.log(e)
        })

        var SenderRequest = []

        // sender id equal to login id
        await firestore.collection("Request").where("SenderId", "==", userId).get()
                .then((snap)=>{
                  snap.forEach((doc)=>{
                    console.log(doc.data())
                    SenderRequest.push(doc.data())
                  
                })
                
            })

        var RecieverRequest = []
            
        await firestore.collection("Request").where("RecieverId", "==", userId).get()
        .then((snap)=>{
            snap.forEach((doc)=>{
                console.log(doc)
                RecieverRequest.push(doc.data())
            })
        })

        var allRequest = [...SenderRequest,...RecieverRequest]
        console.table(allRequest)
        console.table(data)    

         const filterUser =  data.filter((user)=>{
                return !allRequest.some(
                    request => 
                        (request.SenderId==userId && request.RecieverId==user.userUid) ||
                    (request.SenderId==user.userUid && request.RecieverId==userId)                    
                )
            })

            console.log(filterUser)
                setUser(filterUser)          
    }

    const cancelRequest = async (index) => {
        await firestore.collection("Request").doc(user[index]["RequestId"])
        .delete().then((snap)=>{
            alert("delete request successfully")
            user[index]["send_status"] = false;
            user[index]["RequestId"] = ""
        })
        .catch((e)=>{
            console.log(e)
        })
        setUser([...user])
    }

    useEffect(()=>{

        getUser()

    },[])


    const sendRequest = async (index) => {
        // console.log(user[index])
        var uid = localStorage.getItem("uid")
        var email = localStorage.getItem("email")
        var name = localStorage.getItem("name")
        var image = localStorage.getItem("image")

        var key = db.ref("users").push().key

        var obj = {
            "SenderId" : uid,
            "SenderEmail" : email,
            "SenderName" : name,
            "SenderImage" : image,
            "RecieverId" :    user[index]["userUid"],
            "RecieverEmail":  user[index]["email"],
            "RecieverName" :  user[index]["name"],
            "RecieverImage" : user[index]["imageUrl"],
            "RequestId" : key,
            "RequestStatus" : "pending"
        }

        console.log(obj)

        await firestore.collection("Request").doc(key).set(obj)
        .then((snap)=>{
            alert("request has been send successfully")
            // console.log(snap)
            user[index]["send_status"] = true;
            user[index]["RequestId"] = key;
            console.log(user)
        })
        .catch((error)=>{
            alert(error)
        })
        setUser([...user])
    }

    function AllRequestPage(){
        nav("/request")
    }

   

    return(
        <>
         <div className="navbar" style={{ display: "flex", justifyContent: "space-around" }}>
                <Link to={"/user"}>User List Page</Link>
                <Link to={"/Request"}>Request</Link>
                <Link to={"/chatList"}>Friend List Page</Link>
                {/* <h1 onClick={()=> AllRequestPage()}>All Request</h1>   */}
         </div>

        
        {/* <div className="flex">
            <h1 style={{textAlign:"center"}}>User List</h1>
        </div> */}
        
        {
         user.map((v,i) => {
                return(
                    <div className="outer">
                        <div className="inner">
                            <img src={v.imageUrl} alt="" />
                            <p>{v.name}</p>
                            {v.send_status ?
                            <button className="btn"
                            onClick={()=> cancelRequest(i)}>cancel request</button> :     
                            <button className="btn"
                            onClick={()=> sendRequest(i)}>send request</button>
                            }
                        </div>
                        
                    </div>
                )

            })
        }   

        </>
    )

}

export default Users;