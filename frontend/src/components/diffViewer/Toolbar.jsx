import React from 'react';
import ToggleGroup from '../toggleGroup';
// import Counter from '../counter';
// import Toggle from '../toggle';
import {AiOutlineDeploymentUnit} from "react-icons/ai";
import {PiSplitHorizontalFill} from "react-icons/pi";


const Toolbar = ({state, updateState}) => {
    return (
        <div className="diff-viewer-toolbar">
            <div className="diff-viewer-toolbar-left">
                <ToggleGroup
                    options={[
                        {name: 'Unified View', value: 'unified', icon: < AiOutlineDeploymentUnit/>},
                        {name: 'Split View', value: 'split', icon: <PiSplitHorizontalFill/>}
                    ]}
                    value={state.viewType}
                    onChange={(newViewType) => updateState({viewType: newViewType})}
                    ariaLabel="Diff view type selection"
                />
            </div>
            <div className="diff-viewer-toolbar-right">
                {/*<Counter*/}
                {/*    initialValue={state.viewSize}*/}
                {/*    min={10}*/}
                {/*    max={24}*/}
                {/*    label="Font size"*/}
                {/*    onChange={(size) => updateState({viewSize: size})}*/}
                {/*/>*/}

                {/*<Toggle*/}
                {/*    checked={state.showWordDiff}*/}
                {/*    label={"Word Diff"}*/}
                {/*    onChange={() => updateState({showWordDiff: !state.showWordDiff})}*/}
                {/*/>*/}

                {/*<Toggle*/}
                {/*    checked={state.compactLineHeight}*/}
                {/*    label={"Compact line height"}*/}
                {/*    onChange={() => updateState({compactLineHeight: !state.compactLineHeight})}*/}
                {/*/>*/}
            </div>
        </div>
    );
};

export default React.memo(Toolbar);
