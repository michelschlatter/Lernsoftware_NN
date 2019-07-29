/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

var errorHandling = {};
errorHandling.options = {};

/**
 * gets the errortext from the thrown error
 * @param {Error} error
 */
errorHandling.getErrorText = function (error) {
    return error.responseJSON.msg;
}

/**
 * Shows the errordialog or logs it to the console if no message is presented
 * @param {Error} error
 */
errorHandling.handleError = function (error) {
    if (error.status == 401) { // unauthorized
        var unauthorizedService = serviceLocator.get(serviceLocator.unauthorizedService);
        if (unauthorizedService) {
            unauthorizedService();
        } else {
            throw new Error('No UnauthorizedService found to call!');
        }
    } else {
        if (error.responseJSON) {
            new MessageDialog().showErrorDialog(error.responseJSON.msg); 
        } else {
            console.log(error);
        }
    }
}