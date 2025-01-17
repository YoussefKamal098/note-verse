class TokenStorageService {
    #accessToken = null;

    setAccessToken(token = "") {
        this.#accessToken = token;
    }

    getAccessToken() {
        return this.#accessToken;
    }

    clearAccessToken() {
        this.#accessToken = null;
    }
}

const tokenStorageService = new TokenStorageService();
export default tokenStorageService;
