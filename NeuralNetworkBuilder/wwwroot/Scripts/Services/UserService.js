/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function UserService() {

    /**
     * Gets a specific user
     * @param {function} success
     * @param {function} error
     */
    this.get = function (success, error) {
        $.ajax({
            type: "GET",
            url: '/api/Account/',
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Resets the password from a user
     * @param {string} email
     * @param {function} success
     * @param {function} error
     */
    this.resetPassword = function (email, success, error) {
        $.ajax({
            type: "PUT",
            url: '/api/Account/ResetPassword',
            data: JSON.stringify(email),
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Updates the email from a user
     * @param {string} email
     * @param {function} success
     * @param {function} error
     */
    this.updateEmail = function (email, success, error) {
        $.ajax({
            type: "PUT",
            url: '/api/Account/UpdateEmail',
            data: JSON.stringify(email),
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Updates the password from a user
     * @param {string} passwordOld
     * @param {string} password1
     * @param {string} password2
     * @param {function} success
     * @param {function} error
     */
    this.updatePassword = function (passwordOld, password1, password2, success, error) {
        $.ajax({
            type: "PUT",
            url: '/api/Account/UpdatePassword',
            data: JSON.stringify({ oldPassword: passwordOld, password: password1, password2: password2}),
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Logs a user in
     * @param {string} email
     * @param {string} password
     * @param {function} success
     * @param {function} error
     */
    this.login = function (email, password, success, error) {
        $.ajax({
            type: "POST",
            url: '/api/Account/Login',
            data: JSON.stringify({ email: email, password: password }),
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Registers a user
     * @param {string} email
     * @param {string} password
     * @param {string} password2
     * @param {function} success
     * @param {function} error
     */
    this.register = function (email, password, password2, success, error) {
        $.ajax({
            type: "POST",
            url: '/api/Account/Register',
            data: JSON.stringify({ email: email, password: password, password2: password2 }),
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Logs a user out
     * @param {function} success
     * @param {function} error
     */
    this.logout = function (success, error) {
        $.ajax({
            type: "POST",
            url: '/api/Account/Logout',
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

}


