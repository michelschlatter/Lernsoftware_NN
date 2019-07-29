/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

var ServiceProvider = function () {
    this.unauthorizedService = "Unauthorized";
    this.addToLoginSuccessService = "AddLoginService";
    this.removeFromLoginSuccessService = "RemoveLoginService";
    this.addToLogoutSuccessService = "AddLogoutService";
    this.removeFromLogoutSuccessService = "RemoveLogoutService";

    this.services = [];

    /**
     * Registers a service
     * @param {function} service
     * @param {string} name
     */
    this.register = function(service, name) {
        if (this.services[name]) {
            throw new Error("Service already exists!");
        }
        this.services[name] = service;
    };

    /**
     * Gets a service
     * @param {string} serviceName
     * @returns service
     */
    this.get = function(serviceName) {
        return this.services[serviceName];
    };
};

var serviceLocator = new ServiceProvider();
