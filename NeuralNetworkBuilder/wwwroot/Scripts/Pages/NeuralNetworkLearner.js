/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

/// <reference path="../Helpers/ErrorHandling.js" />
/// <reference path="../Modules/NeuralNetworkVisualizer.js" />
/// <reference path="../Modules/NeuralNetwork.js" />
/// <reference path="../Modules/LineChart.js" />

function NeuralNetworkLearner() {
    var _architectureBuilderInstance;
    var _instance = this;

    var page = null;
    var nn = null;
    var enableVisualization = false;
    var nnDescription = null;
    var dataset = null;
    var lineChart = null;
    var usePredefinedTrainingSettings;
    var nnVisualizer = null;
    var validator = null;
    var openCloser;
    

    var datasetList; 
    var selectedDataset;

    var stopRef = { stop: true };

    var nnComputation;

    /**
     * Navigates the user back to the architecture page
     * @param {event} e
     */
    var navigateBackToArchitecture = function (e) {
        page.hide();
        resetToComputationButton(false);
        _instance.dispose();
        _architectureBuilderInstance.comeBack();
        return false;
    } 

    /**
     * Gets called when the user navigates back to the learning page
     * */
    this.comeBack = function () {
        page.show();
    }

    /**
    * Navigates the user to the computation page
    * @param {event} e
    */
    var continueToComputation = function (e) {
        e.preventDefault();
        nnComputation = new NeuralNetworkComputer();
        page.hide();
        nnComputation.init(_instance, nn, selectedDataset, datasetList, nnDescription, enableVisualization);
        return false;
    }

    /**
     * Gets called on training iteration ends
     * Updates the linechart dataset
     * @param {int} iteration
     * @param {float} error
     */
    var onIteration = function (iteration, error) {
        lineChart.updateDataset(iteration, error);
    }

    /**
     * Gets called when the training ends
     * Shows a hint if the minimum error isn't undershoot and the maxiterations is reached (min iterations: 100)
     * @param {any} iteration
     * @param {any} error
     */
    var onTrainingEnd = function (iteration, error) {
        visualizeNeuralNetwork();

        if (!stopRef.stop) {
            let options = getTrainingOptions();
            let datasetMaxIterationReached = selectedDataset.dataset.maxIterations ? iteration >= selectedDataset.dataset.maxIterations : true;
            if (options.minError < error && datasetMaxIterationReached && iteration >= options.maxIterations) {
                new MessageDialog().show('Hint', 'The training was stopped automatically because the maximum iterations were reached. ' +
                    'The minimum error could not be reached. ' +
                    'Reset the network and adjust the training strategy and / or the network architecture. ' +
                    'If you think the network architecture and the training strategy are fine just reset the network (maybe you had just bad luck with the initial weights).');
            }
            else if (options.minError >= error) {
                new MessageDialog().show('Training successfully finished', 'The minimum error was successfully reached. The training was stopped automatically.', null, 'alert-success');
            }
        }

        resetToStartTraining();
        resetToComputationButton(true);
    }

    /**
     * Resets the view to start training
     * */
    var resetToStartTraining = function () {
        stopRef.stop = true
        page.find('#btnStartStopTrainingText').text('Start');
        page.find('#btnStartStopTrainingIcon').removeClass('fas fa-stop');
        page.find('#btnStartStopTrainingIcon').addClass('fas fa-play');
        page.find('#btnContinueToComputation').prop('disabled', false);
        page.find('#btnResetNetwork').prop('disabled', false);
        page.find('#btnBackToArchitecture').prop('disabled', false);
    }

    /**
     * resets the view to stop the training
     * */
    var resetToStopTraining = function () {
        stopRef.stop = false;
        page.find('#btnStartStopTrainingText').text('Stop');
        page.find('#btnStartStopTrainingIcon').removeClass('fas fa-play');
        page.find('#btnStartStopTrainingIcon').addClass('fas fa-stop');
        page.find('#btnContinueToComputation').prop('disabled', true);
        page.find('#btnResetNetwork').prop('disabled', true);
        page.find('#btnBackToArchitecture').prop('disabled', true);
    }

    /**
     * resets the computation button
     * @param {bool} hasTrained
     */
    var resetToComputationButton = function (hasTrained) {
        let iconSpan = page.find('#btnContinueToComputationIcon');
        let textSpan = page.find('#btnContinueToComputationText');
        page.find('#btnContinueToComputation').prop('disabled', false);
        page.find('#btnResetNetwork').prop('disabled', false);

        if (hasTrained) {
            iconSpan.removeClass('fa-exclamation-triangle');
            iconSpan.addClass('fa-arrow-right');
            textSpan.text('Continue to Computation');
        } else {
            iconSpan.removeClass('fa-arrow-right');
            iconSpan.addClass('fa-exclamation-triangle')
            textSpan.text('Continue without training');
        }
    }

    /**
     * Toggles the start and stop of the training
     * */
    var startStopTraining = function () {
        if (stopRef.stop) {
            if (page.valid()) {
                resetToStopTraining();
                train();
            } else {
                $('html, body').animate({
                    scrollTop: page.find('.is-invalid').offset().top
                }, 1000);
            }
        } else {
            resetToStartTraining();
        }
        return false;
    }

    /**
     * Resets the network and the view to an initial state
     * */
    var resetNetwork = function () {
        createNn();
        lineChart.reset();
        resetToComputationButton(false);
        return false;
    }

    /**
     * Visualizes the neural netwrok to a svg
     * */
    var visualizeNeuralNetwork = async function () {
        if(openCloser.isVisible()){
            page.find('.rendering').show();
            setTimeout(async function () {
                let convertedLayers = await nn.getWeightsForDrawing();
                nnVisualizer.draw({ layers: convertedLayers });
                page.find('.rendering').hide();
            }, 100);
        }
    }

    /**
     * Shows the optimizer settings info dialog
     * */
    var showOptimizerSettingsInfo = function () {
        $('#optimizerSettingsInfoDialog').modal('show');
        return false;
    }

    /**
     * Shows the loss info dialog
     * */
    var showLossInfo = function () {
        $('#lossInfoDialog').modal('show');
        return false;
    }

    /**
     * Shows the optimizer info dialog
     * */
    var showOptimizersInfo = function () {
        $('#optimizerInfoDialog').modal('show');
        return false;
    }

    var resetTrainingSettings = function () {
        page.find('#optimizer').val('sgd');
        page.find('#loss').val('mse');
        page.find('#learningRate').val('');
        page.find('#momentum').val('');
        page.find('#minError').val('');
        page.find('#maxIterations').val('');
    }

    /**
     * Setts the training settings delivered from the dataset
     * */
    var setTrainingSettings = function () {
        resetTrainingSettings();
        if (selectedDataset.dataset.trainingSettings && usePredefinedTrainingSettings) {
            let settings = selectedDataset.dataset.trainingSettings;
            if (settings.optimizer) {
                page.find('#optimizer').val(settings.optimizer);
            }
            if (settings.loss) {
                page.find('#loss').val(settings.loss);
            }
            if (settings.learningRate) {
                page.find('#learningRate').val(settings.learningRate);
            }
            if (settings.momentum) {
                page.find('#momentum').val(settings.momentum);
            }
            if (settings.minError) {
                page.find('#minError').val(settings.minError);
            }
            if (settings.maxIterations) {
                page.find('#maxIterations').val(settings.maxIterations);
            }
        }
    }

    /**
     * Trains the neural network
     * Shows the error if happens while training
     * */
    var train = async function () {
        let options = getTrainingOptions();
        nn.compile(options.loss, options.optimizer, options.learningRate, options.momentum);
        await nn.train(1, selectedDataset.dataset.data, selectedDataset.dataset.labels, options.minError, options.maxIterations, stopRef, onIteration, onTrainingEnd, 1)
            .catch(function (err) {
                if (err.code == nn.errorCodes.VanishingGradientProblem) {
                    new MessageDialog().showErrorDialog(err.message);
                    resetToStartTraining();
                    page.find('#btnContinueToComputation').prop('disabled', true); // disable computation page because nn is in error.
                } else {
                    new MessageDialog().showErrorDialog(err.message);
                    resetToStartTraining();
                    page.find('#btnContinueToComputation').prop('disabled', true); // disable computation page because nn is in error.
                }
            });
      
    }

    /**
     * Gets the training options from the view
     * */
    var getTrainingOptions = function () {
        return {
            learningRate: parseFloat(page.find('#learningRate').val()),
            momentum: parseFloat(page.find('#momentum').val() ? page.find('#momentum').val() : 0.0),
            loss: page.find('#loss').val(),
            optimizer: page.find('#optimizer').val(),
            maxIterations: parseInt(page.find('#maxIterations').val()),
            minError: parseFloat(page.find('#minError').val()),
        }
    }

    /**
     * creates the neural network
     * */
    var createNn = function () {
        nn = new NeuralNetwork();
        nn.createNn(nnDescription.inputLayer, nnDescription.hiddenLayers, nnDescription.outputLayer);
        visualizeNeuralNetwork();
    }

     /**
     * Sets the rule for the learningrate (required or not)
     * */
    var setLearningRateRule = function () {
        if (page.find('#optimizer').val() != 'adam') {
            page.find('#learningRate').rules('add', {
                required: true,
                number: true
            });
            
        } else {
            page.find('#learningRate').rules('remove');
        }
        page.find('#learningRate').rules('add', { step: false });
    }

    /**
     * Sets the visibility of the momentum field depending on the optimizer
     * */
    var setMomentumVisbility = function () {
        if (page.find('#optimizer').val() == 'rmsprop' || page.find('#optimizer').val() == 'sgdm') {
            page.find('#momentum').show();
            if (page.find('#optimizer').val() == 'sgdm') { //momentum only required for sgdm
                page.find('#momentum').rules('add', {
                    required: true,
                    number: true
                });
            } else {
                page.find('#momentum').rules('remove');
            }
        } else {
            page.find('#momentum').hide();
            page.find('#momentum').rules('remove');
        }
        page.find('#momentum').rules('add', { step: false });
    }

 
    /**
     * Disposes the learning page
     * */
    this.dispose = function () {
        page.find('#btnBackToArchitecture').off();
        page.find('#btnStartStopTraining').off();
        page.find('#btnResetNetwork').off();
        page.find('#btnContinueToComputation').off();
        page.find('#optimizer').off();
        page.find('#optimizerSettingsInfo').off();
        page.find('#lossInfo').off();
        page.find('#optimizerInfo').off();
        page.find('#btnContinueToComputation').prop('disabled', false);
        
        openCloser.dispose();
        validator.destroy();
        nnVisualizer.dispose();
        lineChart.dispose();
        page.find('#trainingErrorChartContainer').empty();
        lineChart = null;
    }

    /**
     * Inits the learning page
     * @param {NeuralNetworkBuilder} architecturePage
     * @param {NeuralNetworkBuilder.Description} neuralNetworkDescription
     * @param {DatasetList} dataSetList
     * @param {Dataset} dataset
     */
    this.init = function (architecturePage, neuralNetworkDescription, dataSetList, dataset, visualizationVisible, usePredefinedArchitecture) {
        _architectureBuilderInstance = architecturePage;
        page = $('#neuralNetworkLearner');

        validator = page.validate({
            rules: {
                optimizer: {
                    required: true
                },
                loss: {
                    required: true
                },
                learningRate: {
                    required: true,
                    number: true,
                },
                maxIterations: {
                    required: true,
                    number: true
                },
                minError: {
                    required: true,
                    number: true,
                }
            }
        });

        page.find('#minError').rules('add', { step: false });
        page.find('#learningRate').rules('add', { step: false });

        openCloser = new OpenCloser();
        openCloser.init(page.find('#nnLearnerVisualizationLabel'), page.find('#learnerNeuralNetworkViewer'), visualizationVisible, function (isVisible) {
            if (isVisible) {
                visualizeNeuralNetwork();
            }
        });

        nnDescription = neuralNetworkDescription;
        enableVisualization = visualizationVisible;
        selectedDataset = dataset;
        datasetList = dataSetList;
        usePredefinedTrainingSettings = usePredefinedArchitecture;
        setTrainingSettings();
        createNn();
       
        page.show();

        page.find('#btnBackToArchitecture').click(navigateBackToArchitecture);
        page.find('#btnStartStopTraining').click(startStopTraining)
        page.find('#btnResetNetwork').click(resetNetwork)
        page.find('#btnContinueToComputation').click(continueToComputation)
        page.find('#optimizer').change(function () {
            validator.resetForm();
            setLearningRateRule();
            setMomentumVisbility();
        });
        page.find('#optimizerSettingsInfo').click(showOptimizerSettingsInfo);
        page.find('#lossInfo').click(showLossInfo);
        page.find('#optimizerInfo').click(showOptimizersInfo);

        nnVisualizer = new NeuralNetworkVisualizer();
        nnVisualizer.init(page.find('#nnlv'), true);
        
        let canvas = $('<canvas>');
        canvas.attr('id', 'trainingErrorChart');
        page.find('#trainingErrorChartContainer').append(canvas);
        lineChart = new LineChart();
        lineChart.init(page.find('#trainingErrorChart'));
        
        setLearningRateRule();
        setMomentumVisbility();

    }
}
