import React from "react";
import Navbar from "./Navbar";
import '../CSS/New_post.css';
import { useState } from "react";
import { app, database } from "../firebaseConfig";
import { collection, serverTimestamp, addDoc, setDoc, doc, getDocs, query, where} from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytesResumable} from 'firebase/storage';
import Login from "./Login";

// import image from '../images/empty_image.jpg';

function New_Post(){

    const uid = localStorage.getItem('uid');
    
    const email = localStorage.getItem(uid+'email');
    const name = localStorage.getItem(uid+'name');
    const image = localStorage.getItem(uid+'image');

    const [image_file, setimage_file] = useState(null);
    const [tags, settags] = useState([]);
    const [image_name, setimage_name] = useState("");
    const [input_comment_txt, setcomment_input_txt] = useState("")

    if(localStorage.getItem(uid+"user_in") !== "y"){
        return(Login())
    }

    const storage = getStorage(app);
    const collectionRef = collection(database, 'Posts');

    const put_pic = (img_data) => {
        var file = img_data;
        let reader = new FileReader()
        reader.readAsDataURL(file);
        reader.onerror = (err) => {
            alert(err.message);
        }
        reader.onload = () => {
            var pic_box = document.getElementById('image_place');
            pic_box.className = "background_img_i";
            pic_box.innerHTML = "<img class='image' src=".concat(reader.result).concat(" alt='image'/>")
            document.getElementById("image_input_box").style.display = "flex"
        };
    }

    const tags_fun = (e) => {
        let new_str = e.target.value.replaceAll("\n", " ")
        let words_arr = new_str.split(" ")
        let tags_div = document.getElementById("all_tags")
        tags_div.innerHTML = "<b>Tags: </b>"
        let new_tags_arr = []
        words_arr.forEach(word => {
            if(word.startsWith("#") && word.length > 1){
                tags_div.innerHTML += "<b>"+ word +"</b> "
                new_tags_arr.push(word.substring(1).toLowerCase())
            }
        })
        settags(new_tags_arr)
        if(new_tags_arr.length === 0){
            tags_div.innerHTML = "Please put some tags in order to help interested people reach your post... (#sample_tag)"
        }
    }

    const post = async() => {
        if(image_file != null && input_comment_txt.length > 0){
            const server_Timestamp = serverTimestamp();
            const storageRef = ref(storage, 'Post_images/'+email+'/'+ Math.floor(Date.now() / 1000).toString() +image_name);
            const uploadTask = uploadBytesResumable(storageRef, image_file);
            uploadTask.on('state_changed',
                (snapshot) => {
                    document.getElementById('card').style.opacity = 0.5;
                    document.getElementById('uploading').innerHTML = '<i class="fa fa-spinner fa-5x"></i>';
                    document.getElementById('uploading').style.width = "70%";
                    document.getElementById('uploading').style.height = '350px';
                }, 
                (error) => {
                    alert("error! post not uploaded!")
                }, 
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
                        await addDoc(collectionRef, {
                            email: email,
                            image: downloadURL,
                            tags: tags,
                            comment: input_comment_txt,
                            timestamp: server_Timestamp,
                            name: name,
                            is_open: true,
                            pic: image,
                            likers: [],
                            likers_info: {},
                            commenters: [],
                            commenters_info: {}
                        })
                        .then( async function(docref){

                            // let pre_posts = await getDoc(doc(database, 'data', "all_posts_arr"));
                            // pre_posts = pre_posts.exists() ? pre_posts.data().arr || [] : [];
                            
                            // await setDoc(doc(database, 'data', 'all_posts_arr'), {
                            //     arr: [...pre_posts, docref.id]
                            // }, {merge: true})

                            await getDocs(query(collection(database, "Interests"), where("interests", "array-contains-any", tags))).then( async(ress) => {
                                if(ress.docs.length > 0){
                                    for(let d of ress.docs){
                                        let new_noti_to_save = {}
                                        new_noti_to_save["new"] = true
                                        new_noti_to_save[docref.id] = {
                                            type: "tags",
                                            id: docref.id,
                                            email: email,
                                            seen: false,
                                            time: serverTimestamp(),
                                            image_url: downloadURL
                                        }
                                        await setDoc(doc(database, "Notifications", d.id), new_noti_to_save, {merge: true})
                                    }
                                }
                            })

                            document.getElementById('alert_message_box').style.display = "block";
                            document.getElementById('card').style.opacity = 1;
                            document.getElementById('uploading').innerHTML = '';
                            document.getElementById('uploading').style.width = "0px";
                            document.getElementById('uploading').style.height = '0px';
                                                    
                            setTimeout(() => {
                                document.getElementById('alert_message_box').style.display = "none";
                            }, 4000);
                            
                            settags('');
                            document.querySelectorAll("#image_inp").forEach((input) => {
                                input.value = '';
                            })
                            document.querySelectorAll('#tag_inp').forEach(input => {
                                input.value = '';
                            });
                            document.getElementById("all_tags").innerHTML = '';
                            var pic_box_reset = document.getElementById('image_place');
                            pic_box_reset.className = "background_img";
                            pic_box_reset.innerHTML = '';

                        })
                        .catch((err) => {
                            alert(err.message)
                        })
                    });
                }
            );
        }else{
            if(image_file == null){
                alert("Please choose an image!")
            }else{
                alert("Please add a comment")
            }
        }
    }

    const adjust_all = () => {
        document.getElementById("form_body_x").style.height = document.getElementById("new_post_main").getBoundingClientRect().height - 100 + "px";
        // document.getElementById("form_body_x").style.marginTop = "50px"
    }

    const hide_it = () => {document.getElementById('alert_message_box').style.display = "none"}

    return(
        <div className="new_post_full" id="new_post_full" onLoad={adjust_all}>
        <div id="new_post_main" className="new_post_main" style={{width:Math.min(400, window.screen.width)+"px"}}>
            <div className="header_in_all" id="header_in_all" style={{width:Math.min(400, window.screen.width) + "px"}}>
                <Navbar active="newpost"/>
            </div>
            <div className="form_body_x" id="form_body_x" style={{width:Math.min(400, window.screen.width) + "px"}}>
                <div id="alert_message_box" className="alert_message_box">
                    <div className="alert_message">Post uoloaded successfully! <i id="remove_alert" className="fa fa-times" onClick={hide_it}></i></div>
                </div>
                <div className="form" id="input_post_form">
                    <div id="card" className="form_card">
                        <div className="image_input_box" id="image_input_box">
                            <div id="image_place" className="background_img"></div>
                        </div>
                        <div className="data_input_box">
                            <div className="image_input">
                                <input id="image_inp" className="btn_file" type="file" onChange={(e) => {setimage_file(e.target.files[0]); put_pic(e.target.files[0]); setimage_name(e.target.files[0].name)}} accept="image/png, image/jpeg"/>
                            </div>
                            <div className="comment_input_div_in_new_post">
                                <div className="all_tags" id="all_tags">
                                    <p>Please put some tags in order to help people reach your post... (#sample_tag)</p>
                                </div>
                                <textarea type="text" maxLength={300} placeholder="enter comment and tags here..." className="comment_input_textarea" onChange={(e) => {setcomment_input_txt(e.target.value); tags_fun(e)}}></textarea>
                            </div>
                                {/* <i className="fa fa-check fa-3x" style={{height:"40px", width:"40px", right:"0px", float:"right", marginTop:"-41px", marginRight:"1px", cursor:"pointer"}}></i> */}
                        </div>
                        <div id="uploading" className="post_uploading">
                        </div>
                    </div>
                </div>
            </div>
            <div className="post_area" style={{width:Math.min(400, window.screen.width) + "px"}}>
                <button type="submit" className="post_button" onClick={post}>Post</button>
            </div>
        </div>
        </div>
    )
}

export default New_Post