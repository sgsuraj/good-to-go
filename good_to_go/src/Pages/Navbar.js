import { getAuth } from 'firebase/auth';
import React, { useEffect } from 'react';
import '../CSS/Navbar.css'
import { useNavigate } from 'react-router-dom';
import { app } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import def_user from '../images/def_user.jpg'
import { my_img } from '../App';

export let ring_the_bell = () => {}

export let logout = () => {}

function Navbar(props) {

    const auth = getAuth(app);
    const navigate = useNavigate();

    let go_out = false

    useEffect(() => {
        if(go_out){
            navigate("/")
        }
    }, [go_out, navigate])

    logout = () => {
        if (window.confirm('Tussi jaa rhe ho :)')) {
            auth.signOut().then(() => {
                localStorage.clear()
                go_out = true;
            })
            .catch((err) => {
                alert(err.message)
            })
          }        
    }

    const uid = localStorage.getItem('uid');

    let my_inte_arr = props.my_inte_arr
    if(props.my_inte_arr === undefined || props.my_inte_arr === []){
        my_inte_arr = JSON.parse(localStorage.getItem("my_inte_arr") || '[]')
    }

    ring_the_bell = () => {
        if(localStorage.getItem("are_new_noti") === 'y'){
            if(props.disable_anime !== true){
                try{
                    document.getElementById('bell').style.animation = "4s ring infinite";
                }catch{}
            }
        }
    }    

    // gg = async(querySnapshot) => {
    //     if(querySnapshot.docs.length > 0){
    //         let to_cmp = []
    //         let noti_data = {}
    //         querySnapshot.docs.forEach((a_doc) => {
    //             to_cmp.push(a_doc.id);
    //             noti_data[a_doc.id] = a_doc.data()
    //         })
    //         to_cmp.sort();
    //         if(localStorage.getItem("last_seen_data") !== JSON.stringify(to_cmp)){
    //             ring_the_bell()
    //             let to_do = localStorage.getItem("new_seen_data") === JSON.stringify(to_cmp) ? false : true
    //             if(to_do){
    //                 let all_pre_noties = JSON.parse(localStorage.getItem("all_noties_local_data") || '[]')
    //                 let now_time = serverTimestamp()
    //                 let new_noti_item = {
    //                     time: now_time,
    //                     type: "tags",
    //                     data: noti_data,
    //                     seen: false,
    //                     textContent: "We found some posts matching your interests"
    //                 }
    //                 let new_all_pre_noties = []
    //                 all_pre_noties.forEach((noti) => {
    //                     if(noti.type !== "tags"){
    //                         new_all_pre_noties.push(noti)
    //                     }
    //                 })
    //                 await setDoc(doc(database, 'Notifications', localStorage.getItem(uid+"email"), "MyNoti", "tags"), new_noti_item, {merge: false})
    //                 new_all_pre_noties.push(new_noti_item)
    //                 all_pre_noties = new_all_pre_noties
    //                 localStorage.setItem("all_noties_local_data", JSON.stringify(all_pre_noties))
    //                 localStorage.setItem("noti_data", JSON.stringify(noti_data))
    //                 localStorage.setItem("new_seen_data", JSON.stringify(to_cmp))
    //             }
    //         }else{

    //         }
            
    //     }else{
    //         document.getElementById('bell').style.animation = "";
    //     }
    // }

    if(my_inte_arr.length > 0){
            // rr(my_inte_arr)
    }else{
        // clear_tags()
        localStorage.setItem("noti_data", JSON.stringify({}))
        localStorage.setItem("new_seen_data", JSON.stringify([]))
        let new_all_noties_local_data = []
        JSON.parse(localStorage.getItem("all_noties_local_data") || '[]').forEach((noti) => {
            if(noti.type !== "tags"){
                new_all_noties_local_data.push(noti)
            }
        })
        localStorage.setItem("all_noties_local_data", new_all_noties_local_data)
        // setTimeout(() => {
        //     document.getElementById('bell').style.animation = "";
        // }, 0)
    }

    setTimeout(() => {
        try{
            document.getElementById("my_pic").onerror = (err) => {
                document.getElementById("my_pic").src = def_user
            }
        }catch{}
    }, 0);

    return(
        <div onLoad={ring_the_bell}>
        <div className='navbar_main'>
            {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}
            {/* <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" /> */}
            {/* <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossOrigin="anonymous"></script> */}
            {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossOrigin="anonymous"></script> */}
            {/* <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossOrigin="anonymous"></script>             */}
            
                    <ul className="navbar_nav" id="main_nav">
                        <li className='nav_item' id="id_home">
                        <Link id="home" className="Link_a" to="/home" ><i className="fa fa-home" style={{fontSize:"28px"}}></i></Link>
                        </li>
                        <li className='nav_item' id="id_noti">
                            <Link id="request" className="Link_a" to="/requests" ><i id='bell' className="fa fa-bell" style={{fontSize:"22px"}} ></i></Link>
                        </li>
                        <li className="nav_item" id="id_new_post">
                            <Link id="newpost" className="Link_a"  to="/new_post" ><i className="fa fa-plus-square-o fa-1g" style={{fontSize:"27px"}} aria-hidden="true"></i></Link>
                            </li>
                        <li className="nav_item" id="id_search">
                            <Link id="search" className="Link_a"  to="/search" ><i className="fa fa-search" style={{fontSize:"23px"}}></i></Link>
                            </li>
                        <li className="nav_item" id="id_profile">
                            <Link id="profile" className="Link_a" to="/profile" ><img id="my_pic" src={my_img} alt="img" style={{width:"45%", height:"fit-content", aspectRatio:1, border:"1px solid gainsboro", borderRadius:"50%"}}></img></Link>
                            {/* <button type="submit" onClick={logout}>Logout</button> */}
                        </li>
                    </ul>
        </div>
        </div>
    )
}

export default Navbar;