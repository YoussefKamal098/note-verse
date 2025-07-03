import React, {useEffect} from "react";
import VersionProvider from "./context/versionProvider";
import Loader from "../common/Loader";
import {useVersionSelector} from "./hooks/useVersionContext";
import Version from "./Version";
import {useVersionContext} from "./hooks/useVersionContext";

const VersionWrapper = ({id}) => {
    const {actions} = useVersionContext();
    const {isLoading, initLoading} = useVersionSelector(state => state.status);

    useEffect(() => {
        if (id) {
            actions.fetchVersion(id);
        }
    }, [id]);

    return (
        <>
            {isLoading && <Loader/>}
            {initLoading ? <Loader/> : <Version/>}
        </>
    );
};

function Index({id}) {
    return (
        <VersionProvider>
            <VersionWrapper id={id}/>
        </VersionProvider>
    );
}

export default React.memo(Index);
