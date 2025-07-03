import React from 'react';
import {useParams} from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";
import Version from "@/components/version";

const VersionPage = () => {
    const {id} = useParams();

    return (
        <div className="page">
            <Navbar/>
            <div className="wrapper">
                <Version id={id}/>
            </div>
        </div>
    );
};

export default VersionPage;
