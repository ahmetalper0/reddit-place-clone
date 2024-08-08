const cell_size = 10;
const row_size = 300;
const column_size = 300;

const grid_width = (row_size * cell_size) + (row_size + 1);
const grid_height = (column_size * cell_size) + (column_size + 1);

const canvas = document.querySelector('.grid');
const context = canvas.getContext('2d');

canvas.width = grid_width;
canvas.height = grid_height;

const color_picker = document.querySelector('.color-picker');
const color_picker_input = document.querySelector('.color-picker-input');
const eraser = document.querySelector('.eraser');

const colors = ["#ff0000", "#008000", "#0000ff", "#ffc0cb", "#800080", "#ffff00", "#ffa500", "#000000", "#ffffff"];

var selected_color = colors[0];

color_picker.style.backgroundColor = selected_color;

color_picker_input.addEventListener('change', () => {

    selected_color = color_picker_input.value;

    color_picker.style.backgroundColor = color_picker_input.value;

});

eraser.addEventListener('click', () => {

    selected_color = '#181818';

    color_picker.style.backgroundColor = '#181818';

});

var grid = [];

function create_grid() { 

    for (let y = 1; y <= ((column_size - 1) * (cell_size + 1)) + 1; y += cell_size + 1) {

        for (let x = 1; x <= ((row_size - 1) * (cell_size + 1)) + 1; x += cell_size + 1) {

            grid.push({'x' : x, 'y' : y, 'width' : cell_size, 'height' : cell_size, 'color' : '#181818'});

        }

    }

}

function update_grid() {

    fetch('https://ahmetalper-reddit-place-clone.hf.space/colors')

        .then(response => response.json())

		.then(data => {

			grid.forEach((cell, index) => {

				cell['color'] = data[index]
				
			});

			draw_grid();

			console.log(`${new Date().toLocaleString()} | Grid has been updated successfully.`);

		})

		.catch(error => {

			console.error(`${new Date().toLocaleString()} | error : ${error}`);

		});

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

			fetch(`https://ahmetalper-reddit-place-clone.hf.space/update/${index}/${selected_color.substring(1)}`)

				.then(response => response.json())

				.then(data => {

					console.log(`${new Date().toLocaleString()} | cell ${index} | ${selected_color} | ${data['status']}`);

				})

				.catch(error => {

					console.error(`${new Date().toLocaleString()} | error : ${error}`);

				});

        }

    });

    draw_grid();

});

create_grid();

draw_grid();

update_grid();

setInterval(update_grid, 10000);
