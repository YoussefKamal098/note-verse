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
    mobileS: `(min-width: ${DEVICE_SIZES.mobileS}px)`,
    mobileM: `(min-width: ${DEVICE_SIZES.mobileM}px)`,
    mobileL: `(min-width: ${DEVICE_SIZES.mobileL}px)`,
    tablet: `(max-width: ${DEVICE_SIZES.tablet}px)`,
    laptop: `(min-width: ${DEVICE_SIZES.laptop}px)`,
    laptopL: `(min-width: ${DEVICE_SIZES.laptopL}px)`,
    desktop: `(min-width: ${DEVICE_SIZES.desktop}px)`,
    desktopL: `(min-width: ${DEVICE_SIZES.desktop}px)`
};
