var websocket_url = 'https://ahmetalper-reddit-place-clone.hf.space'
var websocket_reconnect_timeout = 3
var websocket;

function connect_websocket() {

    websocket = new WebSocket(websocket_url);

    websocket.onopen = function() {

        console.log('Connected to WebSocket server');

        send_message({'message' : 'fetch grid'});

    };

    websocket.onclose = function() {

        console.log('WebSocket connection closed');

        console.log(`Trying to reconnect in ${websocket_reconnect_timeout} seconds`);

        setTimeout(connect_websocket, websocket_reconnect_timeout * 1000);

    };

    websocket.onerror = function(event) {

        console.log(`WebSocket Error: ${event.message || 'Unknown error'}`);

        if (websocket.readyState === WebSocket.OPEN) {

            websocket.close();

        }

    };

    websocket.onmessage = function(event) {

        try {

            const data = JSON.parse(event.data);

            if (data['message'] == 'fetch grid') {

                grid = data['grid'];

                draw_grid();

            }

            if (data['message'] == 'update grid') {

                grid = data['grid'];

                draw_grid();

            }

        } catch (error) {

            console.error('Error while parsing message data :', error);

        }

    };
   
}

function send_message(message) {

    if (websocket.readyState === WebSocket.OPEN) {

        websocket.send(JSON.stringify(message));

    } else {

        console.log('Message cannot sent ! | WebSocket connection is not open.');

    }
}

const cell_size = 10;
const row_size = 300;
const column_size = 300;

const grid_width = (row_size * cell_size) + (row_size + 1);
const grid_height = (column_size * cell_size) + (column_size + 1);

const canvas = document.querySelector('.grid');
const context = canvas.getContext('2d');

canvas.width = grid_width;
canvas.height = grid_height;

const color_picker_container = document.querySelector('.color-picker-container');
const color_picker = document.querySelector('.color-picker');

const colors = ['red', 'green', 'blue', 'pink', 'purple', 'yellow', 'orange', 'black', 'white'];

var selected_color = colors[0];

color_picker_container.style.backgroundColor = selected_color;

color_picker.addEventListener('change', () => {

    selected_color = color_picker.value;

    color_picker_container.style.backgroundColor = color_picker.value;

});

var grid = [];

function create_grid() { 

    for (let y = 1; y <= ((column_size - 1) * (cell_size + 1)) + 1; y += cell_size + 1) {

        for (let x = 1; x <= ((row_size - 1) * (cell_size + 1)) + 1; x += cell_size + 1) {

            grid.push({'x' : x, 'y' : y, 'width' : cell_size, 'height' : cell_size, 'color' : '#181818'});

        }

    }

}

function draw_grid() {

    context.fillStyle = '#252525';

    context.fillRect(0, 0, grid_width, grid_height);

    grid.forEach(cell => {

        context.fillStyle = cell['color'];

        context.fillRect(cell['x'], cell['y'], cell['width'], cell['height']);

    });

}

canvas.addEventListener('click', (event) => {

    const rect = canvas.getBoundingClientRect();

    const canvas_x = event.clientX - rect.left;
    const canvas_y = event.clientY - rect.top;

    grid.forEach((cell, index) => {

        if (canvas_x >= cell['x'] && canvas_x < cell['x'] + cell['width'] &&
            canvas_y >= cell['y'] && canvas_y < cell['y'] + cell['height']) {

            cell.color = selected_color;

            send_message({'message' : 'update grid', 'index' : index, 'color' : selected_color});

        }

    });

    draw_grid();

});

create_grid();

draw_grid();

connect_websocket();
