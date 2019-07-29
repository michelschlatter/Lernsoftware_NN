/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function NeuralNetworkComputer() {
    var _instance = this;
    var _nnTrainerInstance;

    var page;
    var nn;
    var grid;
    var nnVisualizer;
    var enableVisualization;
    var nnDescription;
    var datasetList;
    var selectedDataset;
    var datasetService;
    var openCloser;
    var validator;

    var manualInputElements = [];

    /**
     * Enum
     * */
    var inputSetting = {
        ByDataset: 0,
        Manually: 1
    }

    /**
     * Navigates the user back to the training page
     * */
    var backToTraining = function () {
        page.hide();
        _instance.dispose();
        _nnTrainerInstance.comeBack();
        return false;
    }


    /**
     * gets called when the input radio changed and organizes the view depending on the setting
     * */
    var inputRadioChanged = function () {
        let value = getCheckedInputRadioValue();
        page.find('#computeResult').text('');

        if (grid) {
            page.find('#inputGridContainer').show();
            page.find('#inputContainer').hide();
            page.find('#btnClearGrid').show();
            grid.clear();
            grid.setClickable(value == inputSetting.Manually);
            page.find('#btnClearGrid').prop('disabled', value != inputSetting.Manually)
        } else {
            page.find('#inputGridContainer').hide();
            page.find('#btnClearGrid').hide();
            page.find('#inputContainer').show();
            createInputElements(value != inputSetting.Manually);
        }

        if (value == inputSetting.Manually) {
            page.find('#computerDataset').unbind('.selection');
            page.find('#datasetInfoComputer').unbind('.selection');
            page.find('#computerDataset').prop('disabled', true);

            page.find('#consoleOutputContainer').hide();
            visualizeNeuralNetwork();
            page.find('#computationNeuralNetworkViewerContainer').show();
            //page.find('#computerDataset').rules('remove');
            openCloser.setVisible(enableVisualization);
        } else if (value == inputSetting.ByDataset) {
            page.find('#computerDataset').prop('disabled', false);
            page.find('#consoleOutput').html('');
            page.find('#consoleOutputContainer').show();
            page.find('#computationNeuralNetworkViewerContainer').hide();
            //page.find('#computerDataset').rules('add', { required: true });
            page.find('#inputContainer').find('input').each(function () {
                $(this).rules('remove');
            });
        }
    }

    /**
     * gets called when the dataset has changed
     * */
    var datasetChanged = function () {
        let id = page.find('#computerDataset').val();
        for (let i = 0; i < datasetList.length; i++) {
            if (datasetList[i].id == id) {
                selectedDataset = datasetList[i];
                break;
            }
        }
    }

    /**
     * Shows the dataset info in a dialog
     * @param {event} e
     */
    var showDatasetInfo = function (e) {
        e.preventDefault();
        new DatasetInfoViewer().show(selectedDataset, false, true);
        return false;
    }

    /**
     * sets the datasets to the view
     * */
    var setDatasets = function () {
        let selectElm = page.find('#computerDataset');
        selectElm.empty();
        let firstOption = $('<option value="" disabled>');
        firstOption.text('Choose...');
        selectElm.append(firstOption);

        for (let i = 0; i < datasetList.length; i++) {
            let dataset = datasetList[i];
            if (dataset.dataset.inputNeurons == selectedDataset.dataset.inputNeurons &&
                dataset.dataset.outputNeurons == selectedDataset.dataset.outputNeurons) {
                let option = $('<option>')
                option.attr('value', dataset.id);
                option.text(dataset.name);
                selectElm.append(option);
            }
        }
        if (selectedDataset) {
            page.find('#computerDataset').val(selectedDataset.id);
        }
    }

    /**
     * Gets the selected input type
     * @returns {int} value
     * */
    var getCheckedInputRadioValue = function () {
        return parseInt(page.find('input[name="inputTypeOption"]:checked').val());
    }

    /**
     * Visualizes the neural network to a svg
     * @param {Float32Array} inputVector
     * @param {Float32Array} output
     */
    var visualizeNeuralNetwork = async function (inputVector, output) {
        if (openCloser.isVisible()) {
            page.find('.rendering').show();
            setTimeout(async function () {
                let convertedLayers = await nn.getWeightsForDrawing();

                if (inputVector) {
                    for (let i = 0; i < inputVector.length; i++) {
                        convertedLayers[0].neurons[i].value = inputVector[i];
                    }
                }
                if (output) {
                    for (let i = 0; i < output.prediction.length; i++) {
                        convertedLayers[convertedLayers.length - 1].neurons[i].value = output.prediction[i];
                        if (output.topActiveIndexes.includes(i) && selectedDataset.dataset.problemType.toLowerCase() == 'classification') {
                            convertedLayers[convertedLayers.length - 1].neurons[i].color = '#f44242'; // highlight the most active neurons
                        }
                    }
                }
                nnVisualizer.draw({ layers: convertedLayers, showOutputValueText: true, showInputValueText: true }, true);
                page.find('.rendering').hide();
            }, 100);
        }
    }

    /**
     * Clears the vectorgrid
     * */
    var clearGrid = function () {
        if (grid) {
            grid.clear();
        }
        return false;
    }

    /**
    * Binds the selected text in the textarea to the vector grid. 
    * so that inputvectors can be displayed.
    * */
    var bindTextAreaSelectionToGrid = function () {
        if (grid) {
            page.find('#consoleOutput').select(function () {
                let consoleOutput = page.find('#consoleOutput');
                let selection = consoleOutput.text().substring(consoleOutput[0].selectionStart, consoleOutput[0].selectionEnd + 2);
                let intVector = [];
                for (let idx in selection) {
                    let char = selection[idx];
                    if (char == '1' || char == '0') {
                        intVector.push(parseInt(char));
                    }
                }
                let matrix = selectedDataset.dataset.matrix;
                if (intVector.length == (matrix[0] * matrix[1])) {
                    grid.setVector(intVector);
                }
            });

            /**
             * Clears the gridview and unselects the selected text
             * */
            let onUnselect = function () {
                grid.clear();
                grid.setClickable(false);
                let consoleOutput = page.find('#consoleOutput');
                consoleOutput[0].selectionStart = 0;
                consoleOutput[0].selectionEnd = 0;
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                else if (document.selection) {
                    document.selection.empty();
                }
            };     

            page.find('#computerDataset').bind('click.selection', onUnselect);
            page.find('#datasetInfoComputer').bind('click.selection', onUnselect);
            page.find("#consoleOutput").on("blur focus keydown mousedown", onUnselect);
        }
    }

    /**
     * Gets the vector from the vectorgrid
     * @returns {Int32Array} inputvector
     * */
    var getInputVector = function () {
        let inputVector = [];
        if (grid) {
            inputVector = grid.getVector();
        } else if (!grid) {
            for (let i = 0; i < manualInputElements.length; i++) {
                inputVector.push(parseFloat(manualInputElements[i].val()));
            }
        }
        return inputVector;
    }

    /**
     * Calculates the squared error
     * @param {float} predictet
     * @param {float} actual
     * @returns {float} squared error
     */
    var getSquaredError = function (predictet, actual) {
        return Math.pow((predictet - actual), 2);
    }

    /**
     * Calculates the MSE
     * @param {float} summedSquaredErrors
     * @param {int} predictionCount
     * @returns MSE
     */
    var getMse = function (summedSquaredErrors, predictionCount) {
        return (summedSquaredErrors / predictionCount);
    }

    /**
     * Calculates the accuracy in percent
     * @param {int} correctPredictions
     * @param {int} predictionCount
     * @returns {float} accuracy (2 floating points)
     */
    var calculateAccuracyInPercent = function (correctPredictions, predictionCount) {
        return ((correctPredictions / predictionCount).toFixed(4) * 100)
    }

    /**
     * checks if a classification prediction is correct
     * @param {NeuralNetwork.Result} result
     * @param {Dataset.Item} item
     * @returns {bool} isCorrect
     */
    var isClassificationPredictionCorrect = function (result, item) {
        let isCorrect = false;
        for (let labelIdx = 0; labelIdx < item.labels.length; labelIdx++) {
            if (item.labels[labelIdx] == 1 && result.topActiveIndexes.length == 1) { // only one class can be active in one hot encoding
                if (result.topActiveIndexes.includes(labelIdx)) {
                    isCorrect = true;
                }
            }
        }
        return isCorrect;
    }

    /**
     * Makes a prediction with the help of the neural network
     * @param {event} e
     */
    var compute = async function (e) {
        e.preventDefault();
        if (page.valid()) {
            let manualInput = getCheckedInputRadioValue() == 1;
            if (manualInput) {
                let inputVector = getInputVector();
                let input = [inputVector];
                let result = await nn.compute(input);
                visualizeManualInputComputation(inputVector, result);
            } else {
                let correctPredictions = 0;
                let predictionCount = 0;
                let squaredErrors = 0;

                let consoleElm = page.find('#consoleOutput');
                consoleElm.html('');

                for (let i = 0; i < selectedDataset.dataset.items.length; i++) {
                    let item = selectedDataset.dataset.items[i];
                    let result = await nn.compute([item.data]);

                    if (selectedDataset.dataset.problemType.toLowerCase() == 'classification' && result && result.prediction.length > 1) {// can only calculate accuracy on classification one hot vectors
                        if (item.labels && item.labels.length == result.prediction.length) {// we can calculate accuracy only on supervised datasets
                            predictionCount++;
                            correctPredictions += isClassificationPredictionCorrect(result, item) ? 1 : 0;
                        }
                    } else if (selectedDataset.dataset.problemType.toLowerCase() == 'regression' && result && result.prediction) { // for regression, calculate the mse
                        if (item.labels && item.labels.length == result.prediction.length) {// we can calculate the mse only on supervised datasets
                            predictionCount++;
                            for (let i = 0; i < result.prediction.length; i++) {
                                squaredErrors += getSquaredError(result.prediction[i], item.labels[i]);
                            }
                        }
                    }
                    writeOutputForCalculation(consoleElm, result, item, i);
                }

                writeMetricsToOutput(consoleElm, predictionCount, correctPredictions, squaredErrors);

            }
        } else {
            $('html, body').animate({
                scrollTop: page.find('.is-invalid').offset().top
            }, 1000);
        }
    }

    /**
     * Writes the metrics to the output
     * @param {DomObject} consoleElm
     * @param {int} predictionCount
     * @param {int} correctPredictions
     * @param {float} squaredErrors
     */
    var writeMetricsToOutput = function (consoleElm, predictionCount, correctPredictions, squaredErrors) {
        let newLine = '&#13;&#10;'
        if (predictionCount > 0 && selectedDataset.dataset.problemType.toLowerCase() == 'classification') {
            let accuracy = calculateAccuracyInPercent(correctPredictions, predictionCount);
            consoleElm.html('Accuracy: [' + accuracy + '%]' +
                newLine + newLine +
                consoleElm.val());
        } else if (selectedDataset.dataset.problemType == 'regression') {
            let mse = getMse(squaredErrors, predictionCount);
            consoleElm.html('MSE: [' + mse + ']' +
                newLine + newLine +
                consoleElm.val());
        }
    }

    /**
     * Writes the result from a calculation to the output
     * @param {DomObject} consoleElm
     * @param {NeuralNetwork.Result} result
     * @param {Dataset.Item} item
     * @param {int} i
     */
    var writeOutputForCalculation = function (consoleElm, result, item, i) {
        let newLine = '&#13;&#10;'
        let resultDescription = sanitizeHtml(getResultDescription(result));
        let isDescription = sanitizeHtml(getItemDescription(item));
        let activeNeuronIdxString = result.prediction.length > 1 ? ('Active Neuron Index: [' + getTrimmedVector(result.topActiveNeurons) + ']' + newLine) : '';
        let outputString = 'Inputvector: [' + sanitizeHtml(getTrimmedVector(item.data, 4)) + ']' + newLine +
            'Outputvector: [' + getTrimmedVector(result.prediction, 4) + ']' + newLine +
            'Labelvector: [' + sanitizeHtml(getTrimmedVector(item.labels)) + ']' + newLine +
            activeNeuronIdxString +
            (resultDescription ? ('Predicted Class: [' + resultDescription + ']' + newLine) : '') +
            (isDescription ? ('Is Class: [' + isDescription + ']') : '');

        consoleElm.html(consoleElm.val() +
            (i != 0 ? (newLine + newLine) : '') +
            outputString);
    }

    /**
     * Visualizes the manual input computation 
     * @param {Float32Array} inputVector
     * @param {NeuralNetwork.Result} result
     */
    var visualizeManualInputComputation = function (inputVector, result) {
        let resultString = '';
        let predicate = 'Result: ';
        if (!selectedDataset.dataset.outputDescription) {
            if (result.prediction.length > 1 && selectedDataset.dataset.problemType == 'classification') {
                for (let i = 0; i < result.topActiveIndexes.length; i++) {
                    let additive = ','
                    if (i == result.topActiveIndexes.length - 1) {
                        additive = '';
                    }
                    resultString += ' ' + (result.topActiveIndexes[i] + 1) + additive;
                    predicate = 'Most active Neurons: '
                }
            } else if (result.prediction.length == 1) {
                resultString = result.prediction[0];
            }
        } else {
            resultString = getResultDescription(result);
        }

        if (resultString) {
            page.find('#computeResult').text(predicate + resultString);
        }
        visualizeNeuralNetwork(inputVector, result);
    }

    /**
     * Gets the result description
     * @param {NeuralNetwork.Result} result
     * @returns {string} result description
     */
    var getResultDescription = function (result) {
        let resultString = '';
        if (selectedDataset.dataset.outputDescription) {
            for (let i = 0; i < result.topActiveIndexes.length; i++) {
                let additive = ','
                if (i == result.topActiveIndexes.length - 1) {
                    additive = '';
                }
                resultString += ' ' + (selectedDataset.dataset.outputDescription[result.topActiveIndexes[i]]) + additive;
            }
        }
        return resultString;
    }

    /**
     * Gets the result description from the item
     * @param {Dataset.Item} item
     * @returns {string} result description
     */
    var getItemDescription = function (item) {
        let resultString = '';
        if (selectedDataset.dataset.outputDescription) {
            for (let i = 0; i < item.labels.length; i++) {
                if (item.labels[i] == 1) {
                    resultString += ' ' + (selectedDataset.dataset.outputDescription[i]) + ' ';
                }
            }
        }
        return resultString;
    }

    /**
     * Gets the result string from the vector trimmed to length of digits
     * @param {Float32Array} vector
     * @param {int} digits
     * @returns {string} trimmed vector string
     */
    var getTrimmedVector = function (vector, digits) {
        let stringVector = [];
        for (let i = 0; i < vector.length; i++) {
            let entry = vector[i];
            let entryLength = entry.toString().length;
            let additive = i == vector.length - 1 ? '' : ' ';
            if (isInt(entry)) {
                stringVector.push(entry.toString() + additive);
            } else {
                stringVector.push(entry.toFixed(entryLength > digits ? digits : entryLength).toString() + additive);
            }
        }
        return stringVector;
    }

    /**
     * Checks if n is an int
     * @param {any} n
     * @returns {bool}
     */
    var isInt = function (n) {
        return n % 1 === 0;
    }

    /**
     * Creates the input elements
     * @param {bool} readOnly
     */
    var createInputElements = function (readOnly) {
        let inputNeurons = nnDescription.inputLayer.neurons;
        manualInputElements = [];
        page.find('#inputContainer').empty();

        for (let i = 0; i < inputNeurons; i++) {
            let inputContainerElm = page.find('#inputContainerTemplate').clone();
            inputContainerElm.attr('id', 'inputContainer' + i);
            let inputElm = inputContainerElm.find('#inputTemplate');
            inputElm.attr('id', 'manualInputField' + i);
            inputElm.attr('name', 'manualInputField' + i);
            inputElm.attr('placeholder', 'Input ' + i);
            if (selectedDataset.dataset.stepSize) {
                inputElm.attr('step', selectedDataset.dataset.stepSize)
            }
            manualInputElements.push(inputElm);
            inputContainerElm.show();
            page.find('#inputContainer').append(inputContainerElm);

            if (readOnly) {
                inputElm.attr('readonly', 'true');
            } else {
                inputElm.rules('add', { required: true, number: true, step: false })
            }
        }
    }

    /**
    * Gets the internal function references for unit testing 
    * @returns {object} object with reference to internal functions
    */
    this.getFunctionsForUnittesting = function () {
        return {
            calculateAccuracyInPercent: calculateAccuracyInPercent,
            getMse: getMse,
            getSquaredError: getSquaredError,
            isClassificationPredictionCorrect: isClassificationPredictionCorrect
        };
    }

    /**
     * disposes the computation page
     * */
    this.dispose = function () {
        page.find('#btnCompute').off();
        page.find('input[name="inputTypeOption"]').off();
        page.find('#btnBackToTraining').off();
        page.find('#computerDataset').off();
        page.find('#datasetInfoComputer').off();
        page.find('#btnClearGrid').off();
        page.find("#consoleOutput").off();
        validator.destroy();

        page.find('#consoleOutput').html('');
        openCloser.dispose();

        nnVisualizer.dispose();
        if (grid) {
            grid.dispose();
            grid = null;
        }
    }

    /**
     * Inits the Computation page
     * @param {NeuralNetworkLearner} trainingPage
     * @param {NeuralNetwork} neuralNetwork
     * @param {Dataset} dataset
     * @param {DatasetList} dataSetList
     * @param {NeuralNetworkBuilder.Description} neuralNetworkDescription
     */
    this.init = function (trainingPage, neuralNetwork, dataset, dataSetList, neuralNetworkDescription, visualizationVisible) {
        page = $('#neuralNetworkComputer');
        _nnTrainerInstance = trainingPage;
        selectedDataset = dataset;
        datasetList = dataSetList;
        nn = neuralNetwork;
        nnDescription = neuralNetworkDescription;

        setDatasets();
        page.show();

        page.find('#btnCompute').click(compute);
        page.find('#btnClearGrid').click(clearGrid);
        page.find('input[name="inputTypeOption"]').change(inputRadioChanged);
        page.find('#btnBackToTraining').click(backToTraining)
        page.find('#computerDataset').change(datasetChanged);
        page.find('#datasetInfoComputer').click(showDatasetInfo);

        nnVisualizer = new NeuralNetworkVisualizer();
        nnVisualizer.init(page.find('#nncv'), true);

        openCloser = new OpenCloser();
        openCloser.init(page.find('#nnComputerVisualizationLabel'), page.find('#computationNeuralNetworkViewer'), false, function (isVisible) {
            if (isVisible) {
                visualizeNeuralNetwork();
            }
            enableVisualization = isVisible;
        });
        enableVisualization = visualizationVisible;
        validator = page.validate();

        dataset.ProblemType = "classification";
        let matrix = selectedDataset.dataset.matrix ? selectedDataset.dataset.matrix : null;
        if (matrix) {
            grid = new VectorGrid();
            grid.init(matrix[0], matrix[1], page.find('#inputGridContainer'), 100);
            grid.setClickable(false);
            bindTextAreaSelectionToGrid();
        }
        inputRadioChanged();
    }
}
