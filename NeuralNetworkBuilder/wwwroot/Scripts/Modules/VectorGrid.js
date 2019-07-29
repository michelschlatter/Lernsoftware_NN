function VectorGrid() {
    var rows;
    var cols;
    var container;
    var width;
    var clickable = true;

    const tableId = 'nnInputGrid';

    /**
     * Toggles the cell (active, inactive)
     * @param {HTMLTableCellElement} elm
     * @param {bool} isForce
     */
    var toggleCell = function (elm, isForce) {
        if (!clickable && !isForce) return;

        let cell = elm;
        if (cell.attr('active') === 'true') {
            cell.attr('active', 'false');
            cell.css('background-color', 'white');
        } else {
            cell.attr('active', 'true');
            cell.css('background-color', 'black');
        }
    }

    /**
     * Sets the vector to the grid
     * @param {Int32Array} vector
     */
    this.setVector = function (vector) {
        let table = container.find('#' + tableId);
        let idx = 0;
        table.find('tr').each(function () {
            let row = $(this);
            row.find('td').each(function () {
                let cell = $(this);
                if (vector.length - 1 >= idx && vector[idx] == 1) {
                    cell.attr('active', 'true');
                    cell.css('background-color', 'black');
                } else {
                    cell.attr('active', 'false');
                    cell.css('background-color', 'white');
                }
                idx++;
            });
        });
    }

    /**
     * Gets the Vector from the grid
     * @returns {Int32Array} vector
     * */
    this.getVector = function () {
        let table = container.find('#' + tableId);
        let vector = [];
        table.find('tr').each(function () {
            let row = $(this);
            row.find('td').each(function () {
                let cell = $(this);
                vector.push(cell.attr('active') === 'true' ? 1 : 0);
            });
        });

        return vector;
    }

    /**
     * Disposes the vectorgrid
     * */
    this.dispose = function () {
        if (container) {
            container.empty();
        }
    }

    /**
     * clears the vectorgrid
     * */
    this.clear = function () {
        container.find('#' + tableId).find('td[active="true"]').each(function () {
            toggleCell($(this), true);
        });
    }

    /**
     * sets the grid to clickable or unclickable
     * @param {bool} value
     */
    this.setClickable = function (value) {
        clickable = value;
        let color = clickable ? '#ffffff' : '#e9ecef';
        container.find('#' + tableId).find('td').each(function () {
            $(this).css('background-color', color);
        });
    }

    /**
     * draws the vectorgrid
     * */
    var draw = function () {
        let table = $('<table>');
        table.attr('id', tableId);
        table.css('width', width + 'px');
        table.css('height', height + 'px');

        table.attr('rows', rows);
        table.attr('cols', cols);

        for (let r = 0; r < rows; r++) {
            let row = $('<tr>');
            row.attr('row', r);
            for (let c = 0; c < cols; c++) {
                let cell = $('<td>');
                cell.attr('cell', c);
                cell.css('background-color', 'white');
                cell.click(function () {
                    toggleCell($(this));
                });
                row.append(cell);
            }
            table.append(row);
        }
        container.empty();
        container.append(table);
    }

/*
* Author: Michel Schlatter
* Date: 28.07.2019
* Version: 1.0
*/

    /**
     * Inits the vectorgrid
     * @param {int} numberOfRows
     * @param {int} columns
     * @param {DomObject} elmContainer
     * @param {int} gridWidth
     */
    this.init = function (numberOfRows, columns, elmContainer, gridWidth) {
        rows = numberOfRows;
        cols = columns;
        container = elmContainer;
        width = gridWidth;
        height = (width / cols) * rows;

        draw();
    };
}