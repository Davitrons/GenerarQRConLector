var lineWidth = 2;
const PUERTAS = [[15, 120], [200, 15], [380, 120], [200, 225]]
var coordsCanvas = [];

const indexedDB = window.indexedDB

//Base de Datos por indexeDB
/* if (indexedDB) {
    let db;
    const request = indexedDB.open('dbPlantas', 4)

    request.onsuccess = () => {
        db = request.result;
        console.log('OPEN', db);
        addDatos(coordsCanvas);
    }

    request.onupgradeneeded = (e) => {
        db = e.target.result;
        console.log('Create', db)
        const objectStore = db.createObjectStore('plantas', {autoIncrement: true})
    }

    request.onerror = (error) => {
        console.log('Error', error);
    }

    const addDatos = (data) => {
        const transaction = db.transaction(['plantas'], 'readwrite');
        const objectStore = transaction.objectStore('plantas');
        const request = objectStore.add(data);
    }
} */

document.addEventListener("DOMContentLoaded", main);
function main() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var img = new Image();      //Implementamos la imagen a traves de un objeto
    img.src = "img/Planta1-Enum.png";
    img.onload = function () {    //Cargamos la imagen e insertamos nuestra imagen
        ctx.drawImage(img, 0, 0);
    }

    c.addEventListener("mousedown", ObtenerCoords, false);  //Evento para cargar las coordenadas del canvas 

}

function generarTrazado(ctx) {
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(PUERTAS[0][0], PUERTAS[0][1]);
    ctx.lineTo(coordsCanvas[0].x, coordsCanvas[0].y);
    ctx.lineTo(coordsCanvas[1].x, coordsCanvas[1].y);
    ctx.stroke();

    coordsCanvas = [];
}

function ObtenerCoords(event) {
    var x = new Number();
    var y = new Number();
    var canvas = document.getElementById("myCanvas");

    if (event.x != undefined && event.y != undefined) {
        x = event.x;
        y = event.y;
    } else {// Firefox ya que al amplicar la pantalla no funcionaria
        x = event.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    coordsCanvas.push({ x: x, y: y });

    //alert("x: " + x + "  y: " + y);
    if (coordsCanvas.length <= 1) {
        console.log(coordsCanvas);

    } else {
        event.target.removeEventListener("mousedown", ObtenerCoords);
        let ctx = event.target.getContext("2d");
        generarTrazado(ctx);
    }
}