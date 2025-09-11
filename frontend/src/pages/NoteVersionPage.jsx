import React from "react";
import {useParams} from "react-router-dom";
import PageLayout from "@/layouts/PageLayout";
import Version from "@/components/version";

const VersionPage = () => {
    const {id} = useParams();

    return (
        <PageLayout>
            <Version id={id} key={id}/>
        </PageLayout>
    );
};

export default VersionPage;
