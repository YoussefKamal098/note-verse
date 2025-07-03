import React, {useMemo} from "react";
import {FaFileCode, FaLink} from "react-icons/fa6";
import {TiArrowLoop} from "react-icons/ti";
import {IconButton} from '@mui/material';
import {MoreVert} from '@mui/icons-material';
import Menu from "..";

const VersionMenu = ({
                         onRestore,
                         onCopyLink,
                         onGetFullVersion,
                     }) => {
    const versionOptions = useMemo(() => ([
        {
            text: "Copy Link",
            icon: <FaLink/>,
            action: onCopyLink,
            disabled: !onCopyLink
        },
        {
            text: "Restore version",
            icon: <TiArrowLoop/>,
            action: onRestore,
            disabled: !onRestore,
        },
        {
            text: "Get full version",
            icon: <FaFileCode/>,
            action: onGetFullVersion,
            disabled: !onGetFullVersion
        },


    ].filter(option => !option.disabled)), [
        onRestore,
        onCopyLink,
        onGetFullVersion,
    ]);

    return (
        <Menu options={versionOptions}
              triggerIcon={
                  <IconButton aria-label="settings" sx={{color: 'var(--color-text)'}}>
                      <MoreVert/>
                  </IconButton>
              }
        />
    );
};

export default React.memo(VersionMenu);
