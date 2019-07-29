/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function Layout() {

    var loginSuccess = null;
    var logoutSuccess = null;

    /**
     * Handles a authentication change and updates the view
     * @param {bool} isAuthenticated
     */
    var handleAuthenticationChange = function (isAuthenticated) {
        if (isAuthenticated) {
            $(document).find('.authenticated').show();
            $(document).find('.unauthenticated').hide();
            if (loginSuccess && loginSuccess.length > 0) {
                for (let i = 0; i < loginSuccess.length; i++) {
                    if (loginSuccess[i]) {
                        loginSuccess[i]();
                    }
                }
            }
        } else {
            if (logoutSuccess && logoutSuccess.length > 0) {
                for (let i = 0; i < logoutSuccess.length; i++) {
                    if (logoutSuccess[i]) {
                        logoutSuccess[i]();
                    }
                }
            }

            $(document).find('.authenticated').hide();
            $(document).find('.unauthenticated').show();
        }
    }

    /**
     * gets the iptions for the loginmodal
     * @returns {object} options
     * */
    var getLoginModalOptions = function () {
        var options = {};
        options.loginSuccessFunction = function () { handleAuthenticationChange(true) };
        options.logoutSuccessFunction = function () { handleAuthenticationChange(false) };
        options.registerSuccessFunction = function () { };
        options.autoLoginAfterRegister = true;
        return options;
    }

    /**
     * shows the login modal
     * */
    var showLoginModal = function () {
        $('#loginModal').modal('show');
        $('#loginModal').find('#signUpErrorMsg').text('');
        $('#loginModal').find('#loginErrorMsg').text('');
    }


    /**
     * inits the layout
     * */
    this.init = function () {
        var lm = new LoginModal();
        lm.init($('#navLogout'));
        lm.addOptions(getLoginModalOptions());

        serviceLocator.register(showLoginModal, serviceLocator.unauthorizedService);
        serviceLocator.register(this.addLoginSuccessFunction, serviceLocator.addToLoginSuccessService);
        serviceLocator.register(this.removeLoginSuccessFunction, serviceLocator.removeFromLoginSuccessService);
        serviceLocator.register(this.addLogoutSuccessFunction, serviceLocator.addToLogoutSuccessService);
        serviceLocator.register(this.removeLogoutSuccessFunction, serviceLocator.removeFromLogoutSuccessService);

        if (getUrlParameter('showLogin')) {
            showLoginModal();
        }

        errorHandling.options.unauthorized = function () {
            showLoginModal();
        };

        $('#navLogin').click(function () {
            showLoginModal();
        });
    },
        /**
         * adds a function to the layout to call if the user logs in
         * @param {function} success
         */
        this.addLoginSuccessFunction = function (success) {
            if (!loginSuccess) {
                loginSuccess = [];
            }
            loginSuccess.push(success);
        },
        /**
        * removes a function from the layout to call if the user logs in
        * @param {function} success
        */
        this.removeLoginSuccessFunction = function (success) {
            if (loginSuccess) {
                for (let i = 0; i < loginSuccess.length; i++) {
                    if (loginSuccess[i] == success) {
                        loginSuccess.splice(i, 1);
                    }
                }
            }
        },
    /**
     * Adds a function to the layout to call if the user logs out
     * @param {function} success
     */
    this.addLogoutSuccessFunction = function (success) {
        if (!logoutSuccess) {
            logoutSuccess = [];
        }
        logoutSuccess.push(success);
    },
        /**
         * Removes a function from the layout to call if the users logs out
         * @param {function} success
         */
        this.removeLogoutSuccessFunction = function (success) {
            if (logoutSuccess) {
                for (let i = 0; i < logoutSuccess.length; i++) {
                    if (logoutSuccess[i] == success) {
                        logoutSuccess.splice(i, 1);
                    }
                }
            }
        }
}



