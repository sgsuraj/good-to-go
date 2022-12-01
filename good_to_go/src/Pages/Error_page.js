import React from 'react';
import '../CSS/Error_page.css'

function Error_page() {
    const go_to = localStorage.getItem('user') === null ? "Login" : "Home";
    const page_url = go_to === "Login" ? '/' : '/home';
    const page_icon = go_to === "Login" ? 'fa fa-sign-in' : 'fa fa-home';
  return (
    <div>
        <div className="hhh">
            <p>Path doesn't exist.</p>
            <p>Please return to <a href={page_url}>{go_to}<i className={page_icon}></i></a> Page.</p>
        </div>
    </div>
  )
}

export default Error_page;