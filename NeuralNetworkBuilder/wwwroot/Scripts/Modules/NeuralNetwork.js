/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function NeuralNetwork() {
    var model = tf.sequential();
    var trainingIterations = 0;
    var drawingLayers;
    var trainingIsBusy = false;
    var lastError;

    this.isCompiled = false;
    const biasValue = 1;
    const _instance = this;

    /**
     * Enum
     * */
    this.errorCodes = {
        VanishingGradientProblem: 1,
        StopRef: 2,
    };

    /**
     * gets the tf model
     * @returns tfModel
     * */
    this.getModel = function () {
        return model;
    }

    /**
     * Creates the neural network
     * @param {Layer} inputLayer
     * @param {LayerArray} hiddenLayers
     * @param {Layer} outputLayer
     */
    this.createNn = function (inputLayer, hiddenLayers, outputLayer) {
        if (model) {
            tf.dispose(model);
        }

        model = tf.sequential();
        trainingIterations = 0;
        lastError = null;
        if (hiddenLayers) {
            for (let i = 0; i < hiddenLayers.length; i++) {
                let hl = hiddenLayers[i];
                this.addLayer(hl.neurons, hl.activation, hl.hasBias, i == 0 ? inputLayer.neurons : null);

            }
        }
        this.addLayer(outputLayer.neurons, outputLayer.activation, outputLayer.hasBias, hiddenLayers && hiddenLayers.length > 0 ? null : inputLayer.neurons);
        drawingLayers = null;
    }

    /**
     * Adds a layer to the network
     * @param {int} neurons
     * @param {string} activation
     * @param {bool} bias
     * @param {IntArray} inputShape
     */
    this.addLayer = function (neurons, activation, bias, inputShape) {
        let layerOptions = { units: parseInt(neurons), activation: activation, useBias: bias, inputShape: [parseInt(inputShape)] };
        if (!inputShape) {
            delete layerOptions.inputShape;
        }
        model.add(tf.layers.dense(layerOptions));
        drawingLayers = null;
    }

    /**
     * Compiles the neural network
     * @param {string} loss
     * @param {string} optimizer
     * @param {float} learningRate
     * @param {float} momentum
     */
    this.compile = function (loss, optimizer, learningRate, momentum) {
        let tfOptimizer = null;
        let tfLoss = null;
        let decay = 0.9; //tf default value
        learningRate = learningRate || learningRate == 0 ? learningRate : undefined;
        momentum = momentum || momentum == 0 ? momentum : undefined;

        if (optimizer == 'adam') {
            tfOptimizer = new tf.train.adam(learningRate); //lr optional
        } else if (optimizer == 'sgd') {
            tfOptimizer = new tf.train.sgd(learningRate);
        } else if (optimizer == 'rmsprop') {
            tfOptimizer = new tf.train.rmsprop(learningRate, decay, momentum); //decay, momentum optional
        } else if (optimizer == 'sgdm') {
            tfOptimizer = new tf.train.momentum(learningRate, momentum);
        }
        else {
            throw new Exception('Unknown Loss Optimizer!');
        }

        if (loss == 'mse') {
            tfLoss = 'meanSquaredError';
        } else if (loss == 'sce') {
            tfLoss = tf.losses.softmaxCrossEntropy;
        } else {
            throw new Exception('Unknown Loss Function!');
        }

        model.compile({ loss: tfLoss, optimizer: tfOptimizer, metrics: ['accuracy'] });
        drawingLayers = null;

        this.isCompiled = true;
    }

    /**
     * Calculates the net input for a neuron
     * @param {Float32Array} inputs
     * @param {Float32Array} weights
     * @param {Boolean} bias
     * @param {Float} biasWeight
     * @returns netInput
     */
    this.calculateNetInput = function (inputs, weights, bias, biasWeight) {
        if (inputs.length != weights.length) {
            throw new Error('Number of inputs does not match numbers of weights.');
        }

        let net = null;
        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            let weight = weights[i];
            net += input * weight;
        }

        if (bias) {
           net += biasValue * biasWeight;
        }
        return net;
    }

    /**
     * Calculates the output from the binary step activation function
     * @param {Float} netInput
     * @returns 0 if netInput < 0 and 1 if netInput >= 0
     */
    this.binaryStepActivationFunction = function(netInput){
        return netInput >= 0 ? 1 : 0;
    }

    /**
     * Trains a perceptron for the OR problem (one epoch)
     * @param {Float32Array2D} dataset
     * @param {Float32Array} labels
     * @param {Float32Array} weights
     * @param {Boolean} bias
     * @param {Float} biasWeight
     * @param {Float} lr
     */
    this.trainPerceptronWeights = function (dataset, labels, weights, bias, biasWeight, lr) {
        for (let i = 0; i < dataset.length; i++) {
            let input = dataset[i];
            let lbl = labels[i];

            let result = _instance.binaryStepActivationFunction(_instance.calculateNetInput(input, weights, bias, biasWeight));
            for (let w = 0; w < weights.length; w++) {
                weights[w] += lr * (lbl - result) * input[w];
            }
            if (bias) {
                biasWeight += lr * (lbl - result) * 1;
            }
        }

        return { weights: weights, biasWeight: biasWeight };
    }

    /**
     * Makes a prediction
     * @param {Float32Array} data
     * @returns prediction
     */
    this.compute = async function (data) {
        if (!model) {
            throw new Error('NN-Model is null');
        }

        let result = {};

        let prediction = model.predict(tf.tensor2d(data));
        let predictionResult = await prediction.data();
        tf.dispose(prediction);
        let maxValue = Number.MAX_VALUE * -1;

        for (let i = 0; i < predictionResult.length; i++) {
            if (predictionResult[i] > maxValue) {
                maxValue = predictionResult[i];
            }
        }

        let topActiveIndexes = [];
        let topActiveNeurons = [];
        for (let i = 0; i < predictionResult.length; i++) {
            if (compareFloat(6, predictionResult[i], maxValue)) {
                topActiveIndexes.push(i);
                topActiveNeurons.push(i + 1);
            }
        }

        result.prediction = predictionResult;
        result.topActiveIndexes = topActiveIndexes;
        result.topActiveNeurons = topActiveNeurons;
        return result;
    }

    /**
     * Trains the neural network
     * @param {int} epochs
     * @param {Float32Array} trainData
     * @param {Float32Array} labels
     * @param {float} minError
     * @param {int} maxIterations
     * @param {object} stopRef
     * @param {Function} onIteration
     * @param {Function} onTrainingEnd
     * @param {int} batchSize
     */
    this.train = async function (epochs, trainData, labels, minError, maxIterations, stopRef, onIteration, onTrainingEnd, batchSize) {
        try {
            if (trainingIsBusy) {
                return;
            }

            trainingIsBusy = true;

            if (typeof stopRef !== 'object' || stopRef === null) {
                let error = Error("'stopRef' must be type of object with property 'stop' (must be a reference type)");
                error.code = this.errorCodes.StopRef;
                throw error;
            }
            batchSize = batchSize ? batchSize : 1;
            if (!epochs) {
                throw new Error('NeuralNetwork: Epochs must be defined!');
            }

            let trainDataTensor = tf.tensor2d(trainData);
            let labelsTensor = tf.tensor2d(labels);

            let error = lastError || 100;
            let iteration = trainingIterations;
            while (error >= minError && maxIterations > iteration && !stopRef.stop) {
                let h = await model.fit(trainDataTensor, labelsTensor, { epochs: 1 });
                error = h.history.loss[0];
                lastError = error;

                if (isNaN(error)) {
                    let error = new Error('Error while training (vanishing / exploding gradient problem).' +
                        ' First reset the network, then try another learning strategy, or adjust the network architecture.')
                    error.code = this.errorCodes.VanishingGradientProblem;
                    throw error;
                }

                iteration++;
                trainingIterations = iteration;
                if (onIteration) {
                    onIteration(iteration, error);
                }
            }

            trainingIsBusy = false;
            tf.dispose(trainDataTensor);
            tf.dispose(labelsTensor);
            drawingLayers = null;

            if (onTrainingEnd) {
                onTrainingEnd(iteration, error);
            }
        } catch (err) {
            trainingIsBusy = false;
            throw err;
        }
    }

    /**
     * Gets a description of the current model
     * @returns description
     */
    this.getModelDescription = function () {
        let layers = [];
        layers.push({ activation: 'none', neurons: model.layers[0].batchInputShape[1], hasBias: false })
        for (let idx in model.layers) {
            let layer = model.layers[idx];
            let layerConfig = layer.getConfig();
            let layerInfo = {};
            layerInfo.activation = layerConfig.activation;
            layerInfo.neurons = layerConfig.units;
            layerInfo.hasBias = layerConfig.useBias;
            layers.push(layerInfo);
        }
        return layers;

    }

    /**
     * Gets the model description for drawing (with weights)
     * @returns modeldescription
     * */
    this.getWeightsForDrawing = async function () {
        if (!drawingLayers) {
            let layers = [];
            layers.push({ neuronsCount: model.layers[0].weights[0].shape[0], hasBias: false, weights: [] });
            for (let idx in model.layers) {
                let layer = model.layers[idx];
                let layerBefore = layers[layers.length - 1]
                let layerWeights = layer.getWeights();
                let layerInfo = {};
                for (let wIdx in layerWeights) {
                    let weights = await layerWeights[wIdx].data();

                    if (wIdx > 0) {
                        layerBefore.hasBias = true;
                        layerBefore.biasWeights = weights;
                        layerBefore.neurons.push({ isBias: true, weights: weights, layerId: layerBefore.id })
                    } else {
                        layerBefore.weights = weights;
                        layerInfo.neuronsCount = layerWeights[wIdx].shape[1];
                        layerInfo.hasBias = false;
                        createNeurons(layerBefore, layerInfo.neuronsCount);
                    }
                }
                layers.push(layerInfo);
            }
            createNeurons(layers[layers.length - 1]); // create neurons for last layer
            drawingLayers = layers;
        }

        return jQuery.extend(true, [], drawingLayers);;
    }

    /**
     * Sets the weights for the layer
     * @param {int} layerIdx
     * @param {Float32Array} weights
     * @param {Float32Array} biasWeights
     */
    this.setWeights = function (layerIdx, weights, biasWeights) {
        tensors = [];
        drawingLayers = null;
        tensors.push(tf.tensor(weights));
        if (biasWeights && biasWeights.length > 0) {
            tensors.push(tf.tensor(biasWeights));
        }
        model.layers[layerIdx].setWeights(tensors);
    }

    /**
     * Create the Description for Neurons
     * @param {layer} layerInfo
     * @param {neuronsArray} nextLayerNeurons
     */
    var createNeurons = function (layerInfo, nextLayerNeurons) {
        layerInfo.neurons = [];
        for (let i = 0; i < layerInfo.neuronsCount; i++) {
            let neuron = {};
            if (nextLayerNeurons) {
                neuron.weights = layerInfo.weights.slice(i * nextLayerNeurons, (i * nextLayerNeurons) + nextLayerNeurons);
                neuron.layerId = layerInfo.id;
            }
            layerInfo.neurons.push(neuron);
        }
    }


}
