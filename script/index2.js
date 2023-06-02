const indexedDB = window.indexedDB;
var lineWidth = 2;
const PUERTAS = [[15, 120], [200, 15], [380, 120], [200, 225]];
coordsCanvas = []; //--> Array de objetos 
var Plantas = 3;


document.addEventListener("DOMContentLoaded", main);
function main() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var img = new Image();      //Implementamos la imagen a traves de un objeto
    img.src = `img/Planta1-Enum.png`;
    img.onload = function () {    //Cargamos la imagen e insertamos nuestra imagen
        ctx.drawImage(img, 0, 0);
    }
    var select = document.getElementById("selectPuertas");
    var btnTrazado = document.getElementById("generarTrazado");
    var btnGuardar = document.getElementById("guardar");
    var btnLeer = document.getElementById("obtenerTrayectoria");

    for (let i = 0; i < select.length; i++) {
        select.options[i].value = PUERTAS[i];
    }
    var opt = new Option('--Seleccione una Puerta--', '-1');
    select.add(opt, select.options[0]);
    select.options[0].selected = true;

    btnGuardar.disabled = true;

    btnTrazado.addEventListener("click", () => {
        c.addEventListener("mousedown", ObtenerCoords);
        LimpiarCanvas();
        select.disabled = true;
        btnGuardar.disabled = false;
    });

    btnGuardar.addEventListener("click", () => {
        c.removeEventListener("mousedown", ObtenerCoords);
        //Base de Datos por indexeDB
        if (indexedDB) {
            let db;
            const request = indexedDB.open('dbPlantas', 2)

            request.onupgradeneeded = (e) => {
                db = e.target.result;
                console.log('Create', db);

                for (let i = 1; i <= Plantas; i++) {
                    if (!db.objectStoreNames.contains(`Planta ${i}`)) {
                        const objectStore = db.createObjectStore(`Planta ${i}`, { autoIncrement: true })
                        objectStore.createIndex('myidx', ['Puerta', 'Plaza']);
                    }
                }
            }

            request.onerror = (error) => {
                console.log('Error', error);
            }

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('OPEN', db);
                //console.log(coordsCanvas);
                coordsCanvas.unshift({ Px: parseInt(select.value.split(",")[0]), Py: parseInt(select.value.split(",")[1]) });
                insert(db, coordsCanvas);
            }


            function insert(db, coordenadas) {
                let plaza = parseInt(prompt("Indique el nº de Plaza"));
                let planta = parseInt(prompt("Indique la Planta asocsiada"));
                const txn = db.transaction(`Planta ${planta}`, 'readwrite');
                const store = txn.objectStore(`Planta ${planta}`);

                let query = store.put({
                    Trayectoria: coordenadas,
                    Puerta: Object.values(coordenadas.shift()),
                    Plaza: plaza,
                    Planta: planta
                });

                query.onsuccess = function (event) {
                    console.log(event);
                };
                
                query.onerror = function (event) {
                    console.log(event.target.errorCode);
                }
                
                txn.oncomplete = function () {
                    coordsCanvas.length = 0;
                    select.disabled = false;
                    db.close();
                };
            }
        }
        LimpiarCanvas();
        btnGuardar.disabled = true;
    });

    btnLeer.addEventListener("click", () => {

        //Base de Datos por indexeDB
        if (indexedDB) {
            let db;
            let request = indexedDB.open('dbPlantas', 2);

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('OPEN', db);
                //Aqui el cliente debe enseñar el Qr y la app sacara los datos importantes que son la puerta y la plaza
                let plaza = parseInt(prompt("Indique el nº de Plaza al que quieres ir"));
                obtenerTrayectoria(db, plaza, /* puerta, Planta*/);
            }

            function obtenerTrayectoria(db, plaza) {
                let txn = db.transaction(`Planta 1`);
                let store = txn.objectStore(`Planta 1`);

                let indexrequest = store.index("myidx");

                let request = indexrequest.get([PUERTAS[0], plaza]);

                request.onsuccess = function () {
                    console.log(request.result);
                    let objeto = request.result;
                    generarTrazado(ctx, objeto.Puerta, objeto.Trayectoria)
                }
            }
        }
    });
}

/**
 * 
 * @param {getContext} ctx //Contexto del canvas 
 * @param {select} puerta // Select donde estan las puertas, cada option tiene en el value las coordenadas de las puertas
 * @param {Array} coordenadas //Array de objetos de las trayectorias
 */
function generarTrazado(ctx, puerta, coordenadas) {
    LimpiarCanvas();
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(puerta[0], puerta[1]);
    for (let i = 0; i < coordenadas.length; i++) {
        ctx.lineTo(coordenadas[i].x, coordenadas[i].y)
    }
    ctx.stroke();
}


function ObtenerCoords(event) {
    var x = new Number();
    var y = new Number();
    var puerta = document.getElementById("selectPuertas").value.split(",");
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

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
    console.log(coordsCanvas);
    generarTrazado(ctx, puerta, coordsCanvas);
}

function LimpiarCanvas(){
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var img = new Image();      //Implementamos la imagen a traves de un objeto
    img.src = "img/Planta1-Enum.png";
    img.onload = function () {    //Cargamos la imagen e insertamos nuestra imagen
        ctx.drawImage(img, 0, 0);
    }
    c.width = c.width;
}