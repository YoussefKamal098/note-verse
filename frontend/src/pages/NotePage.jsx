import React from "react";
import {useParams} from "react-router-dom";
import PageLayout from "@/layouts/PageLayout";
import Note from "@/components/note";
import useNetworkStatusNotifier from "@/hooks/useNetworkStatusNotifier";

const NotePage = () => {
    const {id} = useParams();
    useNetworkStatusNotifier();

    return (
        <PageLayout showSearch={false}>
            <div style={{display: "flex", justifyContent: "center"}}>
                <Note id={id} key={id}/>
            </div>
        </PageLayout>
    );
};

export default NotePage;
