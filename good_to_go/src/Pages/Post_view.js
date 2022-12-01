import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../CSS/Post_view.css'
import { database } from "../firebaseConfig";
import def_user from '../images/def_user.jpg';
import def_post from '../images/def_post.jpg';

export default function Post_view(post_id){

    const nav_to = useNavigate()
    let post_data = JSON.parse(localStorage.getItem("selected_post_detail"))
    const uid = localStorage.getItem("uid");
    let my_saved_email = localStorage.getItem(uid+"email")
    const [n_name, setn_name] = useState("")
    const [n_email, setn_email] = useState("")

    let set_post_seen = async() => {
        let new_seen = {}
        new_seen[post_id] = {seen: true}
        await setDoc(doc(database, "Notifications", my_saved_email), new_seen, {merge: true})
    }

    set_post_seen()

    const go_back = () => {
        nav_to(-1)
        return
    }

    const post_view_show_likes = (post_info) => {
        localStorage.setItem("selected_post_id", post_info[0])
        localStorage.setItem("likes_info_data", JSON.stringify(post_info[1]))
        nav_to("/likes/"+post_info[0]);
        return
    }

    const post_view_show_comments = (post_info) => {
        localStorage.setItem("selected_post_id", post_info[0])
        localStorage.setItem("comments_info_data", JSON.stringify(post_info[1]))
        nav_to("/comments/"+post_info[0])
        return
    }

    var unsub = () => {}

    const initialize_updates = async() => {
        await getDoc(doc(database, 'Posts', post_id)).then((doc) => {
            var btn = document.getElementById("post_view_like_btn") === null ? document.createElement("div") : document.getElementById("post_view_like_btn");
            try{
                if(doc.data().likers.includes(localStorage.getItem(uid+"email"))){
                    btn.style.color = "blue";
                }else{
                    btn.style.color = "white"
                }
                post_data = [post_id, doc.data()]
                if(localStorage.getItem(uid+"email") === post_data[1].email){
                    try{
                        document.getElementById("post_view_open_close_btn").innerHTML = (post_data[1].is_open ? 'close' : 'open') + " it now"
                        document.getElementById("post_view_open_close_btn").style.backgroundColor = (post_data[1].is_open ? 'orange' : 'greenyellow')
                        document.getElementById("post_view_open_close_btn").style.color = (post_data[1].is_open ? 'white' : 'black')
                    }catch{}
                }else{
                    try{
                        document.getElementById("post_view_open_close_btn1").innerHTML = (post_data[1].is_open ? 'open' : 'closed')
                        document.getElementById("post_view_open_close_btn1").style.backgroundColor = (post_data[1].is_open ? 'greenyellow' : 'orange')
                        document.getElementById("post_view_open_close_btn1").style.color = (post_data[1].is_open ? 'black' : 'white')
                    }catch{}
                }
                document.getElementById("post_view_num_likes").innerHTML = doc.data().likers.length + " likes &";
                document.getElementById("post_view_num_likes").onclick = () => {post_view_show_likes([post_id, doc.data()])}
                document.getElementById("post_view_num_comments").innerHTML = doc.data().commenters.length+ " comments"
                document.getElementById("post_view_num_comments").onclick = () => {post_view_show_comments([post_id, doc.data()])}
            }catch{}
        });
    }

    window.onunload = unsub

    const set_view = async() => {

        console.log(post_data)

        if( post_data === null || post_data === undefined || post_data.length < 1 || post_data[0] !== post_id){
            let post_data_doc = await getDoc(doc(database, "Posts", post_id));
            let new_data = post_data_doc.data()
            new_data["image_url"] = new_data.image
            post_data = [post_id, new_data]
            setn_name(new_data.name)
            setn_email(new_data.email)
        }

        let post_view_content = document.getElementById("post_view_content") === null ? document.createElement("div") : document.getElementById("post_view_content");
        post_view_content.innerHTML = ""

            let user_info_div = document.createElement("div")
            user_info_div.className = "user_info_div"

                let user_image_div = document.createElement("div")
                try{
                    user_image_div.className = "user_image_div"
                }catch{}

                    let post_view_user_image = document.createElement("img")
                    post_view_user_image.className = "post_view_user_image"
                    console.log(post_data[1].pic)
                    post_view_user_image.src = await post_data[1].pic === undefined ? def_user : post_data[1].pic;
                    post_view_user_image.alt = "pic"
                    post_view_user_image.onerror = (err) => {
                        err = null;
                        post_view_user_image.src = def_user
                    }
                    user_image_div.appendChild(post_view_user_image)
                user_info_div.appendChild(user_image_div)
            
                let user_data_div = document.createElement("div")
                user_data_div.className = "user_data_div"
                user_data_div.innerHTML = "<p style='margin:0px 0px 0px 0px; padding: 0px 0px 0px 0px'>" + post_data[1].name + "<br/>" + post_data[1].email +"</p>"
                user_info_div.appendChild(user_data_div)
            post_view_content.appendChild(user_info_div)

            let post_view_image_div = document.createElement("div")
            post_view_image_div.className = "post_view_image_div"

                let post_view_img_style = document.createElement("img")
                post_view_img_style.className = "post_view_img_style"
                post_view_img_style.src = await post_data[1].image_url === undefined ? def_post : post_data[1].image_url
                post_view_img_style.alt = "image"
                post_view_img_style.onerror = (err) => {
                    err = null;
                    post_view_img_style.src = def_post
                }
                post_view_image_div.appendChild(post_view_img_style)
            post_view_content.appendChild(post_view_image_div)
        
            let like_comment_icon_div = document.createElement("div")
            like_comment_icon_div.className = "like_comment_icon_div"

                let i1 = document.createElement("i")
                i1.className = "fa fa-thumbs-up"
                i1.id = "post_view_like_btn"
                i1.onclick = () => {
                    try{
                        post_view_like_post(post_data[1].likers.includes(my_saved_email))
                    }catch{}
                }
                like_comment_icon_div.appendChild(i1)

                let i2 = document.createElement("i")
                i2.className = "fa fa-comment"
                i2.onclick = () => {
                    post_view_show_comments(post_data)
                }
                like_comment_icon_div.appendChild(i2)

                let post_view_open_close_div = document.createElement("div")
                post_view_open_close_div.className = "post_view_open_close"
                post_view_open_close_div.id = "post_view_open_close"
                post_view_open_close_div.style.display = post_data[1].email === localStorage.getItem(uid+"email") ? "flex" : "none"

                    let post_view_status = document.createElement("div")
                    post_view_status.id = "post_view_status"
                    post_view_status.className = "post_view_status"
                    post_view_status.innerHTML = "Status : "+(post_data[1].is_open ? 'open' : 'closed')

                    let post_view_open_close_btn = document.createElement("button")
                    post_view_open_close_btn.className = "post_view_open_close_btn"
                    post_view_open_close_btn.id = "post_view_open_close_btn"
                    post_view_open_close_btn.type = "submit"
                    post_view_open_close_btn.onclick = function(){
                        try{
                            post_view_open_close_fun(post_data[1].is_open)
                        }catch{}
                    }
                    if(post_data[1].is_open === true){
                        post_view_open_close_btn.style.backgroundColor = "orange";
                        post_view_open_close_btn.style.color = "white"
                    }else{
                        post_view_open_close_btn.style.backgroundColor = "greenyellow";
                        post_view_open_close_btn.style.color = "black"
                    }
                    post_view_open_close_btn.innerHTML = (post_data[1].is_open ? 'close' : 'open') + " it now"
                    post_view_open_close_div.appendChild(post_view_status)
                    post_view_open_close_div.appendChild(post_view_open_close_btn)
                    // post_view_open_close_div.innerHTML += ""

                like_comment_icon_div.appendChild(post_view_open_close_div)

                let post_view_open_close1 = document.createElement("div")
                post_view_open_close1.className = "post_view_open_close"
                post_view_open_close1.style.display = post_data[1].email === localStorage.getItem(uid+"email") ? "none" : "flex"

                    let post_view_open_close_btn1 = document.createElement("button")
                    post_view_open_close_btn1.className = "post_view_open_close_btn"
                    post_view_open_close_btn1.id = "post_view_open_close_btn1"
                    post_view_open_close_btn1.innerHTML = post_data[1].is_open ? 'open' : 'closed'
                    post_view_open_close_btn1.style.backgroundColor = post_data[1].is_open ? "greenyellow" : "orange"
                    post_view_open_close_btn1.style.color = post_data[1].is_open ? 'black' : "white"
                    post_view_open_close_btn1.onclick = () => {
                        try{
                                if(post_data[1].is_open){
                                document.getElementById("accept_request_alert_main").style.display = "flex"
                                document.getElementById("accept_request_alert_box").style.width = Math.min(400, document.getElementById("accept_request_alert_main").getBoundingClientRect().width) + "px"
                            }else{
                                alert("Sorry! Request is closed!")
                            }
                        }catch{}
                    }
                    post_view_open_close1.appendChild(post_view_open_close_btn1)
                
                like_comment_icon_div.appendChild(post_view_open_close1)
            
            post_view_content.appendChild(like_comment_icon_div)

            let show_num_likes_comments_div = document.createElement("div")
            show_num_likes_comments_div.className = "show_num_likes_comments_div"

                let post_view_num_likes = document.createElement("b")
                post_view_num_likes.id = "post_view_num_likes"
                post_view_num_likes.innerHTML = post_data[1].likers !== undefined ? (post_data[1].likers.length + " likes &") : "0 likes &"
                post_view_num_likes.style.marginRight = "5px"
                post_view_num_likes.style.cursor = "pointer"
                post_view_num_likes.onclick = () => {
                    post_view_show_likes(post_data)
                }
                show_num_likes_comments_div.appendChild(post_view_num_likes)

                let post_view_num_comments = document.createElement("b")
                post_view_num_comments.id = "post_view_num_comments"
                post_view_num_comments.innerHTML = post_data[1].commenters.length + " comments"
                post_view_num_comments.style.cursor = "pointer"
                post_view_num_comments.onclick = () => {
                    post_view_show_comments(post_data)
                }
                show_num_likes_comments_div.appendChild(post_view_num_comments)

                let time_of_post = document.createElement("b")
                time_of_post.style.float = "right"
                time_of_post.style.fontSize = "small"
                time_of_post.style.marginRight = "10px"
                time_of_post.style.marginTop = "3px"
                try{
                    let post_time = new Date(post_data[1].timestamp.seconds*1000)
                    time_of_post.innerText = post_time.getFullYear() +"/"+ (JSON.stringify(post_time.getMonth()).length === 1 ? "0"+post_time.getMonth() : post_time.getMonth()) +"/"+ (JSON.stringify(post_time.getDate()).length === 1 ? "0" + post_time.getDate() : post_time.getDate()) +" "+ (JSON.stringify(post_time.getHours()).length === 1 ? "0"+post_time.getHours() : post_time.getHours()) + ":" + (JSON.stringify(post_time.getMinutes()).length === 1 ? "0" + post_time.getMinutes() : post_time.getMinutes());
                }catch{time_of_post.innerText = "--/--/-- --:--:--"}

                show_num_likes_comments_div.appendChild(time_of_post)
            
            post_view_content.appendChild(show_num_likes_comments_div)

                let post_view_comment_div = document.createElement("post_view_comment_div")
                post_view_comment_div.className = "post_view_comment_div"
                post_view_comment_div.id = 'post_view_comment_div'
            
            post_view_content.appendChild(post_view_comment_div)
            try{
                document.getElementById("post_view_title").innerHTML = "Post"
            }catch{}

            await initialize_updates()
            try{
                show_comments_post_view()
            }catch{}
    }
    

    const show_comments_post_view = () => {
        let comment_to_show = document.getElementById("post_view_comment_div") === null ? document.createElement("div") : document.getElementById("post_view_comment_div")
        comment_to_show.innerHTML = ""
        try{
            let comment_words = post_data[1].comment.split(" ")
            comment_words.forEach(word => {
                if(word.startsWith("#")){
                    comment_to_show.innerHTML += "<b>"+word+" </b>"
                }else{
                    comment_to_show.innerHTML += word + " "
                }
            });
        }catch{
            comment_to_show.innerHTML = "..."
        }
    }

    const post_view_like_post = async(is_in) => {
        let g = document.getElementById("post_view_like_btn") === null ? document.createElement("div") : document.getElementById("post_view_like_btn");
        if(!is_in){
            g.style.color = "blue"
            g.style.animation = "0.1s liking step-start";
            setTimeout(() => {
                g.style.animation = "";
            }, 100);
        }else{
            g.style.color = "white"
            g.style.animation = "0.1s liking step-start";
            setTimeout(() => {
                g.style.animation = "";
            }, 100);
        }
        await getDoc(doc(database, 'Posts', post_id)).then( async(res) => {
            let new_likers = res.data().likers === undefined ? [] : res.data().likers;
            let new_likers_info = res.data().likers_info === undefined ? {} : res.data().likers_info;
            let new_like = false
            if(new_likers.includes(my_saved_email)){
                new_likers.splice(new_likers.indexOf(my_saved_email), 1)
                delete new_likers_info[my_saved_email]
            }else{
                new_like = post_data[1].email === my_saved_email ? false : true;
                new_likers.push(my_saved_email)
                new_likers_info[my_saved_email] = localStorage.getItem(uid+"image")
            }

            post_data.likers = new_likers
            post_data.likers_info = new_likers_info;
            try{
                g.onclick = () => post_view_like_post(new_likers.includes(my_saved_email))
                document.getElementById("post_view_num_likes").innerText = new_likers.length.toString()+" likes &"
            }catch{}
            let new_noti_to_save = {}
            if(new_like){
                new_noti_to_save["new"] = (post_data.email === my_saved_email ? false: true)
            }
            new_noti_to_save[post_id] = {
                type: "like&comment",
                id: post_id,
                seen: (post_data.email === my_saved_email ? true: false),
                time: serverTimestamp(),
                likers: new_likers,
                image_url: res.data().image,
                likers_info: new_likers_info
            }
            let new_likes_data = res.data()
            new_likes_data.likers = new_likers
            new_likes_data.likers_info = new_likers_info
            await setDoc(doc(database, 'Posts', post_id), new_likes_data)
            await setDoc(doc(database, 'Notifications', res.data().email), new_noti_to_save, {merge: true})
        })
    }

    const post_view_open_close_fun = async(is_it_open) => {
        if(window.confirm("Confirm to "+ (is_it_open ? 'close' : 'open'))){
            let new_data_to_store = post_data[1];
            new_data_to_store.is_open = !is_it_open
            await setDoc(doc(database, 'Posts', post_id), new_data_to_store);
            post_data = [post_id, new_data_to_store]
            localStorage.setItem("selected_post_detail", JSON.stringify(post_data))
            document.getElementById("post_view_status").innerHTML = "Status : " + (!is_it_open ? 'open' : 'closed')
            let temp = document.getElementById("post_view_open_close_btn");
            temp.innerHTML = (!is_it_open ? 'close' : 'open') + ' it now';
            temp.onclick = () => {post_view_open_close_fun(!is_it_open)}
            temp.style.backgroundColor = !is_it_open ? 'orange' : 'greenyellow'
            temp.style.color = !is_it_open ? 'white' : 'black'
        }
    }

    // window.onload = set_view

    const close_box = () => {
        document.getElementById("accept_request_alert_main").style.display = "none"
    }
    
    const accept_it = async() => {
        let id = post_data[0]
        let acc_btn = document.getElementById("accept_request_button_yes") === null ? document.createElement("div") : document.getElementById("accept_request_button_yes")
        if(acc_btn !== null && acc_btn !== undefined){
            acc_btn.disabled = true
            acc_btn.innerHTML = "<i class='fa fa-spinner' style='font-size:25px'></i>"
        }
        await getDoc(doc(database, "Notifications", post_data[1].email)).then( async(res) => {
            let pre_people = []
            let pre_people_info = {}
            if(res.exists()){
                if(res.data()[id+"connect"] !== undefined){
                    pre_people = res.data()[id+"connect"].people === undefined ? [] : res.data()[id+"connect"].people
                    pre_people_info = res.data()[id+"connect"].people_info === undefined ? {} : res.data()[id+"connect"].people_info
                }
            }
            if(!pre_people.includes(my_saved_email)){
                pre_people.push(my_saved_email)
            }else{
                pre_people.splice(pre_people.indexOf(my_saved_email), 1)
                pre_people.push(my_saved_email)
            }
            pre_people_info[my_saved_email] = localStorage.getItem(uid+"image") === null ? def_user : localStorage.getItem(uid+"image")
            let one_new_noti = {}
            one_new_noti["new"] = true
            one_new_noti[id+"connect"] = {
                type: "connect",
                id: id,
                seen: false,
                image_url: ( post_data[1].image === undefined ? ( post_data[1].image_url === undefined ? def_post : post_data[1].image_url) : post_data[1].image),
                time: serverTimestamp(),
                people: pre_people,
                people_info: pre_people_info
            }
            await setDoc(doc(database, "Notifications", post_data[1].email), one_new_noti, {merge: true})
            acc_btn.innerHTML = "<i class='fa fa-check' style='font-size:20px'></i>"
            acc_btn.disabled = false
            setTimeout(() => {
                acc_btn.innerHTML = "Yes"
            }, 4000);
        })
    }
    
    setTimeout(() => {
        set_view()
    }, 0);

    return(
        <div className="post_view_full">
            <div id="accept_request_alert_main" className="accept_request_alert_main">
                <div id="accept_request_alert_box" className="accept_request_alert_box">
                    <div id="close_accept_request_box" className="close_accept_request_box" style={{padding: "0px 0px"}}>
                        <i className="fa fa-times" style={{fontSize:"25px", padding:"10px 15px"}} onClick={close_box} ></i>
                    </div>
                    <div className="accept_request_content" id="accept_request_content">
                        <h3>Do you want to accept the request?</h3> <button type="submit" className="accept_request_button" id="accept_request_button_yes" style={{backgroundColor: "greenyellow", fontSize:"large"}} onClick={accept_it} >Yes</button> <button type="submit" id="accept_request_button_no" className="accept_request_button" onClick={close_box} style={{backgroundColor: "orange", color:"white", fontSize:"large"}}>No</button>
                    </div>
                    <div id="accept_request_actions_main" className="accept_request_actions_main">
                        <div id="accept_request_actions_box" className="accept_request_actions_box">
                            <a id="mail_with_desktop" target={"_blank"} rel={"noreferrer"} href={"https://mail.google.com/mail/?view=cm&fs=1&tf=1&to="+n_email+"&su="+n_name+", I would like to connect with you for...&body=Hey "+n_name+", I found your post: http://localhost:3000/post/"+post_id+" interesting. Could you pass a brief about your post."} className="accept_request_actions_button" style={{marginRight:"5%"}}>Mail  with desktop</a>
                            <a id="mail_with_phone" target={"_blank"} rel={"noreferrer"} href={"mailto:"+ n_email +"?subject="+n_name+" I would like to connect with you for...&body=Hey "+n_name+", I found your post: http://localhost:3000/post/"+post_id+" interesting. Could you pass a brief about your post."} className="accept_request_actions_button" style={{marginLeft:"5%"}}>Mail with phone</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="post_view_main">
                <div className="post_view_title">
                    <h3 id="post_view_title" className="post_view_post">
                        <i className="fa fa-spinner"></i>
                    </h3>
                    <div className="post_view_back">
                        <i id="fa-angle-left" className="fa fa-angle-left" style={{border: "none", padding: "0px 10px 0px 10px", margin: "0px 0px 0px 0px", borderRadius:"0px", fontSize:"30px"}} onClick={go_back}></i>
                    </div>
                </div>
                <div className="post_view_content" id="post_view_content">
                </div>
            </div>
        </div>
    )
}