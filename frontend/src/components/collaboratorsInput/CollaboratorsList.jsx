import React from 'react';
import PropTypes from 'prop-types';
import {AnimatePresence} from 'framer-motion';
import {AnimatedListWidthChildrenFade} from '../animations/ContainerAnimation';
import CollaboratorBadge from './CollaboratorBadge';

const CollaboratorsList = ({
                               collaborators,
                               highlightedId,
                               onRemove
                           }) => {
    return (<AnimatePresence>
            <AnimatedListWidthChildrenFade>
                {collaborators.map(collaborator => (
                    <CollaboratorBadge
                        key={collaborator.id}
                        collaborator={collaborator}
                        highlighted={highlightedId === collaborator.id}
                        onRemove={() => onRemove(collaborator.id)}
                    />
                ))}
            </AnimatedListWidthChildrenFade>
        </AnimatePresence>
    );
}

CollaboratorsList.propTypes = {
    collaborators: PropTypes.array.isRequired,
    highlightedId: PropTypes.string,
    onRemove: PropTypes.func.isRequired
};

export default React.memo(CollaboratorsList);
