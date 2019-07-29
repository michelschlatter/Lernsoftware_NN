/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 * 
 * this class is inspired by following sources:
  *https://bl.ocks.org/e9t/6073cd95c2a515a9f0ba
  *https://codepen.io/dulldrums/pen/mqrddY
 */



function NeuralNetworkVisualizer() {
    var elm;
    var width = 0;
    var height = 0;
    var resizeEvent = null;
    var resizeDisposed = false;
    const nodeSize = 20;
    const color = d3.scale.category20();

    var _network;
    var _layers;
    var _maxNeurons = 0;

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    /**
     * Prepares the drawing graph
     * */
    function prepareLayers() {

        for (let i = 0; i < _layers.length; i++) {
            let layer = _layers[i];
            layer.neuronsCount = layer.neurons.length;
            let layerLetter = i == 0 ? 'i' : i == (_layers.length - 1) ? 'o' : 'h' + (i - 1);
            setBiasOnFirstIndex(layer);

            for (let n = 0; n < layer.neurons.length; n++) {
                let neuron = layer.neurons[n];
                neuron.layer = i + 1;
                neuron.displayName = neuron.isBias ? 'Bias = 1' : layerLetter + (layer.hasBias ? n : n + 1);
            }
        }
    }

    /**
     * Sets the Bias on the first index in the array
     * @param {Layer} layer
     */
    function setBiasOnFirstIndex(layer) {
        for (let n = 0; n < layer.neurons.length; n++) {
            let neuron = layer.neurons[n];
            if (neuron.isBias) {
                layer.neurons.splice(0, 0, neuron);
                layer.neurons.splice(n + 1, 1);
            }
        }
    }

    /**
     * Draws the network to the svg
     * @param {networkGraph} networkGraph
     * @param {svg} svg
     */
    function drawGraph(networkGraph, svg) {

        let xdist = width / _layers.length;
        let ydist = (height - 15) / _maxNeurons;

        let biasY = ((((0 + 1) - 0.5) + ((_maxNeurons - _maxNeurons) / 2)) * ydist) + 10

        for (let i = 0; i < _layers.length; i++) {
            let layer = _layers[i];
            for (let n = 0; n < layer.neurons.length; n++) {
                let neuron = layer.neurons[n];
                neuron.x = ((i + 1) - 0.5) * xdist;
                neuron.y = ((((n + 1) - 0.5) + ((_maxNeurons - layer.neuronsCount) / 2)) * ydist) + 10;

                if (neuron.isBias) {
                    neuron.x += xdist / 2.5;
                    neuron.y = biasY;
                }
            }
        }

        let links = [];
        for (let i = 0; i < _layers.length - 1; i++) {
            let layerLeft = _layers[i];
            let layerRight = _layers[i + 1];

            for (let nl = 0; nl < layerLeft.neurons.length; nl++) {
                let neuronLeft = layerLeft.neurons[nl];
                for (let nr = 0; nr < layerRight.neurons.length; nr++) {
                    let weightIdx = layerRight.hasBias ? nr - 1 : nr;
                    let neuronRight = layerRight.neurons[nr];
                    if (!neuronRight.isBias) {
                        links.push({ sourceNeuron: neuronLeft, targetNeuron: neuronRight, weight: neuronLeft.weights ? neuronLeft.weights[weightIdx] : null });
                    }
                }
            }
        }

        // draw links
        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .attr("x1", function (l) { return l.sourceNeuron.x; })
            .attr("y1", function (l) { return l.sourceNeuron.y; })
            .attr("x2", function (l) { return l.targetNeuron.x; })
            .attr("y2", function (l) { return l.targetNeuron.y; })
            .attr('weight', function (l) { return l.weight; })
            .style("stroke-width", function (l) {
                let stroke = 1;
                if (l.weight) {
                    stroke = Math.abs(l.weight);
                    stroke = Math.sqrt(Math.pow(Math.E, stroke));
                    if (stroke < 0.7) {
                        stroke = 0.7;
                    }
                    else if (stroke > 4) {
                        stroke = 4;
                    }
                }
                return stroke;
            })
            .on("mouseover", function (l) {
                if (l.weight) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(l.weight.toFixed(5))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                }
            })
            .on("mouseout", function (l) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        let neurons = [];
        for (let i = 0; i < _layers.length; i++) {
            let layer = _layers[i];
            for (let n = 0; n < layer.neurons.length; n++) {
                neurons.push(layer.neurons[n]);
            }
        }

        // draw nodes
        var node = svg.selectAll(".node")
            .data(neurons)
            .enter().append("g")
            .attr("transform", function (n) {
                return "translate(" + n.x + "," + n.y + ")";
            });

        var circle = node.append("circle")
            .attr("class", "node")
            .attr("r", nodeSize)
            .style("fill", function (n) {
                return n.color ? n.color : '#1648ee'; // neuron color #red / #blue
            })
            .on("mouseover", function (n) {
                if (n.layer == _layers.length && hasValue(n)) { // last layer show output
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("Out:" + parseFloat(n.value.toFixed(4)))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                } else if (n.layer == 1 && hasValue(n)) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html("In:" + parseFloat(n.value.toFixed(4)))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 40) + "px");
                }
            }).on("mouseout", function (n) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });;

        node.append("text")
            .attr("dx", function (n) {
                if (n.displayName.indexOf("Bias") >= 0) {
                    return "-1.7em";
                }
                else if (n.displayName.indexOf("i") >= 0 && n.displayName.length == 3) {
                    return "-.50em";
                }
                else if (n.displayName.length == 2) {
                    return "-.45em";
                }
                else if (n.displayName.length == 3) {
                    return "-.8em";
                }
                else if (n.displayName.length > 3) {
                    return "-.95em";
                }
                else {
                    return "-.55em";
                }
            })
            .attr("dy", function (n) { return ".35em" })
            .attr("font-size", function (n) {
                if (n.displayName.length >= 3) {
                    return ".6em"
                } else {
                    return ".7em";
                }
            })
            .attr("fill", "white")
            .text(function (n) { return n.displayName; });

        node
            .filter(function (n) { return (n.layer == 1 || n.layer == _layers.length) })
            .append("text")
            .attr("dx", function (n) {
                if (n.layer == _layers.length && _network.showOutputValueText) {
                    return "1.6em";
                } else if (n.layer == 1 && _network.showInputValueText) {
                    if (hasValue(n) && _network.showInputValueText) {

                        let text = parseFloat(n.value.toFixed(4)) + '->';
                        let widths = [];
                        let lengthpxt = node
                            .filter(function (d, i) { return i == 0 })
                            .append("text").attr('font-size', '16px')
                            .text(function (n) { return text })
                            .each(function (d, i) {
                                widths.push(this.getComputedTextLength());
                                this.remove();
                                return false;
                            })

                        return (-widths[0] - 22) + "px";
                    }
                }
            })
            .attr("dy", ".35em")
            .attr("font-size", "16px")
            .text(function (n) {
                if (n.layer == _layers.length) {
                    return _network.showOutputValueText && hasValue(n) ? '-> ' + parseFloat(n.value.toFixed(4)) : '';
                } else if (n.layer == 1) {
                    return _network.showInputValueText && hasValue(n) ? parseFloat(n.value.toFixed(4)) + '->' : '';
                }
            });
    }

    /**
     * Checks if a neuron has a value
     * @param {neuron} n
     * @returns {bool} 
     */
    function hasValue(n) {
        return n.value != null && n.value !== undefined && !isNaN(n.value);
    }

    /**
     * Draws the neural network to the svg
     * */
    function draw() {
        let selector = "#" + elm.attr('id');
        elm.find('svg').remove();

        if (elm.is(":visible")) {
            var svg = d3.select(selector).append("svg")
                .attr("width", width)
                .attr("height", height);

            networkGraph = prepareLayers();
            drawGraph(networkGraph, svg);
        }
    }

    /**
     * Initialization
     * @param {jquery dom element} container
     * @param {bool} refrshOnResize
     */
    this.init = function (container, refrshOnResize) {
        elm = container;
        width = $(elm).innerWidth() - 60;
        if (refrshOnResize) {
            $(window).resize(function () {
                if (resizeEvent) {
                    clearTimeout(resizeEvent);
                }

                if (resizeDisposed) {
                    return;
                }

                resizeEvent = setTimeout(function () {
                    width = $(elm).innerWidth() - 60;
                    if (width > 0) { // is hidden but still active
                        if (_layers && _layers.length > 0) {
                            draw();
                        }
                    }
                }, 300)
            });
        }
    }

    /**
     * Draws the Neural Network
     * @param {object} neuralNetwork
     * @param {bool} showInputValueText
     * @param {bool} showOutputValueText
     * @param {string} neuralNetwork.optimizer
     * @param {string} neuralNetwork.loss
     * @param {object array} neuralNetwork.layers
     * @param {string} neuralNetwork.layers.activation
     * @param {object array} neuralNetwork.neurons
     * @param {float array} neuralNetwork.neurons.weights
     * @param {bool} neuralNetwork.neurons.isBias
     * @param {float} neuralNetwork.neurons.value
     * @param {bool} neuralNetwork.neurons.color 
     */
    this.draw = function (neuralNetwork) {
        _network = neuralNetwork;
        _layers = neuralNetwork.layers;
        _maxNeurons = 0;
        for (let i = 0; i < _layers.length; i++) {
            if (_layers[i].neurons.length > _maxNeurons) {
                _maxNeurons = _layers[i].neurons.length;
            }
        }
        width = $(elm).innerWidth() - 60;
        height = nodeSize * 2 * _maxNeurons + 10 * _maxNeurons;
        draw();
        }

    /**
     * Disposes the neureal network visualizer
     * */
    this.dispose = function () {
        resizeDisposed = true;
    }


};
