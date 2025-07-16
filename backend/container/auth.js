const {asFunction} = require('awilix');
const JwtProviderService = require("../services/jwtProvider.service");

module.exports = container => {
    container.register({
        jwtAuthService: asFunction(({userService, sessionService}) =>
            new (require('../services/jwtAuth.service'))(
                userService,
                sessionService,
                new JwtProviderService(),
                require('../config/authConfig')
            )
        ).singleton(),

        googleAuthService: asFunction(({userService, sessionService, jwtAuthService}) =>
            new (require('../services/googleAuth.service'))(
                userService,
                sessionService,
                jwtAuthService,
                require('../config/googleAuthConfig')
            )
        ).singleton(),
    });
};
