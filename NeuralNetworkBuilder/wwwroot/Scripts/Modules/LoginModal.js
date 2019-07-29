/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

/// <reference path="../Services/UserService.js" />
/// <reference path="../Helpers/ErrorHandling.js" />

function LoginModal() {
    var page = null;
    var success = null;
    var registerSuccess = null;
    var userService = null;
    var logoutSucces = null;
    var autoLogin = false;

    /**
     * Signs the user in 
     * */
    var signIn = function () {
        let email = page.find('#loginEmail').val();
        let password = page.find('#loginPassword').val();
        userService.login(email, password, function (user) {
            page.modal('toggle');
            if (success) {
                success(user);
            }
        }, function (error) {
            page.find('#loginErrorMsg').text(errorHandling.getErrorText(error));
        });
        return false;
    };

    /**
     * Logs the user out
     * */
    var logout = function () {
        userService.logout(function () {
            if (logoutSucces) {
                logoutSucces();
            }
        }, function () {
            page.find('#loginErrorMsg').text(errorHandling.getErrorText(error));
        });
        return false;
    }

    /**
     *Resets the password 
     * */
    var resetPassword = function () {
        let email = page.find('#resetEmail').val();
        userService.resetPassword(email, function () {
            page.modal('toggle');
            new MessageDialog().show('Success', 'Password successfully reseted.');
        }, errorHandling.handleError);
        return false;
    }

    /**
     * Signs a user up
     * */
    var signUp = function () {
        let email = page.find('#signUpEmail').val();
        let password = page.find('#signUpPassword').val();
        let password2 = page.find('#signUpPassword2').val();
        userService.register(email, password, password2, function (user) {
            if (autoLogin) {
                userService.login(email, password, function () {
                    page.modal('toggle');
                    if (success) {
                        success(user);
                    }
                }, function (error) {
                    page.find('#signUpErrorMsg').text(errorHandling.getErrorText(error));
                });
            } else {
                page.modal('toggle');
                if (registerSuccess) {
                    registerSuccess(user);
                }
            }
        }, function (error) {
            page.find('#signUpErrorMsg').text(errorHandling.getErrorText(error));
        });
        return false;
    };


    /**
     * Inits the login dialog
     * @param {DomObject} logoutElm
     */
    this.init = function (logoutElm) {
        page = $(document).find('#loginModal');
        userService = new UserService();

        logoutElm.click(logout);
        page.find('#btnSignIn').click(signIn);
        page.find('#btnSignUp').click(signUp);
        page.find('#btnResetPassword').click(resetPassword);
    }

    /**
     * adds options like the loginsuccess function, logoutfunction
     * @param {object} options
     */
    this.addOptions = function (options) {
        success = options.loginSuccessFunction;
        logoutSucces = options.logoutSuccessFunction;
        registerSuccess = options.registerSuccessFunction;
        autoLogin = options.autoLoginAfterRegister;
    }

}

