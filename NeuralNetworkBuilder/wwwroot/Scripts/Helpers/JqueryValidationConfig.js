/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

/*
 * Overrides the default checkform method from jquery validator
 * */
$(document).ready(function () {
    $.validator.setDefaults({
        errorElement: 'span',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        }
    });

    $.validator.prototype.checkForm = function () {
        //overriden in a specific page
        this.prepareForm();
        for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
            if (this.findByName(elements[i].name).length !== undefined && this.findByName(elements[i].name).length > 1) {
                for (var cnt = 0; cnt < this.findByName(elements[i].name).length; cnt++) {
                    let elm = this.findByName(elements[i].name)[cnt];
                    if ($(elm).is(':visible') && !$(elm).attr('disabled')) {
                        this.check(elm);
                    }
                }
            } else {
                this.check(elements[i]);
            }
        }
        return this.valid();
    };
});