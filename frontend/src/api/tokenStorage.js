class TokenStorage {
    #accessToken = null;

    setAccessToken(token="") {
        this.#accessToken = token;
    }

    getAccessToken() {
        return this.#accessToken;
    }

    clearAccessToken() {
        this.#accessToken = null;
    }
}

export default new TokenStorage();
