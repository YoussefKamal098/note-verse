import React from "react";
import {AnimatePresence, motion} from "framer-motion";

const FadeInAnimation = ({children, keyProp}) => {
    return (
        <AnimatePresence>
            {children && <motion.div
                key={keyProp}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
                transition={{duration: 0.3}}
            >
                {children}
            </motion.div>}
        </AnimatePresence>
    );
};

const HeightTransitionContainer = ({children, keyProp}) => {
    return (
        <AnimatePresence>
            {children && (
                <motion.div
                    key={keyProp}
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: "auto"}}
                    exit={{opacity: 0, height: 0}}
                    // transition={{
                    //     height: { type: "spring", stiffness: 100, damping: 25 },
                    //     opacity: {duration: 0.3}
                    // }}
                    // style={{overflow: "hidden"}}
                    layout
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const WidthTransitionContainer = ({children, keyProp}) => {
    return (
        <AnimatePresence>
            {children && (
                <motion.div
                    key={keyProp}
                    initial={{opacity: 0, width: 0}}
                    animate={{opacity: 1, width: "auto"}}
                    exit={{opacity: 0, width: 0}}
                    transition={{
                        // width: { type: "spring", stiffness: 100, damping: 25 },
                        opacity: {duration: 0.5}
                    }}
                    style={{overflow: "hidden"}}
                    layout
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const TranslateTransitionContainer = ({children, keyProp}) => {
    return (
        <AnimatePresence>
            {children && (
                <motion.div
                    key={keyProp}
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: 20}}
                    // transition={{
                    //     opacity: {duration: 0.5},
                    //     width: {duration: 0}
                    // }}
                    // style={{overflow: "hidden"}}
                    layout
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const AnimatedListWidthChildrenFade = ({children}) => {
    return (
        <AnimatePresence>
            {children.map((child) => (
                <motion.div
                    key={child.key}
                    initial={{width: 0, opacity: 0, x: -20}}
                    animate={{width: "auto", opacity: 1, x: 0}}
                    exit={{width: 0, opacity: 0, x: 20}}
                    transition={{
                        width: {duration: 0.1},
                        opacity: {duration: 0.3}
                    }}
                    layout
                >
                    {child}
                </motion.div>
            ))}
        </AnimatePresence>
    );
}

const AnimatedCardsTranslateChildrenFade = ({children}) => {
    return (
        <AnimatePresence>
            {children.map((child, index) => (
                <motion.div
                    key={child.key}
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -20}}
                    transition={{delay: index * 0.05, duration: 0.3}}
                    layout
                >
                    {child}
                </motion.div>
            ))}
        </AnimatePresence>
    );
}


export {
    HeightTransitionContainer,
    WidthTransitionContainer,
    TranslateTransitionContainer,
    AnimatedListWidthChildrenFade,
    AnimatedCardsTranslateChildrenFade,
    FadeInAnimation
};
