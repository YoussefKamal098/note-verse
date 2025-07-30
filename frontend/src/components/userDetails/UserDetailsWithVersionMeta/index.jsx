import React from "react";
import "react-loading-skeleton/dist/skeleton.css";
import Details from "./Details";
import Skeleton from "./Skeleton";

const UserDetailsWithVersionMeta = ({
                                        firstname,
                                        lastname,
                                        avatarUrl,
                                        createdAt,
                                        showYouBadge = false,
                                        showOwnerBadge = false,
                                        commitMessage,
                                        isLoading = false
                                    }) => {
    return (
        <>
            {isLoading ? <Skeleton/>
                : <Details
                    firstname={firstname}
                    lastname={lastname}
                    avatarUrl={avatarUrl}
                    createdAt={createdAt}
                    showYouBadge={showYouBadge}
                    showOwnerBadge={showOwnerBadge}
                    commitMessage={commitMessage}
                />}
        </>

    );
};

export default React.memo(UserDetailsWithVersionMeta);
