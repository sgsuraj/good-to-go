import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React from "react";
import { database } from "../firebaseConfig";
import '../CSS/All_content.css';
import { useNavigate } from "react-router-dom";
import def_user from '../images/def_user.jpg';

function ShowComments(post_id){
    // var post_image = "dsnlkd"
    let btm = true;
    const uid = localStorage.getItem("uid");
    const nav_to = useNavigate()
    const my_saved_email = localStorage.getItem(uid+"email")


    const post_comment = async(id, comm, my_email, kk) => {
        let posting_comment = document.createElement('i')
        posting_comment.id = "posting_comment"
        posting_comment.className = "fa fa-spinner";
        posting_comment.style.color = "yellow"
        posting_comment.style.marginLeft = "5px"

        try{
        document.getElementById("post_comment_btn").appendChild(posting_comment)
        }catch{}

        const got_doc = await getDoc(doc(database, "Posts", id));
        if(got_doc.exists() && got_doc.data() !== undefined && got_doc.data() !== null){
            let got_data = got_doc.data();
            let pre_comments = got_data.commenters === undefined ? [] : got_data.commenters;
            let pre_comment_info = got_data.commenters_info === undefined ? {} : got_data.commenters_info;
            if(pre_comments.includes(my_email)){
                pre_comments.splice(pre_comments.indexOf(my_email), 1)
            }
            pre_comments.push(my_email)
            const photo = localStorage.getItem(uid+"image");
            pre_comment_info[my_email] = [comm, photo];
            let new_data = got_data;
            new_data.commenters = pre_comments
            new_data.commenters_info = pre_comment_info;
            
            let new_doc_to_save = {}
            new_doc_to_save["new"] = (new_data.email === my_saved_email ? false: true);
            new_doc_to_save[id] = {
                type: "like&comment",
                id: id,
                seen: (new_data.email === my_saved_email ? true: false),
                time: serverTimestamp(),
                commenters: pre_comments,
                commenters_info: pre_comment_info
            }
            
            await setDoc(doc(database, "Posts", id), new_data)
            await setDoc(doc(database, 'Notifications', got_doc.data().email), new_doc_to_save, {merge: true})
            kk.value = ""
            
            document.getElementById("post_comment_btn").innerHTML = "Commented <i class='fa fa-check'></i>"
            // document.getElementById("posting_comment").parentNode.removeChild(document.getElementById("posting_comment"))
            // document.getElementById("post_comment_btn").appendChild(post_commented)

            get_data(true)

            setTimeout(() => {
                try{
                    document.getElementById("post_comment_btn").innerHTML = "Post new comment"
                }catch{}
            }, 4000)
        }
    }

    const get_data = async(do_refresh) => {
        let d = JSON.parse(localStorage.getItem("comments_info_data"));
        if(do_refresh === true){
            d = await getDoc(doc(database, "Posts", post_id));
            d = d.data()
            localStorage.setItem("comments_info_data", JSON.stringify(d))
        }
        let commenters = d.commenters;
        commenters.reverse()
        let all_commenters_in_comments = d.commenters;

        let new_comment_box = document.createElement('div')
        new_comment_box.className = "new_comment_box";
        new_comment_box.id = "new_comment_box"
        
        let input_comment_box = document.createElement("div")
        input_comment_box.className = "comment_input_box"
            
        let input_comment = document.createElement('textarea')
        input_comment.className = "new_comment_input"
        input_comment.id = "input_comment"
        input_comment.cols = 50
        input_comment.rows = 5
        input_comment.style.border = "2px solid blueviolet"
        input_comment.style.borderRadius = "5px"
        input_comment.placeholder = "Add your comment here..."
        input_comment.maxLength = 200;
        input_comment.style.width = "80%"
        
        input_comment_box.appendChild(input_comment)
        
        new_comment_box.appendChild(input_comment_box)
        
        let comment_post_btn_box = document.createElement("div")
        comment_post_btn_box.className = "comment_post_btn_box"
        
        let post_comment_btn = document.createElement('button')
        post_comment_btn.textContent = "Post new comment"
        post_comment_btn.className = "post_comment_btn"
        post_comment_btn.id = "post_comment_btn";
        post_comment_btn.onclick = () => {if(input_comment.value.length > 0){post_comment(post_id, input_comment.value, localStorage.getItem(uid+"email"), input_comment)}}
        
        comment_post_btn_box.appendChild(post_comment_btn)
        
        new_comment_box.appendChild(comment_post_btn_box)
        
        try{
            document.getElementById("new_comment_box").parentElement.removeChild(document.getElementById("new_comment_box"))
        }catch{}
        document.getElementById("new_comment_box_div").appendChild(new_comment_box)
        
        let comment_title = document.getElementById("comments_title")
        

        if(all_commenters_in_comments.length === 0){
            comment_title.innerText = "0 comments"
        }else{
            comment_title.innerText = all_commenters_in_comments.length + " comments";
        }

        let all_commenters_div_in_comments = document.getElementById("post_info_box_in_comments");
        all_commenters_div_in_comments.style.width = "100%"
        all_commenters_div_in_comments.style.paddingLeft = "10px"
        all_commenters_div_in_comments.style.marginBottom = "0px"
        all_commenters_div_in_comments.style.border = "1px solid gray"


        let all_comments_box_main = document.createElement("div");
        all_comments_box_main.className = "all_comments_box_main"

        let all_comments_box = document.getElementById('post_info_box_in_comments')

        try{
            document.getElementById("box").parentNode.removeChild(document.getElementById("box"))
        }catch{
        }
        
        document.getElementById("post_info_box_in_comments").innerHTML = ""

        for(let h = 0; h<1; h++){
            for(let i=0; i<commenters.length; i++){
                let one_comment_box = document.createElement('div')
                one_comment_box.className = "one_comment_box";
                one_comment_box.id = "one_comment_box"
                if(i !== 0){
                    one_comment_box.style.borderTop = "1px solid gainsboro"
                }

                    let user_info_box_in_comment = document.createElement('div');
                    user_info_box_in_comment.className = "user_info_box_in_comment";

                        let usr_info_box = document.createElement('div')
                        usr_info_box.className = "usr_info"

                            var img_url = Object.keys(d.commenters_info).includes(commenters[i]) ? d.commenters_info[commenters[i]][1] : def_user;

                            let usr_img = document.createElement('img');
                            usr_img.className = "usr_img"
                            usr_img.src = img_url
                            usr_img.alt = "user image"
                            usr_img.style.borderRadius = "50%"
                            usr_img.onerror = (err) => {
                                err = null;
                                usr_img.src = def_user
                            }

                            usr_info_box.appendChild(usr_img)

                            let usr_email = document.createElement('div')
                            usr_email.className = "usr_email";
                            
                                let email_link = document.createElement('a')
                                email_link.className = "comm_link"
                                email_link.href = "/profile"
                                // email_link.style.marginLeft = "5px"
                                email_link.innerHTML = commenters[i]

                                usr_email.appendChild(email_link)
                            
                            usr_info_box.appendChild(usr_email)
                        
                        user_info_box_in_comment.appendChild(usr_info_box)

                        let the_comment_box = document.createElement("div");
                        the_comment_box.className = "the_comment_box";
                        
                        let the_comment = document.createElement('p')
                        the_comment.innerHTML = d.commenters_info[commenters[i]][0];

                        the_comment_box.appendChild(the_comment)

                        user_info_box_in_comment.appendChild(the_comment_box)
                    
                    one_comment_box.appendChild(user_info_box_in_comment)
                all_comments_box.appendChild(one_comment_box)
            }
        }
        document.getElementById("post_info_box_in_comments").style.maxHeight = document.getElementById("comments_page_main").getBoundingClientRect().height - 240 + "px"
        // alert(document.getElementById("new_comment_box_div").getBoundingClientRect().height)
        document.getElementById("post_info_box_in_comments").style.padding = "0px 0px 0px 0px"
        document.getElementById("post_info_box_in_comments").style.margin = "0px 0px 0px 0px"

    }


    setTimeout(() => {
        get_data(true)
    }, 0);

    const go_back = () => {
        nav_to(-1)
        return
    }


    const scroll_to_top = () => {
        if(btm){
            document.getElementById("new_comment_box_div").style.display = "none"
            document.getElementById("post_info_box_in_comments").style.maxHeight = document.getElementById("post_info_box_in_comments").getBoundingClientRect().height + 200 + "px"
            document.getElementById("to_scroll").className = "fa fa-arrow-down"
            btm = false
        }else{
            document.getElementById("new_comment_box_div").style.display = "block"
            document.getElementById("post_info_box_in_comments").style.maxHeight = document.getElementById("post_info_box_in_comments").getBoundingClientRect().height - 200 + "px"
            document.getElementById("to_scroll").className = "fa fa-arrow-up"
            btm = true
        }
    }
    
    return(
        <div className="comments_page_main" id="comments_page_main">
            <div className="new_box" style={{textAlign:"center", width: Math.min(window.screen.width, 400)+"px", height:"100%", margin:"auto"}}>
                <div className="close_box" id="close_box_in_comments" style={{width: Math.min(window.screen.width, 400)+"px", backgroundColor:"white", height:"40px", display:"flex", alignItems:"center", borderBottom: "1px solid gainsboro"}}>
                    <i className="fa fa-times" id="to_close" style={{width:"10%", display:"flex", alignItems:"center", paddingLeft:"5px", height:"40px", float:"left", fontSize:"35px", paddingTop:"0px"}} onClick= {function() {
                        go_back()
                    }}></i>
                    <h4 id="comments_title" style={{width:"80%", height:"40px", float:"left", textAlign:"center", justifyContent:'center', display:"flex", alignItems:"center"}}><i id="loading_comments" className="fa fa-spinner" style={{fontSize:"25px"}}></i>
                    </h4>
                    <div id="scroll_to_top" style={{width:"10%", height:"40px", display:"flex", alignItems:"center", float:"right", textAlign:"right", marginTop:"0px", justifyContent:"right"}}>
                        <i className="fa fa-arrow-up" id="to_scroll" style={{fontSize: "35px", backgroundColor:"white", borderRadius:"50%", display:"flex", alignItems:"center", paddingRight:"5px"}} onClick={scroll_to_top} ></i>
                    </div>
                </div>
                <div id="new_comment_box_div" style={{width:"100%", height:"200px", overflow:"scroll", float:"left"}}>
                </div>
                <div className="post_info_box" id="post_info_box_in_comments" style={{border: "none", padding:"0px 0px 0px 0px", margin:"0px 0px 0px 0px"}}>
                </div>
            </div>
        </div>
    )
}

export default ShowComments;