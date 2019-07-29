/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

/// <reference path="../Services/UserService.js" />
/// <reference path="../Helpers/ErrorHandling.js" />
/// <reference path="../Modules/NeuralNetworkVisualizer.js" />
/// <reference path="../Frameworks/jquery.min.js">

function NeuralNetworkBuilder() {
    var _instance = this;
    var page;
    var inputLayer;
    var hiddenLayers = [];
    var outputLayer;
    var hiddenLayerContainer;
    var activeHiddenLayers;
    var datasetService;
    var openCloser;
    var usePredefinedArchitecture;
    
    var selectedDataset;
    var datasetList;
    var nnVisualizer;

    var learner;
    var validator;

    /**
     * Initializes the learn view
     * @param {event} e
     */
    var initializeLearnView = function (e) {
        e.preventDefault();
        if (page.valid()) {
            getModel();
            if (checkDatasetAndModelCompatability()) {
                page.hide();
                learner = new NeuralNetworkLearner();
                learner.init(_instance, { inputLayer: inputLayer, hiddenLayers: hiddenLayers, outputLayer: outputLayer }, datasetList, selectedDataset, openCloser.isVisible(), usePredefinedArchitecture);
            }
        } else {
            $('html, body').animate({
                scrollTop: page.find('.is-invalid').offset().top
            }, 1000);
        }

        return false;
    }

    /**
     * Gets called when the user navigates back to this site. 
     * */
    this.comeBack = function () {
        page.show();
        visualizeNeuralNetwork();
    }

    /**
     * Gets all visible datasets from the service
     * */
    var getDatasets = function () {
        datasetService.query(setDatasets, errorHandling.handleError)
    }

    /**
   * gets called when the dataset changes
   * */
    var datasetChanged = function () {
        let id = page.find('#architectureBuilderDataset').val();
        if (selectedDataset && selectedDataset.id == id) {
            return;
        }

        usePredefinedArchitecture = false;
        if (id && id > 0) {
            page.find('#btnSaveArchitecture').prop('disabled', false);
        }

        for (let i = 0; i < datasetList.length; i++) {
            if (datasetList[i].id == id) {
                selectedDataset = datasetList[i];
                break;
            }
        }

        if (selectedDataset && (selectedDataset.dataset.hasPredefinedArchitecture || selectedDataset.dataset.hasPredefinedTrainingSettings)) {
            let msg = 'The dataset offers  preconfigured settings {0}. Would you like to adopt the provided settings?';
            let settingsDescription = selectedDataset.dataset.hasPredefinedArchitecture && selectedDataset.dataset.hasPredefinedTrainingSettings 
            ? '(architecture- and trainingsettings)' : selectedDataset.dataset.hasPredefinedArchitecture ? '(Architecture)' :
            selectedDataset.dataset.hasPredefinedTrainingSettings ? '(Trainingsettings)' : '';
            msg = msg.replace('{0}', settingsDescription);
            
            new YesNoDialog().show('Accept changes?',
                msg,
                function () {
                    usePredefinedArchitecture = true;
                    hiddenLayers = [];
                    initLayers(selectedDataset.dataset.layers);
                    page.find('is-invalid').removeProp('aria-describedby');
                    page.find('.is-invalid').removeClass('is-invalid');
                    page.valid();
                }, function () {
                    page.find('is-invalid').removeProp('aria-describedby');
                    page.find('.is-invalid').removeClass('is-invalid');
                    page.valid();
                });
        } else {
            getModel();
            inputLayer.neurons = selectedDataset.dataset.inputNeurons;
            outputLayer.neurons = selectedDataset.dataset.outputNeurons;
            renderLayers();
        }
    }

    /**
     * Checks if the neural network is compatible with the dataset
     * @returns {bool}
     * */
    var checkDatasetAndModelCompatability = function () {
        if (inputLayer.neurons != selectedDataset.dataset.inputNeurons) {
            new MessageDialog().show('Incompatible Inputlayer', 'This dataset requires ' + selectedDataset.dataset.inputNeurons + ' input neurons. You have provided ' +
                inputLayer.neurons + ' neurons.');
            return false;
        } else if (outputLayer.neurons != selectedDataset.dataset.outputNeurons) {
            new MessageDialog().show('Incompatible Outputlayer', 'This dataset requires ' + selectedDataset.dataset.outputNeurons + ' output neurons. You have provided ' +
                outputLayer.neurons + ' neurons.');
            return false;
        }
        return true;
    }

    /**
     * sets the datasets to the view and holds it in a global variable
     * @param {datasetList} datasets
     */
    var setDatasets = function (datasets) {
        datasetList = datasets;
        let selectElm = page.find('#architectureBuilderDataset');
        selectElm.empty();
        let firstOption = $('<option value="" selected disabled>');
        firstOption.text('Choose...');
        selectElm.append(firstOption);

        let selectedDsFound = false;
        for (let i = 0; i < datasets.length; i++) {
            let dataset = datasets[i];
            if (selectedDataset && dataset.id == selectedDataset.id) {
                selectedDsFound = true;
            }

            if (!dataset.dataset.isValidationset) {
                let option = $('<option>')
                option.attr('value', dataset.id);
                option.text(dataset.name);
                selectElm.append(option);
            }
        }

        if (!selectedDsFound) {
            selectedDataset = null;
            page.find('#architectureBuilderDataset').val('')
            page.find('#btnSaveArchitecture').prop('disabled', true);
        }

        if (selectedDataset) {
            page.find('#architectureBuilderDataset').val(selectedDataset.id);
        }
    }

    /**
     * adds a new hidden layer to the model and presents it to the view
     * */
    var addNewHiddenLayer = function () {
        getModel();
        hiddenLayers.push({ neurons: 2, activation: 'tanh', hasBias: 'true' });
        reorderHiddenLayers();
        renderHiddenLayers();
        visualizeNeuralNetwork();
        return false;
    };

    /**
     * renders the all layers to the view
     * */
    var renderLayers = function () {
        setLayerValues(page.find('#inputLayer'), inputLayer);
        setLayerEvents(page.find('#inputLayer'));
        setLayerValues(page.find('#outputLayer'), outputLayer);
        setLayerEvents(page.find('#outputLayer'));
        renderHiddenLayers();
        visualizeNeuralNetwork();
    };

    /**
     * renders the hidden layers to the view
     * */
    var renderHiddenLayers = function () {
        activeHiddenLayers.empty();

        for (var idx in hiddenLayers) {
            var hl = hiddenLayers[idx];
            var hlTemplate = hiddenLayerContainer.find('#hiddenLayerTemplate').clone();
            setLayerValues(hlTemplate, hl, function (elm, layer) {
                hlTemplate.attr('hiddenLayer', layer.id);
                hlTemplate.attr('id', 'hiddenLayer' + layer.id);
                getByAttribute(elm, 'name', 'description').text('Hidden ' + (layer.id) + ':');
                getByAttribute(elm, 'name', 'btnDeleteLayer').click(removeHiddenLayer);
                getByAttribute(elm, 'name', 'btnDeleteLayer').attr('hiddenLayer', layer.id);
                activeHiddenLayers.append(hlTemplate);
                hlTemplate.show();
            });
            setLayerEvents(hlTemplate);
        }
    };

    /**
     * Sets the layervalues to the view
     * @param {DomObject} elm
     * @param {Layer} layer
     * @param {function} additionFunction
     */
    var setLayerValues = function (elm, layer, additionFunction) {
        elm.attr('layerId', layer.id);
        getByAttribute(elm, 'name', 'neurons').val(layer.neurons);
        getByAttribute(elm, 'name', 'activation').val(layer.activation);
        getByAttribute(elm, 'name', 'bias').val(layer.hasBias ? 'true' : 'false');
        if (additionFunction) {
            additionFunction(elm, layer);
        }
    };

    /**
     * Sets the events to the layer-dom-object
     * @param {DomObject} elm
     */
    var setLayerEvents = function (elm) {
        let validateNeuronField = function () {
            if ($(this).valid()) {
                visualizeNeuralNetwork();
            }
        }
        let neuronElm = getByAttribute(elm, 'name', 'neurons');
        neuronElm.keyup(validateNeuronField);
        neuronElm.on('input', validateNeuronField);
        neuronElm.rules('add', {
            number: true,
            required: true,
            min: 1
        });

        let biasElm = getByAttribute(elm, 'name', 'bias');
        biasElm.change(visualizeNeuralNetwork);
        biasElm.rules('add', { required: true });

        let activationElm = getByAttribute(elm, 'name', 'activation');
        activationElm.rules('add', { required: true });
    }

    /**
     * Removes a hidden layer from the view
     * */
    var removeHiddenLayer = function () {
        var id = $(this).attr('hiddenLayer');
        for (var idx in hiddenLayers) {
            if (hiddenLayers[idx].id == id) {
                hiddenLayers.splice(idx, 1);
            }
        }
        var layer = activeHiddenLayers.find('#hiddenLayer' + id);
        layer.remove();
        reorderHiddenLayers();
        renderHiddenLayers();
        visualizeNeuralNetwork();
    };

    /**
     * reorders the hidden layers
     * */
    var reorderHiddenLayers = function () {
        for (var i = 0; i < hiddenLayers.length; i++) {
            hiddenLayers[i].id = i + 1;
        };
    };

    /**
     * gets the neural network model from the dom
     * */
    var getModel = function () {
        inputLayer = getLayerModel(page.find('#inputLayer'));
        for (var i = 0; i < hiddenLayers.length; i++) {
            hiddenLayers[i] = getLayerModel(page.find('#hiddenLayer' + hiddenLayers[i].id));
        };
        outputLayer = getLayerModel(page.find('#outputLayer'));
    };

    /**
     * gets the layer from the model
     * @param {DomObject} elm
     */
    var getLayerModel = function (elm) {
        var layer = {
            id: elm.attr('layerId'),
            neurons: parseInt(getByAttribute(elm, 'name', 'neurons').val()),
            activation: getByAttribute(elm, 'name', 'activation').val(),
            hasBias: getByAttribute(elm, 'name', 'bias').val() === 'true',
        };
        return layer;
    };

    /**
     * Shows the datasetinfo dialog
     * @param {events} e
     */
    var showDatasetInfo = function (e) {
        e.preventDefault();
        new DatasetInfoViewer().show(selectedDataset, false, true);
        return false;
    }

    /**
     * gets the element by attribute
     * @param {DomObject} container
     * @param {string} attribute
     * @param {string} value
     * @returns {DomObject} elm
     */
    var getByAttribute = function (container, attribute, value) {
        return container.find('[' + attribute + '=' + value + ']');
    };

    /**
     * Visualized the neural network model to a svg
     * */
    var visualizeNeuralNetwork = async function () {
        getModel();
        if (page.find('[name="neurons"]').valid() && page.find('[name="bias"]').valid() && openCloser.isVisible()) {
            page.find('.rendering').show();
            setTimeout(function () {
                let visualizeHelper = new VisualizeHelper();
                let convertedLayers = visualizeHelper.convertLayers(inputLayer, hiddenLayers, outputLayer);
                nnVisualizer.draw({ layers: convertedLayers });
                page.find('.rendering').hide();
            }, 100)
        }
    }

    /**
     * checks if the layer is valid
     * @param {layer} layer
     */
    var isLayerValid = function (layer) {
        return layer.neurons > 0
            && layer.activation;
    }

    /**
     * sets the initial layers to the model and view
     * @param {any} layers
     */
    var initLayers = function (layers) {
        if (layers) {
            inputLayer = layers[0];
            hiddenLayers = [];
            for (var i = 1; i < layers.length - 1; i++) {
                hiddenLayers.push(layers[i]);
            }
            reorderHiddenLayers();
            outputLayer = layers[layers.length - 1];
        }
        renderLayers();
    };

    /**
     * inits the neural network builder view
     * */
    this.init = function () {
        page = $('#neuralNetworkBuilder');
        datasetService = new DatasetService();
        getDatasets();

        validator = page.validate();

        page.find('#btnAddNewHiddenLayer').click(addNewHiddenLayer);
        page.find('#btnSaveArchitecture').click(initializeLearnView);
        page.find('#architectureBuilderDataset').change(datasetChanged);
        page.find('#datasetInfoArchitectureBuilder').click(showDatasetInfo)

        hiddenLayerContainer = page.find('#hiddenLayerContainer');
        activeHiddenLayers = hiddenLayerContainer.find('#activeHiddenLayers');
        nnVisualizer = new NeuralNetworkVisualizer();
        nnVisualizer.init(page.find('#nnbv'), true);

        var layers = [];
        layers.push({ id: 0, neurons: 2, activation: '', hasBias: '' });
        layers.push({ id: 1, neurons: 7, activation: 'tanh', hasBias: 'true' });
        layers.push({ id: 2, neurons: 1, activation: 'tanh', hasBias: 'true' });

        serviceLocator.get(serviceLocator.addToLoginSuccessService)(getDatasets);
        serviceLocator.get(serviceLocator.addToLogoutSuccessService)(getDatasets);

        openCloser = new OpenCloser();
        openCloser.init(page.find('#nnBuilderVisualizationLabel'), page.find('#architectureNeuralNetworkViewer'), true, function (isVisible) {
            if (isVisible && page.valid()) {
                visualizeNeuralNetwork();
            }
        });

        initLayers(layers);
    }
}

