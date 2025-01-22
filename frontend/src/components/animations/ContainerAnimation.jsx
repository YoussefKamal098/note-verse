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
                    initial={{height: 0, opacity: 0}}
                    animate={{height: "auto", opacity: 1}}
                    exit={{height: 0, opacity: 0}}
                    transition={{
                        // height: { type: "spring", stiffness: 100, damping: 25 },
                        opacity: {duration: 0.3}
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

const WidthTransitionContainer = ({children, keyProp}) => {
    return (
        <AnimatePresence>
            {children && (
                <motion.div
                    key={keyProp}
                    initial={{width: 0, opacity: 0}}
                    animate={{width: "auto", opacity: 1}}
                    exit={{width: 0, opacity: 0}}
                    transition={{
                        // width: { type: "spring", stiffness: 100, damping: 25 },
                        opacity: {duration: 0.3}
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


const AnimatedListHeightChildrenFade = ({children}) => {
    return (
        <AnimatePresence>
            {children.map((child) => (
                <motion.div
                    key={child.key}
                    initial={{height: 0, opacity: 0, x: -20}}
                    animate={{height: "auto", opacity: 1, x: 0}}
                    exit={{height: 0, opacity: 0, x: 20}}
                    transition={{
                        height: {duration: 0.1},
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

const AnimatedListTranslateChildrenFade = ({children}) => {
    return (
        <AnimatePresence>
            {children.map((child, index) => (
                <motion.div
                    key={child.key}
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: 20}}
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
    AnimatedListHeightChildrenFade,
    AnimatedListTranslateChildrenFade,
    FadeInAnimation
};
