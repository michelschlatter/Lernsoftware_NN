/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function YesNoDialog() {
    const id = 'yesNoDialog';
    const dialog = $('#' + id);

    /**
     * Cancels the dialog
     * @param {function} success
     */
    var cancelMethod = function (success) {
        if (success) {
            success();
        }
        dialog.modal('hide');
        cleanUp();
    }

    /**
     * Gets executed when the user clicks yes
     * @param {function} success
     */
    var yesMethod = function (success) {
        if (success) {
            success();
        }
        dialog.modal('hide');
        cleanUp();
    }

    /**
     * Cleans up the dialog
     * */
    var cleanUp = function () {
        dialog.find('#textBody').text('');
        dialog.find('#modalTitle').text('');
        dialog.find('#btnCancel').off();
        dialog.find('#btnYes').off();
    }

    /**
     * Shows the yesnodialog
     * @param {string} title
     * @param {string} body
     * @param {function} success
     * @param {function} cancel
     */
    this.show = function (title, body, success, cancel) {
        dialog.find('#btnCancel').off();
        dialog.find('#btnYes').off();
        dialog.find('#modalTitle').text(title);
        dialog.find('#textBody').text(body);
        dialog.find('#btnCancel').click(function () {
            cancelMethod(cancel);
        });
        dialog.find('#btnYes').click(function () {
            yesMethod(success);
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