export const DEVICE_SIZES = {
    mobileS: 320,
    mobileM: 375,
    mobileL: 425,
    tablet: 768,
    laptop: 1024,
    laptopL: 1440,
    desktop: 2560
};

export const MEDIA_QUERIES = {
    mobileS: `(max-width: ${DEVICE_SIZES.mobileS}px)`,
    mobileM: `(max-width: ${DEVICE_SIZES.mobileM}px)`,
    mobileL: `(max-width: ${DEVICE_SIZES.mobileL}px)`,
    tablet: `(max-width: ${DEVICE_SIZES.tablet}px)`,
    laptop: `(max-width: ${DEVICE_SIZES.laptop}px)`,
    laptopL: `(max-width: ${DEVICE_SIZES.laptopL}px)`,
    desktop: `(max-width: ${DEVICE_SIZES.desktop}px)`,
    desktopL: `(max-width: ${DEVICE_SIZES.desktop}px)`
};
