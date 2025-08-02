import {parseString} from 'shared-utils/env.utils'

const AppConfig = Object.freeze({
    API_BASE_URL: parseString(process.env.API_BASE_URL, 'http://localhost:5000/api/v1'),
    SOCKET_URL: parseString(process.env.SOCKET_URL, 'ws://localhost:4000'),
    NOTES_PER_PAGE: 10,
});

export default AppConfig;
