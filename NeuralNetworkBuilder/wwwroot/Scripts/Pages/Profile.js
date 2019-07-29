/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function Profile() {
    var page;
    var userService;
    
    /**
     * sets the userinfo to the view
     * @param {User} user
     */
    var setUser = function (user) {
        page.find('#email').val(user.email);
    }

    /**
     * Updates the email
     * */
    var saveEmail = function () {
        let email = page.find('#email').val();
        userService.updateEmail(email, function (user) {
            setUser(user);
            new MessageDialog().show('Success', 'Successfully updated your email adress.')
        }, errorHandling.handleError);
        return false;
    }

    /**
     * Updates the password
     * */
    var changePassword = function () {
        let oldPw = page.find('#oldPassword').val();
        let newPw = page.find('#newPassword').val();
        let cPw = page.find('#confirmPassword').val();

        userService.updatePassword(oldPw, newPw, cPw, function () {
            new MessageDialog().show('Success', 'Successfully changed your password.')
            let oldPw = page.find('#oldPassword').val('');
            let newPw = page.find('#newPassword').val('');
            let cPw = page.find('#confirmPassword').val('');
        }, errorHandling.handleError);
        return false;
    }

    /**
     * redirects the user to the homepage if he is unauthorized
     * */
    var unauthorized = function () {
        location.href = '/';
    }

    /**
     * Inits the playground page
     * */
    this.init = function () {
        page = $('#profile');
        userService = new UserService();
        page.find('#btnSaveEmail').click(saveEmail);
        page.find('#btnSavePassword').click(changePassword);

        serviceLocator.get(serviceLocator.addToLogoutSuccessService)(unauthorized);

        userService.get(function (user) {
            if (!user) {
                unauthorized();
            } else {
                setUser(user);
            }
        }, errorHandling.handleError);
    }
}