import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../firebaseConfig";

export default function RequestStatus(post_id){
    const navigate_to = useNavigate()
    let post_image = ""

    const get_data = async() => {
        let d = await getDoc(doc(database, "Posts", post_id))
        post_image = d.data().image;
        let f = document.createElement("img")
        f.style.maxHeight = "225px"
        f.style.maxWidth = "90%"
        f.style.background = "gray"
        f.style.height = "auto"
        f.style.width = "auto"
        f.style.margin = "auto"
        f.src = post_image
        f.alt = "lll"
        document.getElementById("img_set").innerHTML = ""
        document.getElementById("img_set").appendChild(f)


        let moves_div = document.createElement("div")
        moves_div.style.width = "100%"
        moves_div.style.height = "fit-content"
        moves_div.style.display = "flex"
        moves_div.style.marginTop = "30px"
        moves_div.style.marginBottom = "20px"
        moves_div.style.justifyContent = "center"
        moves_div.style.alignItems = "center"

        let req_is_open_or_close = document.createElement("h4")
        let tr = Math.random() > 0.99 ? false : true;
        req_is_open_or_close.style.color = tr ? "black" : "white"
        req_is_open_or_close.style.backgroundColor = tr ? "rgb(132, 255, 0)" : "orange"
        req_is_open_or_close.style.width = tr ? "40%" : "70%";
        req_is_open_or_close.style.height = "fit-content"
        req_is_open_or_close.style.padding = "10px 0px"
        req_is_open_or_close.style.margin = tr ? "0px 5% 0px 0px" : "0px"
        req_is_open_or_close.style.float = "left"
        req_is_open_or_close.style.display = "block"
        req_is_open_or_close.innerText = tr ? "Request is open" : "Request has been closed!";

        moves_div.appendChild(req_is_open_or_close)

        let mail_owner_btn = document.createElement("a")
        mail_owner_btn.className = "request_action"
        mail_owner_btn.href = "mailto:customer@email.com?subject=InformationRequested&body=Here's more information. http://www.website.com/info/info.pdf"+post_id;
        mail_owner_btn.target = "_blank"
        mail_owner_btn.innerHTML = "<i class='fa fa-envelope'></i> Mail Owner";

        if(tr){
            moves_div.appendChild(mail_owner_btn);
        }

        document.getElementById("post_info_box_in_likes").innerHTML = ""
        document.getElementById("post_info_box_in_likes").appendChild(moves_div)


    }


    const go_back = () => {
        navigate_to(-1)
        return
    }

    setTimeout(() => {
        get_data()
    }, 0);

    return(
        <div className="box" id="tot_box" style={{textAlign:"center", width: Math.min(window.screen.width, 400)+"px", height:"100%", margin:"auto"}}>
                <div className="close_box" id="close_box_in_likes" style={{width: Math.min(window.screen.width, 400)+"px", backgroundColor:"white", height:"50px", display:"flex", alignItems:"center", borderBottom: "1px solid gainsboro"}}>
                    <i className="fa fa-arrow-left" style={{width:"20%", height:"40px", marginLeft:"10px", marginTop:"5px", float:"left", fontSize:"30px", paddingTop:"0px"}} onClick= {function() {
                        go_back()
                    }}></i>
                </div>
                <div className="post_image_box" style={{alignItems:"center", justifyContent:"center", backgroundColor: "whitesmoke", marginTop:"50px"}} id="img_set">
                    <div style={{width: "100%",height:"fit-content", justifyContent:"center", display:"flex", alignItems:"center", fontSize:"40px"}} id="cur_reloading">
                        <i className="fa fa-spinner"></i>
                    </div>
                </div>
                <div className="post_info_box" id="post_info_box_in_likes" style={{border: "none"}}>
                </div>
            </div>
    )
}