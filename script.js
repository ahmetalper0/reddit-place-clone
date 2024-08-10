var websocket_url = 'https://ahmetalper-reddit-place-clone.hf.space'
var websocket_reconnect_timeout = 5
var websocket;

const cell_size = 10;
const row_size = 300;
const column_size = 300;

const grid_width = (row_size * cell_size) + (row_size + 1);
const grid_height = (column_size * cell_size) + (column_size + 1);

const canvas = document.querySelector('.grid');
const context = canvas.getContext('2d');

var grid = [];

canvas.width = grid_width;
canvas.height = grid_height;

function draw_grid() {

    for (let y = 1; y <= ((column_size - 1) * (cell_size + 1)) + 1; y += cell_size + 1) {

        for (let x = 1; x <= ((row_size - 1) * (cell_size + 1)) + 1; x += cell_size + 1) {

            grid.push({'x' : x, 'y' : y, 'width' : cell_size, 'height' : cell_size, 'color' : '#181818'});

        }

    }

    context.fillStyle = '#252525';

    context.fillRect(0, 0, grid_width, grid_height);

    grid.forEach(cell => {

        context.fillStyle = cell['color'];

        context.fillRect(cell['x'], cell['y'], cell['width'], cell['height']);

    });

}

function update_grid(index, color) {

    cell = grid[index];

    cell['color'] = color;

    context.fillStyle = color;

    context.fillRect(cell['x'], cell['y'], cell['width'], cell['height']);

}

canvas.addEventListener('click', (event) => {

    const rect = canvas.getBoundingClientRect();

    const canvas_x = event.clientX - rect.left;
    const canvas_y = event.clientY - rect.top;

    grid.forEach((cell, index) => {

        if (canvas_x >= cell['x'] && canvas_x < cell['x'] + cell['width'] &&
            canvas_y >= cell['y'] && canvas_y < cell['y'] + cell['height']) {

            update_grid(index, selected_color);

            send_message({'message' : 'update color', 'index' : index, 'color' : selected_color});

        }

    });

});

const color_picker = document.querySelector('.color-picker');
const color_picker_input = document.querySelector('.color-picker-input');
const eraser = document.querySelector('.eraser');

var selected_color = '#ff0000';

color_picker.style.backgroundColor = selected_color;

color_picker_input.addEventListener('change', () => {

    selected_color = color_picker_input.value;

    color_picker.style.backgroundColor = color_picker_input.value;

});

eraser.addEventListener('click', () => {

    selected_color = '#181818';

    color_picker.style.backgroundColor = '#181818';

});

function connect_websocket() {

    websocket = new WebSocket(websocket_url);

    websocket.onopen = function() {

        console.log('Connected to WebSocket server');

        send_message({'message' : 'fetch colors'});

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

            if (data['message'] == 'fetch colors') {

                grid_colors = data['colors'];

                grid_colors.forEach(color => {

                    update_grid(color[0], color[1]);
                    
                });

            }

            if (data['message'] == 'update color') {

                grid_colors = data['colors'];

                grid_colors.forEach(color => {

                    update_grid(color[0], color[1]);
                    
                });

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

draw_grid();

connect_websocket();
