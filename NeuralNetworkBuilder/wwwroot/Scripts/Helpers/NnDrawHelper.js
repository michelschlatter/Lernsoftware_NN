/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */


/**
 * 
 * Converts the layers to drawable layers format
 * */
function VisualizeHelper() {

    this.convertLayers = function (inputLayer, hiddenLayers, outputLayer) {
        inputLayer = jQuery.extend(true, {}, inputLayer);
        hiddenLayers = jQuery.extend(true, [], hiddenLayers);
        outputLayer = jQuery.extend(true, {}, outputLayer);

        let inputHasBias = hiddenLayers && hiddenLayers[0] ? hiddenLayers[0].hasBias : outputLayer.hasBias;
        let drawableInputLayer = convertToDrawableLayer(inputLayer, inputHasBias);
       
        let drawableHiddenLayers = [];
        for (let i = 0; i < hiddenLayers.length; i++) {
            let nextLayerHasBias = (i + 1) >= hiddenLayers.length ? outputLayer.hasBias : hiddenLayers[i + 1].hasBias;
            drawableHiddenLayers.push(convertToDrawableLayer(hiddenLayers[i], nextLayerHasBias));
        }
        let drawableOutputLayer = convertToDrawableLayer(outputLayer, false);

        let layers = [];
        layers.push(drawableInputLayer);
        for (let i = 0; i < drawableHiddenLayers.length; i++) {
            layers.push(drawableHiddenLayers[i]);
        }
        layers.push(drawableOutputLayer);

        for (let i = 0; i < layers.length; i++) {
            layers[i].hasBias = layerHasBiasNeuron(layers[i]);
            if (i + 1 <= layers.length - 1 && layers[i].hasBias) {
                layers[i + 1].hasBias = false;
            }
        }

        return layers;
    }

    /**
     * Checks if the layer has a bias neuron
     * @param {Layer} layer
     * @returns {bool} hasBias
     */
    function layerHasBiasNeuron(layer) {
        let hasBias;
        for (let n = 0; n < layer.neurons.length; n++) {
            let neuron = layer.neurons[n];
            if (neuron.isBias) {
                hasBias = true;
                break;
            }
        }
        return hasBias;
    }

    /**
     * Convert the layer to a drawable layer
     * @param {layer} layer
     * @param {bool} nextLayerHasBias
     * @returns {layer} drawable layer
     */
    var convertToDrawableLayer = function (layer, nextLayerHasBias) {
        let drawLayer = jQuery.extend({}, layer);
        drawLayer.neurons = [];
        layer.neurons = parseInt(layer.neurons);
        if (nextLayerHasBias) {
            layer.neurons++;
        }
        for (let i = 0; i < layer.neurons; i++) {
            drawLayer.neurons.push({ neuronValue: false, isBias: i == 0 ? nextLayerHasBias : false, weights: null, value: null });
        }
        return drawLayer;
    }
}


