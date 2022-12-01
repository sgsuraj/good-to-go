// import { doc, getDoc } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import { useNavigate } from "react-router-dom";
// import { database } from "../firebaseConfig";
import '../CSS/All_content.css';
import { database } from "../firebaseConfig";
import def_user from '../images/def_user.jpg';

function ShowLikes(post_id){

    const nav_to = useNavigate()

    const get_data = async() => {
        let d = await getDoc(doc(database, "Posts", post_id))
        d = d.data()
        // let d = JSON.parse(localStorage.getItem("likes_info_data"))
        let all_likers_in_likes = d.likers;
        let all_likers_info_in_likes_info = d.likers_info;
        let all_likers_div_in_likes = (document.getElementById("post_info_box_in_likes") === null || document.getElementById("post_info_box_in_likes") === undefined) ? document.createElement("div") : document.getElementById("post_info_box_in_likes");
        all_likers_div_in_likes.style.border = "1px solid gray";
        

        let likes_title = document.getElementById("likes_title") === null ? document.createElement("div") : document.getElementById("likes_title");

        if(all_likers_in_likes.length === 0){
            likes_title.innerText = "No likes yet!";
        }else{
            likes_title.innerText = all_likers_in_likes.length+" likes";
        }

        all_likers_div_in_likes.innerHTML = ""

        for(let t = 0; t < 1; t++){
        for(let i=0; i<all_likers_in_likes.length; i++){

            let liker_info = document.createElement('div')
            liker_info.className = "liker_info"
            liker_info.style.padding = "0px 0px 0px 0px"
            liker_info.style.height = "fit-content"
            if(i !== 0){
                liker_info.style.borderTop = "1px solid gainsboro"
            }

            var a_liker = document.createElement('a')
            a_liker.className = "liker_email"
            a_liker.innerHTML = all_likers_in_likes[i]
            a_liker.style.float = "left"
            a_liker.style.margin = "10px 0px 10px 10px"
            a_liker.href = "/profile";

            var img_url = all_likers_info_in_likes_info[all_likers_in_likes[i]]

            let user_img = document.createElement("img");
            user_img.className = "user_img"
            user_img.src = await img_url;
            user_img.alt = "user images"
            user_img.style.float = "left"
            user_img.style.aspectRatio = "1"
            user_img.style.width = "11%"
            user_img.style.height = "auto"
            user_img.style.margin = "7px 2% 7px 2%"
            user_img.style.borderRadius = "100%"
            user_img.onerror = () => {
                user_img.src = def_user
            }

            liker_info.appendChild(user_img)
            liker_info.appendChild(a_liker)
            all_likers_div_in_likes.appendChild(liker_info)
        }}
        
        // alert("lll")
        // alert(window.screen.height + " " + document.getElementById("close_box_in_likes").getBoundingClientRect().height)
        try{
            document.getElementById("post_info_box_in_likes").style.maxHeight = document.getElementById("likes_page_main").getBoundingClientRect().height - 50 + "px"
        }catch{}
        // alert("lll")
        // alert(document.getElementById("likes_page_main").getBoundingClientRect().height)
    }

    // window.onload = get_data

    setTimeout(() => {
        get_data()
    }, 0)

    const go_back = () => {
        nav_to(-1)
        return
    }
    
    return(
        <div className="likes_page_main" id="likes_page_main">
            <div className="new_box" id="tot_box" style={{textAlign:"center", width: Math.min(window.screen.width, 400)+"px", height:"100%", margin:"auto"}}>
                <div className="close_box" id="close_box_in_likes" style={{width: Math.min(window.screen.width, 400)+"px", backgroundColor:"white", height:"50px", display:"flex", alignItems:"center", borderBottom: "1px solid gainsboro"}}>
                    <i className="fa fa-arrow-left" id="to_close" style={{width:"20%", height:"40px", display:"flex", alignItems:"center", fontSize:"35px", paddingLeft:"10px", float:"left", justifyContent:"left", textAlign:"left"}} onClick= {function() {
                        go_back()
                    }}></i>
                    <h4 id="likes_title" style={{width:"55%", height:"40px", display:"flex", float:"left", textAlign:"center", justifyContent:'center', alignItems:"center"}}>
                    </h4>
                </div>
                <div className="post_info_box" id="post_info_box_in_likes">
                        <i className="fa fa-spinner" style={{fontSize:"40px"}}></i>
                </div>
            </div>
        </div>
    )
    
}

export default ShowLikes;