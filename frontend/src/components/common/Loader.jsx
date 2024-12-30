import React from "react";
import LoadingEffect from "./LoadingEffect";

const Loader = () => {
    return (
        <div style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            top: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        }}>
            <LoadingEffect color={"var(--color-accent)"} loading={true} size={50} />
        </div>
    );
};

export default Loader;
