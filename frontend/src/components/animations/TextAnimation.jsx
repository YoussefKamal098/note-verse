import React from 'react';
import { motion } from 'framer-motion';

const FadeInAnimatedText = ({ text }) => {
    const animatedMessage = text.split("").map((char, index) => (
        <motion.pre
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            style={{ display: 'inline-block' }}
        >
            {char}
        </motion.pre>
    ));

    return <div >{animatedMessage}</div>;
};

export { FadeInAnimatedText };
