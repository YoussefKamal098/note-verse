import React from 'react';
import styled from 'styled-components';
import BackHomeButton from "@/components/buttons/BackHomeButton";
import UserDetailsWithVersionMeta from "@/components/userDetails/UserDetailsWithVersionMeta";
import VersionMenu from "@/components/menus/versionMenu"

const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    background-color: var(--color-background);
    border-radius: 10px;
    margin-bottom: 20px;
`;

const HeaderRightPart = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25em;
`;

const HeaderComponent = ({user, version, actions}) => {
    return (
        <HeaderContainer>
            <HeaderRightPart>
                <BackHomeButton/>
                <UserDetailsWithVersionMeta
                    firstname={user.firstname}
                    lastname={user.lastname}
                    createdAt={version.createdAt}
                    avatarUrl={user.avatarUrl}
                />
            </HeaderRightPart>
            <VersionMenu
                onRestore={actions.onRestore ? actions.onRestore : undefined}
                onGetFullVersion={actions.onGetFullVersion ? actions.onGetFullVersion : null}
                onCopyLink={actions.onCopyLink ? actions.onCopyLink : null}
                onGoToNote={actions.onGoToNote}
            />
        </HeaderContainer>
    );
};

export default React.memo(HeaderComponent);
