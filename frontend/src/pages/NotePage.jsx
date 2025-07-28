import React from "react";
import {useParams} from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Note from "../components/note";
import useNetworkStatusNotifier from "@/hooks/useNetworkStatusNotifier";

const NotePage = () => {
    const {id} = useParams();
    useNetworkStatusNotifier();

    return (
        <div className="page">
            <Navbar showSearch={false}/>
            <div className="wrapper" style={{display: "flex", justifyContent: "center"}}>
                <Note id={id} key={id}/>
            </div>
        </div>
    );
};

export default NotePage;
