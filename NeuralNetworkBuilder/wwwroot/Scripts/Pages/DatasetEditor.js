/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function DatasetEditor() {
    var page;
    var jsonEditor1;
    var jsonEditor2;
    var dataService;
    var userService;
    var grid;
    var gridMatrix;

    var datasetList;
    var selectedDataset;
    var currentUser;
    var urlDatasetId;

    /**
     * Enum to set the privacy of a dataset
     * Must be changed, when values are changed 
     * on server and vice versa
     * */
    var privacy = {
        Private: 1,
        Public : 2
    }

    /**
     * Saves the dataset
     * */
    var save = function () {
        try {
            if (page.valid()) {
                jsonEditor2.updateText(jsonEditor1.getText());
                dataService.save(getDataset(), function (savedDataset) {
                    getAllDatasets(function () {
                        page.find('#datasets').val(savedDataset.id);
                        datasetChanged();
                        new MessageDialog().show('Success', 'Successfully saved the dataset!')
                    });
                }, errorHandling.handleError)
            }
        } catch (e) {
            new MessageDialog().showErrorDialog('Invalid Json, can not save: ' + e.message);
        }
        return false;
    }

    /**
     * Deletes the dataset
     * */
    var deleteDataset = function () {
        new YesNoDialog().show('Delete', 'Do you want to delete this dataset?', function () {
            dataService.delete(selectedDataset.id, function () {
                new MessageDialog().show('Success', 'Successfully deleted the dataset');
                selectedDataset = null;
                getAllDatasets();
            }, errorHandling.handleError);
        }, null);
        return false;
    }

    /**
    * gets all datasets
    * @param {function} success
    * @param {bool} withoutChangeCurrentDs
    */
    var getAllDatasets = function (success, withoutChangeCurrentDs) {
        dataService.query(function (datasets) {
            datasetList = datasets;
            userService.get(function (user) {
                currentUser = user;
                setDatasets(withoutChangeCurrentDs);
                if (success) {
                    success();
                }
            }, errorHandling.handleError);

        }, errorHandling.handleError)
    }

    /**
     * Gets called when the dataset gets changed
     * Updated the Treeviewer and the vectorgrid
     * */
    var datasetChanged = function () {
        let id = page.find('#datasets').val();
        selectedDataset = null;
        for (let i = 0; i < datasetList.length; i++) {
            if (datasetList[i].id == id) {
                selectedDataset = datasetList[i];
                break;
            }
        }

        if (!selectedDataset) { // if not found, reset to 'create new Dataset'
            selectedDataset = datasetList[0];
            page.find('#datasets').val(selectedDataset.id);
        }

        changeEditorMode();
        setDataset(selectedDataset);
    }

    /**
     * Sets the editor mode to treeview if the user is not logged in or has no access rights to the dataset
     * */
    var changeEditorMode = function () {
        if (selectedDataset.userId > 0) {
            if (currentUser) {
                setEditorMode(selectedDataset.userId != currentUser.id);
            } else {
                setEditorMode(true);
            }
        } else {// create new Dataset
            setEditorMode(false);
            page.find('#btnDelete').hide();
        }
    }

    /**
     * Show the dataset info dialog
     * @param {event} e
     * */
    var showDatasetEditorInfo = function (e) {
        e.preventDefault();
        if (selectedDataset && selectedDataset.id > 0) {
            new DatasetInfoViewer().show(selectedDataset, true, true);
        } else {
            new MessageDialog().show('Select a Dataset', 'Please select an existing dataset or save the current one to display the dataset information.')
        }
        return false;
    }

    /**
     * Draws the vector from the inputfield to the vector grid
     * */
    var drawVector = function () {
        let inputVector = page.find('#inputVector').val();
        if (inputVector) {
            inputVector = inputVector.replace('[', '');
            inputVector = inputVector.replace(']', '');
            let intVector = inputVector.split(',').map(Number);
            grid.setVector(intVector);
        }
        return false;
    }

    /**
     * Copies the drawed vector from the vectorgrid to the clipboard
     * */
    var copyVectorToClipBoard = function () {
        let vector = '[' + grid.getVector().toString() + ']';
        copyToClipboard(vector);
        page.find('#btnCopyVector').removeClass('btn-primary');
        page.find('#btnCopyVector').addClass('btn-success');
        let btnText = page.find('#btnCopyVector').text();
        page.find('#btnCopyVector').text('Copied!');
        page.find('#btnCopyVector').prepend($('<span class="fas fa-check" style="margin-right:6px;">'));

        setTimeout(function () {
            page.find('#btnCopyVector').text(btnText);
            page.find('#btnCopyVector').addClass('btn-primary');
            page.find('#btnCopyVector').removeClass('btn-success');
            page.find('#btnCopyVector').prepend($('<span class="far fa-copy">'));

        }, 1500);

        return false;
    }

    /**
     * Clears the grid
     * */
    var clearGrid = function () {
        if (grid) {
            grid.clear();
        }
        return false;
    }

    //Source: https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard
    /**
     * Copies a text to the clipboard
     * @param {string} text
     */
    var copyToClipboard = function (text) {
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.setAttribute('value', text);
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }

    /**
     * Draws the grid if the editor has a matrix defined
     * */
    var drawGrid = function () {
        try {
            let jsonString = jsonEditor1.getText();
            let json = JSON.parse(jsonString);
            if (json.matrix && json.matrix.length == 2) {
                if (!gridMatrix || (gridMatrix[0] != json.matrix[0] || gridMatrix[1] != json.matrix[1])) {
                    gridMatrix = json.matrix;
                    if (grid) {
                        grid.dispose();
                    }
                    grid = new VectorGrid();
                    grid.init(json.matrix[0], json.matrix[1], page.find('#gridContainer'), 100);
                    page.find('#gridHelperContainer').show();
                }
            } else {
                //new MessageDialog().show('Matrix', 'Matrix must have length of 2 [rows, columns].');
                page.find('#gridHelperContainer').hide();
                gridMatrix = null;
            }
        } catch (err) { }
    }

    /**
     * Sets the editormode depending on the readonly flag
     * @param {bool} readOnly
     */
    var setEditorMode = function (readOnly) {
        if (readOnly) {
            page.find('#jsonEditor1').hide();

            page.find('#btnSave').hide();
            page.find('#btnDelete').hide();
            page.find('input[name="privacyFlags"]').attr('disabled', 'true');
            page.find('#datasetName').attr('readonly', 'true');
        } else {
            page.find('#jsonEditor1').show();
            page.find('#btnDelete').show();
            page.find('#btnSave').show();
            page.find('input[name="privacyFlags"]').prop('disabled', false);
            page.find('#datasetName').prop('readonly', false);
        }
    }

    /**
     * gets the public/privacy flag
     * @returns {int} flags
     * */
    var getFlags = function () {
        return parseInt(page.find('input[name="privacyFlags"]:checked').val());
    }

    /**
     * gets the dataset model from the view
     * */
    var getDataset = function () {
        let ds = {};
        ds.id = selectedDataset.id;
        ds.flags = getFlags();
        ds.json = jsonEditor1.getText();
        ds.name = page.find('#datasetName').val();
        return ds;
    }

    /**
     * sets the dataset to the view
     * @param {dataset} ds
     */
    var setDataset = function (ds) {
        jsonEditor1.setText(ds.json);
        jsonEditor2.setText(ds.json);
        jsonEditor1.format();
        if (ds.id > 0) {
            page.find('input[name="privacyFlags"]').val([ds.flags]);
            page.find('#datasetName').val(ds.name);
        } else {
            page.find('input[name="privacyFlags"]').val([privacy.Public]);
            page.find('#datasetName').val('');
        }
        drawGrid();
    }

    /**
     * sets the list of datasets to the view
     * @param {bool} withoutChangeCurrentDs
     * */
    var setDatasets = function (withoutChangeCurrentDs) {
        datasetList.unshift({ name: 'Create new Dataset', id: -1, json: getJsonTemplate(), userId: -1, flags: privacy.Public });

        let selectElm = page.find('#datasets');
        selectElm.empty();

        for (let i = 0; i < datasetList.length; i++) {
            let dataset = datasetList[i];
            let option = $('<option>')
            option.attr('value', dataset.id);
            option.text(dataset.name);
            selectElm.append(option);
        }

       
            if (urlDatasetId) {
                selectElm.val(urlDatasetId);
                urlDatasetId = null;
            }
            else if (selectedDataset) {
                selectElm.val(selectedDataset.id);
            } else if (!selectedDataset) {
                selectElm.val(-1);
        }

        if (!withoutChangeCurrentDs) {
            selectElm.change();
        } else {
            changeEditorMode();
        }
    }

    /**
     * gets the json template
     * @returns {string} json
     * */
    var getJsonTemplate = function () {
        return JSON.stringify({
            "description": "Your Dataset Description - [Contact the user manual for more information about creating a dataset.]",
            "isValidationset": false,
            "problemType": "choose one of: [classification (use one-hot encoding for labels), regression]",
            "items": [
                {
                    "data": [0, 0],
                    "labels": [0, 0]
                },
                {
                    "data": [1, 0],
                    "labels": [0, 1]

                }
            ],
            "stepSize": 1,
            "matrix": [1,2],
            "outputDescription": [
                "Description for Class 1",
                "Description for Class 2"
            ],
            "layers": [
                {
                    "neurons": 2
                },
                {
                    "neurons": 7,
                    "activation": "choose one of: [linear, relu, tanh, sigmoid, softmax]",
                    "bias": true
                },
                {
                    "neurons": 2,
                    "activation": "choose one of: [linear, relu, tanh, sigmoid, softmax]",
                    "bias": true
                }
            ],
            "trainingSettings": {
                "optimizer": "choose one of: [sgd, sgdm, adam, rmsprop]",
                "loss": "choose one of: [mse, sce]",
                "maxIterations": 1000,
                "minError": 0.05,
                "learningRate": 0.1,
                "momentum": 0.1
            }
        });
    }

    /**
     * inits the dataset editor
     * */
    this.init = function () {
        page = $('#datasetEditor');
        page.find('#btnSave').click(save);
        page.find('#btnDelete').click(deleteDataset);
        page.find('#btnDrawVector').click(drawVector)
        page.find('#btnCopyVector').click(copyVectorToClipBoard);
        page.find('#btnClearAll').click(clearGrid);
        page.find('#datasetInfo').click(showDatasetEditorInfo);

        page.find('#datasets').change(datasetChanged);

        dataService = new DatasetService();
        userService = new UserService();

        serviceLocator.get(serviceLocator.addToLoginSuccessService)(function ()
        {
            getAllDatasets(null, true);
        });
        serviceLocator.get(serviceLocator.addToLogoutSuccessService)(function () {
            getAllDatasets(null, false);
            currentUser = null;
        });

        urlDatasetId = getUrlParameter('datasetId');


        page.validate({
            rules: {
                datasetName: {
                    required: true
                }
            }
        })


        jsonEditor1 = new JSONEditor(page.find('#jsonEditor1').get(0),
            {
                mode: 'code',
                onChange: function () {
                    try {
                        jsonEditor2.updateText(jsonEditor1.getText());
                        drawGrid();
                    } catch (e) {

                    }
                },
            });


        jsonEditor2 = new JSONEditor(page.find('#jsonEditor2').get(0),
            {
                mode: 'tree',
                onChange: function () {
                    try {
                        jsonEditor1.updateText(jsonEditor2.getText());
                        jsonEditor1.format();
                        drawGrid();
                    } catch (e) {

                    }
                }
            });

        let openCloser = new OpenCloser();
        openCloser.init(page.find('#vectorHelperLabel'), page.find('#vectorHelperContainer'), false, null);

        getAllDatasets();
    }
}
