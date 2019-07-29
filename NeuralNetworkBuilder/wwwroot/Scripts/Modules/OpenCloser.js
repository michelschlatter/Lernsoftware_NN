/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function OpenCloser() {
    var elm;
    var container;
    var onChange;
    var isVisible;
    const spanClose = $('<span id="arrowRight" class="fas fa-angle-right" style="margin-right:10px;">');
    const spanOpen = $('<span id="arrowDown" class="fas fa-angle-down" style="margin-right:10px;">');

    /**
     * Changes the visibility of the container
     * */
    var changeVisibility = function () {
        isVisible = !isVisible;
        if (isVisible) {
            elm.find('#' + spanClose.attr('id')).remove();
            elm.prepend(spanOpen);
            container.show();
        } else {
            elm.find('#' + spanOpen.attr('id')).remove();
            elm.prepend(spanClose);
            container.hide();
        }

        if (onChange) {
            onChange(isVisible);
        }
    }

    /**
     * Gets the visibility of the container
     * @returns container visbility
     * */
    this.isVisible = function(){
     return isVisible;   
    }

    /**
     * Sets the visbility of the container
     * @param {bool} visible
     */
    this.setVisible = function(visible){
        if(visible && !isVisible){
            changeVisibility();
        }else if(!visible && isVisible){
            changeVisibility();
        }
    }

    /**
     * Disposes the open closer
     * */
    this.dispose = function () {
        elm.find('#' + spanClose.attr('id')).remove();
        elm.find('#' + spanOpen.attr('id')).remove();
        elm.off();
    }

    /**
     * Inits the open closer
     * @param {DomObject} elmToClick
     * @param {DomObject} containerElm
     * @param {bool} isOnInitOpen
     * @param {Function} changeFunction
     */
    this.init = function (elmToClick, containerElm, isOnInitOpen, changeFunction) {
        elm = elmToClick;
        onChange = changeFunction;
        container = containerElm;
        isVisible = !isOnInitOpen;
        changeVisibility();
        elm.click(changeVisibility);
        elm.css('cursor', 'pointer');
    }
}
