import React, {memo} from "react";
import Navbar from "@/components/navbar/Navbar";

const PageLayout = ({children, showSearch = false, onSearch}) => {
    return (
        <div className="page">
            <Navbar showSearch={showSearch} onSearch={onSearch}/>
            <div className="wrapper">{children}</div>
        </div>
    );
};

export default memo(PageLayout);
