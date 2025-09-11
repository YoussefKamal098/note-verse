import {motion} from "framer-motion";

export const tabAnimation = {
    initial: {opacity: 0, x: 40},
    animate: {opacity: 1, x: 0},
    exit: {opacity: 0, x: -40},
    transition: {type: "spring", damping: 20, stiffness: 300}
};

export const AnimatedTab = ({children, key}) => (
    <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={tabAnimation}
    >
        {children}
    </motion.div>
);
