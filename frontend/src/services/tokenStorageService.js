import {jwtDecode} from "jwt-decode";

class TokenStorageService {
    #accessToken = null;
    #decodedPayload = null;
    #lastToken = null;

    setAccessToken(token = "") {
        this.#accessToken = token;
        this.#invalidateDecodedPayload();
    }

    getAccessToken() {
        return this.#accessToken;
    }

    clearAccessToken() {
        this.#accessToken = null;
        this.#invalidateDecodedPayload();
    }

    getPayload() {
        const token = this.#accessToken;
        if (!token) return null;

        if (token !== this.#lastToken) {
            try {
                this.#decodedPayload = jwtDecode(token);
                this.#lastToken = token;
            } catch (e) {
                console.error("Failed to decode token:", e);
                this.#decodedPayload = null;
                this.#lastToken = null;
            }
        }

        return this.#decodedPayload;
    }

    isTokenExpiringSoon(bufferSeconds = 60) {
        const token = this.#accessToken;
        if (!token) return true;

        try {
            const payload = this.getPayload();
            const now = Math.floor(Date.now() / 1000);
            return payload?.exp && payload.exp - now < bufferSeconds;
        } catch {
            return true;
        }
    }

    #invalidateDecodedPayload() {
        this.#decodedPayload = null;
        this.#lastToken = null;
    }
}

const tokenStorageService = new TokenStorageService();
export default tokenStorageService;
