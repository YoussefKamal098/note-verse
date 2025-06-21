import React from 'react';
import PropTypes from 'prop-types';
import {IoCloseCircle} from 'react-icons/io5';
import SpinnerLoading from '../buttons/LoadingSpinnerButton';
import Avatar from '../common/Avatar';

import {
    AvatarWrapperStyles,
    CollaboratorBadgeStyles,
    CollaboratorInfoStyles,
    EmailStyles,
    NameStyles,
    RemoveButtonStyles
} from './styles';

const CollaboratorBadge = ({collaborator, highlighted, onRemove}) => {
    return (
        <>
            {collaborator && <CollaboratorBadgeStyles
                onClick={(e) => e.stopPropagation()}
                $highlighted={highlighted}
            >
                <SpinnerLoading loading={collaborator.pending} color="var(--color-accent)">
                    <AvatarWrapperStyles>
                        <Avatar avatarUrl={collaborator.avatarUrl}/>
                    </AvatarWrapperStyles>
                </SpinnerLoading>

                <CollaboratorInfoStyles>
                    {collaborator.pending ? (
                        <EmailStyles>{collaborator.email}</EmailStyles>
                    ) : (
                        <>
                            <NameStyles>{collaborator.firstname} {collaborator.lastname}</NameStyles>
                            <EmailStyles>{collaborator.email}</EmailStyles>
                        </>
                    )}
                </CollaboratorInfoStyles>

                {!collaborator.pending && (
                    <RemoveButtonStyles onClick={onRemove}>
                        <IoCloseCircle/>
                    </RemoveButtonStyles>
                )}
            </CollaboratorBadgeStyles>
            }
        </>
    )
};

CollaboratorBadge.propTypes = {
    collaborator: PropTypes.object.isRequired,
    highlighted: PropTypes.bool,
    onRemove: PropTypes.func.isRequired
};

export default React.memo(CollaboratorBadge);
