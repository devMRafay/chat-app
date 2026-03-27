import { Route, Routes } from "react-router-dom";
import Home from "../Components/signup";
import Login from "../Components/Login";
import Users from "../Components/User";
import Request from "../Components/Request";
import MessageScreen from "../Components/MessageScreen";
import ChatList from "../Components/getChatList";



function Navigation () {
    return(
        <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/user" element={<Users/>}></Route>
            <Route path="/request" element={<Request/>}></Route>
            <Route path="/chatScreen" element={<MessageScreen/>}></Route>
            <Route path="/chatList" element={<ChatList/>}></Route>
        </Routes>
    )
}

export default Navigation;