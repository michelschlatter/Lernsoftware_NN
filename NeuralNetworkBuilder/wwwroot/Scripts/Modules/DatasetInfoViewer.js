/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function DatasetInfoViewer() {
    var dialog = $('#datasetInfoDialog');

    /**
     * Gets a random number between
     * @param {float} min
     * @param {float} max
     * @returns {int} the random number
     */
    var getRandom =function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * visualizes a data item
     * @param {Dataset} dataset
     * @param {Int32Array} data
     */
    var createVectorGrid = function (dataset, data) {
        let grid = new VectorGrid();
        let container = $('<div class="col-md-3">');
        container.css('margin-top', '20px');
        grid.init(dataset.dataset.matrix[0], dataset.dataset.matrix[1], container, 100);
        grid.setClickable(false);
        grid.setVector(data);
        dialog.find('#gridRow').append(container);
    }

    /**
     * Shows the datasetdialog
     * @param {Dataset} dataset
     */
    this.show = function (dataset, hideViewBtn, showAllItems) {
        if (dataset) {
            dialog.find('#name').text(dataset.name);
            dialog.find('#numberOfDataItems').text(dataset.dataset.items.length);
            dialog.find('#btnView').off();

            if (!hideViewBtn) {
                dialog.find('#btnView').show();
            } else {
                dialog.find('#btnView').hide();
            }

            for (let prop in dataset.dataset) {
                dialog.find('#' + prop).text(dataset.dataset[prop]);
            }

            dialog.find('#btnView').click(function () {
                location.href = '/dataseteditor?datasetId=' + dataset.id;
            });

            if (dataset.dataset.matrix) {
                dialog.find('#gridRow').show();
                dialog.find('#gridRow').empty();

                if (showAllItems) {
                    for (let i = 0; i < dataset.dataset.items.length; i++) {
                        createVectorGrid(dataset, dataset.dataset.items[i].data);
                    }
                } else { // show two random examples
                    createVectorGrid(dataset, dataset.dataset.items[getRandom(0, (dataset.dataset.items.length - 1))].data);
                    createVectorGrid(dataset, dataset.dataset.items[getRandom(0, (dataset.dataset.items.length - 1))].data);
                }
                
            } else {
                dialog.find('#gridRow').hide();
            }

            dialog.modal('show');
        } else {
            new MessageDialog().show('No dataset selected', 'Please select a dataset.')
        }
    }

}
