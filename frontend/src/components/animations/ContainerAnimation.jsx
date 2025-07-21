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

const HeightTransitionContainer = ({children, keyProp, overflowHidden}) => {
    return (
        <AnimatePresence>
            {children && (
                <motion.div
                    key={keyProp}
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: "auto"}}
                    exit={{opacity: 0, height: 0}}
                    style={overflowHidden ? {overflow: "hidden"} : {}}
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
                    layout
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const BaseAnimatedList = ({
                              children,
                              delay = true,
                              delayAfter = 0,
                              initial = {opacity: 0, x: -20},
                              animate = {opacity: 1, x: 0},
                              exit = {opacity: 0, x: 20},
                              transition = {duration: 0.3},
                              staggerDelay = 0.05,
                              layout = true,
                              ...props
                          }) => {
    return (
        <AnimatePresence>
            {children.map((child, index) => (
                <motion.div
                    key={child.key}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                        ...transition,
                        delay: delay && index >= delayAfter
                            ? (index - delayAfter) * staggerDelay
                            : 0,
                    }}
                    layout={layout}
                    {...props}
                >
                    {child}
                </motion.div>
            ))}
        </AnimatePresence>
    );
};

const AnimatedListWidthChildrenFade = ({children, delay, delayAfter}) => {
    return (
        <BaseAnimatedList
            children={children}
            delay={delay}
            delayAfter={delayAfter}
            initial={{width: 0, opacity: 0, x: -20}}
            animate={{width: "auto", opacity: 1, x: 0}}
            exit={{width: 0, opacity: 0, x: 20}}
        />
    );
};

const AnimatedCardsTranslateChildrenFade = ({children, delay, delayAfter}) => {
    return (
        <BaseAnimatedList
            children={children}
            delay={delay}
            delayAfter={delayAfter}
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
        />
    );
};

const AnimatedTabSwitch = ({children, isActive}) => (
    <AnimatePresence mode="wait">
        <motion.div
            key={children.key}
            initial={{
                opacity: 0,
                x: isActive ? 50 : -50,
                scale: 0.95,
                rotate: isActive ? 2 : -2
            }}
            animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                rotate: 0,
                transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    velocity: 2
                }
            }}
            exit={{
                opacity: 0,
                x: isActive ? -50 : 50,
                scale: 0.95,
                rotate: isActive ? -2 : 2,
                transition: {
                    duration: 0.15,
                    ease: "easeIn"
                }
            }}
            style={{
                height: '100%',
                width: '100%',
                originX: 0.5,
                originY: 0.5
            }}
        >
            {children}
        </motion.div>
    </AnimatePresence>
);


export {
    HeightTransitionContainer,
    WidthTransitionContainer,
    TranslateTransitionContainer,
    AnimatedListWidthChildrenFade,
    AnimatedCardsTranslateChildrenFade,
    FadeInAnimation,
    AnimatedTabSwitch
};
