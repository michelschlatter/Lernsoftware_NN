/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function Playground() {
    var inputLayer;
    var outputLayer;
    var weights;
    var biasWeights;
    var inputValues;
    var nnVisualizer;
    var page;
    var nn;

    var validator;

    /**
     * Gets the model from the view
     * */
    var getModel = function () {
        inputLayer = getLayerModel(page.find('#inputLayer'));
        outputLayer = getLayerModel(page.find('#outputLayer'));
        getInputValues();
        getWeights();
    };

    /**
     * Gets the layer model
     * @param {DomObject} elm
     */
    var getLayerModel = function (elm) {
        var model = {
            id: elm.attr('layerId'),
            neurons: getByAttribute(elm, 'name', 'neurons').val(),
            activation: getByAttribute(elm, 'name', 'activation').val(),
            hasBias: getByAttribute(elm, 'name', 'bias').val() === 'true',
        };
        return model;
    };

    /**
     * gets the input values and sets it to a global variable
     * */
    var getInputValues = function () {
        inputValues = [];
        inputValues.push(parseFloat(page.find('#inputNeuron1').val()))
        inputValues.push(parseFloat(page.find('#inputNeuron2').val()))

    }

    /**
     * gets the weights and sets it to a global variable
     * */
    var getWeights = function () {
        weights = [];
        weights.push([parseFloat(page.find('#weight1').val())]);
        weights.push([parseFloat(page.find('#weight2').val())]);
        if (outputLayer.hasBias) {
            biasWeights = [];
            biasWeights.push(parseFloat(page.find('#biasWeight').val()));
        } else {
            biasWeights = null;
        }
    }

    /**
     * Visualizes the neural network inclusive the results of the prediction
     * @param {NeuralNetwork.Result} result
     */
    var visualizeNeuralNetwork = async function (result) {
        if (isModelValid()) {
            let convertedLayers = await nn.getWeightsForDrawing();
            for (let n = 0; n < convertedLayers[0].neurons.length; n++) {
                convertedLayers[0].neurons[n].value = inputValues[n];
            }
            convertedLayers[1].neurons[0].value = result.prediction[0];
            nnVisualizer.draw({ layers: convertedLayers, showOutputValueText: true, showInputValueText: true});
        }
    }

    /**
     * Checks if the model is valid
     * */
    var isModelValid = function () {
        return outputLayer.activation;
    }

    /**
     * Enables or diables the bias weight field
     * */
    var enableDisableBiasWeight = function () {
        if (outputLayer.hasBias) {
            page.find('#biasWeightContainer').show();
        } else {
            page.find('#biasWeightContainer').hide();
        }
    }

    /**
     * Processes the given info to an neural network output 
     * */
    var processInfo = async function () {
        validator.resetForm();
        if (page.valid()) {
            getModel();
            enableDisableBiasWeight();
            let result = null;
            if (outputLayer.activation != 'binaryStep') {
                page.find('#trainWeightsContainer').hide();
                nn.createNn(inputLayer, null, outputLayer);
                nn.compile('mse', 'adam');
                await nn.setWeights(0, weights, biasWeights);

                result = await nn.compute([inputValues]);
            } else {
                outputLayer.activation = 'linear'; // workaround
                nn.createNn(inputLayer, null, outputLayer)
                nn.compile('mse', 'adam');
                await nn.setWeights(0, weights, biasWeights);

                page.find('#trainWeightsContainer').show();
                result = { prediction: [nn.binaryStepActivationFunction(nn.calculateNetInput(inputValues, weights, outputLayer.hasBias, biasWeights))] };
            }
            visualizeNeuralNetwork(result);
        }
    }

    /**
     * Trains the weights for one iteration with the OR problem
     * */
    var trainOneIteration = function (e) {
        e.preventDefault();
        validator.resetForm();
        if (page.valid()) {
            page.find('#outputLayer').find('[name="bias"]').val('true');
            getModel();
            let or =
                [[0, 0],
                [0, 1],
                [1, 0],
                [1, 1],];

            let labels = [0, 1, 1, 1];
            if (outputLayer.activation == 'binaryStep') {
                let lr = parseFloat(page.find('#learningRate').val());
                let newWeights = nn.trainPerceptronWeights(or, labels, [weights[0][0], weights[1][0]], outputLayer.hasBias, outputLayer.hasBias ? biasWeights[0] : null, isNaN(lr) ? 1 : lr);
                page.find('#weight1').val(newWeights.weights[0]);
                page.find('#weight2').val(newWeights.weights[1]);
                if (!isNaN(newWeights.biasWeight) && outputLayer.hasBias) {
                    page.find('#biasWeight').val(newWeights.biasWeight);
                }
                processInfo();
            }
        }
        return false;
    }

    /**
     * gets an element by attribute
     * @param {DomObject} container
     * @param {string} attribute
     * @param {string} value
     * @returns {DomObject} element
     */
    var getByAttribute = function (container, attribute, value) {
        return container.find('[' + attribute + '=' + value + ']');
    };

    /**
     * inits the playground page
     * */
    this.init = function () {
        page = $('#playgroundContainer');
        nn = new NeuralNetwork();
        nnVisualizer = new NeuralNetworkVisualizer();
        nnVisualizer.init(page.find('#nnv'), true);

        validator = page.validate({
            rules: {
                neurons: {
                    required: true,
                    number: true
                },
                weights: {
                    required: true,
                    number: true
                }
            }
        })

        let outputLayerElm = page.find('#outputLayer');
        getByAttribute(outputLayerElm, 'name', 'activation').change(processInfo);
        getByAttribute(outputLayerElm, 'name', 'bias').change(processInfo);

        page.find('#inputNeuron1').keyup(processInfo);
        page.find('#inputNeuron1').on('input', processInfo);

        page.find('#inputNeuron2').keyup(processInfo);
        page.find('#inputNeuron2').on('input', processInfo);

        page.find('#weight1').keyup(processInfo);
        page.find('#weight1').on('input', processInfo);

        page.find('#weight2').keyup(processInfo);
        page.find('#weight2').on('input', processInfo);

        page.find('#biasWeight').keyup(processInfo);
        page.find('#biasWeight').on('input', processInfo);

        page.find('#btnOneIteration').click(trainOneIteration);

        page.find('#trainOrInfoDialog').find('#btnOk').click(function () {
            page.find('#trainOrInfoDialog').modal('hide');
        });

        page.find('#trainingInfo').click(function (e) {
            e.preventDefault();
            page.find('#trainOrInfoDialog').modal('show');
            return false;
        });
        
        processInfo();

    }
}
