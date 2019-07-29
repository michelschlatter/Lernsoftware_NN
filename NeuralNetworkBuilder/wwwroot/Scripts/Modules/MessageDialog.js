/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function MessageDialog() {
    const id = 'messageDialog';
    const dialog = $('#' + id);

    /**
     * Cancels the dialog
     * @param {function} success
     */
    var cancel = function (success) {
        if (success) {
            success();
        }
        dialog.modal('hide');
        cleanUp();
    }

    /**
     * cleans the dialog up
     * */
    var cleanUp = function () {
        dialog.find('#textBody').text('');
        dialog.find('#modalTitle').text('');
        dialog.find('#btnCancel').off();
    }

    /**
     * Shows the error dialog
     * @param {string} bodytext
     * @param {function} success
     */
    this.showErrorDialog = function (body, success) {
        let title = $('<div class="alert alert-danger">');
        title.text('Error');

        dialog.find('#btnCancel').off();
        dialog.find('#modalTitle').html(title);
        dialog.find('#textBody').text(body);
        dialog.find('#btnCancel').click(function () {
            cancel(success);
            return false;
        });
        dialog.modal('show');
    }

    /**
     * Show the message dialog
     * @param {string} title
     * @param {string} bodyText
     * @param {function} success
     * @param {string} cssClass
     */
    this.show = function (title, body, success, cssClass) {
        dialog.find('#btnCancel').off();
        cssClass = cssClass || 'alert-info'
        let titleElm = $('<div class="alert ' + cssClass + '">');
        titleElm.text(title);
        dialog.find('#modalTitle').html(titleElm);
        dialog.find('#textBody').text(body);
        dialog.find('#btnCancel').click(function () {
            cancel(success);
            return false;
        });
        dialog.modal('show');
    }

    /**
     * Shows the dialog with html input
     * @param {string} title (!important ==> santize the untrustworthy elements before giving it to this method)
     * @param {string} bodyText (!important ==> santize the untrustworthy elements html before giving it to this method)
     * @param {function} success 
     */
    this.showHtml = function (title, body, success) {
        dialog.find('#btnCancel').off();
        dialog.find('#modalTitle').html(title);
        dialog.find('#textBody').html(body);
        dialog.find('#btnCancel').click(function () {
            cancel(success);
            return false;
        });
        dialog.modal('show');
    }

    /**
     * Hides the dialog
     */
    this.hide = function () {
        dialog.modal('hide');
    }

}