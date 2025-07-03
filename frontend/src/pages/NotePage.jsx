import React from "react";
import {useParams} from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Note from "../components/note";

const NotePage = () => {
    const {id} = useParams();

    return (
        <div className="page">
            <Navbar showSearch={false}/>
            <div className="wrapper">
                <Note id={id}/>
            </div>
        </div>
    );
};

export default NotePage;
