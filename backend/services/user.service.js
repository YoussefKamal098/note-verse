const PasswordHasherService = require('../services/passwordHasher.service');
const userValidationService  = require('../validations/user.validation');
const userRepository = require("../repositories/user.repository");
const  { deepFreeze } = require('../utils/obj.utils');

class UserService {
    #userValidationService;
    #userRepository;
    passwordHasherService;

    constructor(userValidationService, passwordHasherService, userRepository) {
        this.#userValidationService = userValidationService;
        this.passwordHasherService = passwordHasherService;
        this.#userRepository = userRepository;
    }

    async create({ firstname="", lastname="", email="", password="" }) {
        this.#userValidationService.validateEmail('email', email);
        this.#userValidationService.validatePassword('password', password);
        this.#userValidationService.validateName('firstname', firstname);
        this.#userValidationService.validateName('lastname', lastname);

        const hashedPassword = await this.passwordHasherService.hash(password);
        const userData = {
            firstname,
            lastname,
            email,
            password: hashedPassword,
        };

        let savedUser;

        try {
            savedUser = this.#userRepository.create(userData);
        } catch (error) {
            console.error('Error creating user', error);
            throw new Error("Error creating user");
        }

        return deepFreeze(savedUser);
    }

    async findById(userId="") {
        let user;

        try {
            user = await this.#userRepository.findById(userId);
            if (!user) return null;
        } catch (error) {
            console.error('Error finding user by id', error);
            throw new Error("Error finding user by id");
        }

        return deepFreeze(user);
    }

    async findByEmail(email="") {
        let user;

        try {
            user = await this.#userRepository.findOne({ email });
            if (!user) return null;
        } catch (error) {
            console.error('Error finding user by email', error);
            throw new Error("Error finding user by email");
        }

        return deepFreeze(user);
    }

    async findByRefreshToken(refreshToken="") {
        let user;

        try {
            user = await this.#userRepository.findOne({ refreshToken });
            if (!user) return null;
        } catch (error) {
            console.error('Error finding user by refreshToken', error);
            throw new Error("Error finding user by refreshToken");
        }

        return deepFreeze(user);
    }

    async updatePassword(userId="", newPassword="") {
        this.#userValidationService.validatePassword('password', newPassword);
        let updatedUser;

        try {
            const hashedPassword = await this.passwordHasherService.hash(newPassword);
             updatedUser = await this.#userRepository.findByIdAndUpdate(userId, { password: hashedPassword });
            if (!updatedUser) return null;
        } catch(error) {
            console.error("Error updating user's password", error);
            throw new Error("Error updating user's password");
        }

        return deepFreeze(updatedUser);
    }

    async updateEmail(userId="", newEmail="") {
        this.#userValidationService.validateEmail('email', newEmail);
        let updatedUser;

        try {
            updatedUser = await this.#userRepository.findByIdAndUpdate(userId, { email: newEmail });
            if (!updatedUser) return null;
        }catch(error) {
            console.error("Error updating user's email", error);
            throw new Error("Error updating user's email");
        }

        return deepFreeze(updatedUser);
    }

    async updateFullname(userId="", { firstname="", lastname="" }) {
        this.#userValidationService.validateName('firstname', firstname);
        this.#userValidationService.validateName('lastname', lastname);
        let updatedUser;

        try {
            updatedUser = await this.#userRepository.findByIdAndUpdate(userId, { firstname, lastname });
            if (!updatedUser) return null;
        } catch (error){
            console.error("Error updating user's fullname", error);
            throw new Error("Error updating user's fullname");
        }

        return deepFreeze(updatedUser);
    }

    async updateRefreshToken(userId="", newRefreshToken=null) {
        let updatedUser;

        try {
            updatedUser = await this.#userRepository.findByIdAndUpdate(userId, { refreshToken: newRefreshToken });
            if (!updatedUser) return null;
        } catch (error) {
            console.error("Error updating user's refreshToken", error);
            throw new Error("Error updating user's refreshToken");
        }

        return deepFreeze(updatedUser);
    }
}

module.exports = new UserService(new userValidationService(), new PasswordHasherService(), userRepository);
