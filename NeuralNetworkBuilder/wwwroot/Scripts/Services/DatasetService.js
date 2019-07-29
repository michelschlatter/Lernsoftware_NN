/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function DatasetService() {

    /**
     * gets all visible dataset for the user
     * @param {function} success
    * @param {
    function} error
     */
    this.query = function (success, error) {
        $.ajax({
            type: "GET",
            url: '/api/Datasets/',
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * gets a specific dataset
     * @param {int} id
     * @param {function} success
     * @param {function} error
     */
    this.get = function (id, success, error) {
        $.ajax({
            type: "GET",
            url: '/api/Datasets/'+ id,
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Deletes a specific dataset
     * @param {int} id
     * @param {function} success
     * @param {function} error
     */
    this.delete = function (id, success, error) {
        $.ajax({
            type: "DELETE",
            url: '/api/Datasets/' + id,
            success: success,
            error: error,
            contentType: "application/json"
        });
    }

    /**
     * Saves a dataset
     * @param {dataset} dataset
     * @param {function} success
     * @param {function} error
     */
    this.save = function (dataset, success, error) {
        $.ajax({
            type: "POST",
            url: '/api/Datasets/',
            data: JSON.stringify(dataset),
            success: success,
            error: error,
            contentType: "application/json"
        });
    }


}


