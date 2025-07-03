export const highlightWordDiffs = (oldStr = '', newStr = '') => {
    // Split while preserving whitespace
    const splitRegex = /(\s+|\S+)/g;
    const wordsOld = oldStr.match(splitRegex) || [];
    const wordsNew = newStr.match(splitRegex) || [];

    const resultOld = [];
    const resultNew = [];
    let i = 0, j = 0;

    while (i < wordsOld.length || j < wordsNew.length) {
        const wordOld = wordsOld[i];
        const wordNew = wordsNew[j];

        if (wordOld && wordNew && wordOld === wordNew) {
            resultOld.push(wordOld);
            resultNew.push(wordNew);
            i++;
            j++;
        } else {
            if (wordOld) {
                resultOld.push({
                    text: wordOld,
                    type: 'delete'
                });
                i++;
            }
            if (wordNew) {
                resultNew.push({
                    text: wordNew,
                    type: 'insert'
                });
                j++;
            }
        }
    }

    return {
        old: resultOld.length ? resultOld : null,
        new: resultNew.length ? resultNew : null
    };
};
