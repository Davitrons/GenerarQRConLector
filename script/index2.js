const indexedDB = window.indexedDB;
var lineWidth = 2; //Grosor del trazado del canvas del aparcamiento
const PUERTAS = [[15, 120], [200, 15], [380, 120], [200, 225]]; //Coordenadas respecto al canvas sobre las posiciones de las puertas
coordsCanvas = []; //--> Array de objetos 
var Plantas = 3;
var dibujado = "#007ab9"
var solucion = "#00ff37"

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

    var camCanvas = document.querySelector("#cam-canvas");
    var btnLeer = document.getElementById("obtenerTrayectoria");

    var btnLimpiar = document.getElementById("limpiar");

    for (let i = 0; i < select.length; i++) {
        select.options[i].value = PUERTAS[i];
    }

    var opt = new Option('--Seleccione una Puerta--', '-1');
    select.add(opt, select.options[0]);
    select.options[0].selected = true;

    btnGuardar.disabled = true;
    btnLimpiar.disabled = true;

    btnLimpiar.addEventListener("click", () => {
        coordsCanvas.length = 0;
        LimpiarCanvas();
    });

    btnTrazado.addEventListener("click", () => {
        if (select.value == -1) {
            alert("Seleccione primero una puerta");
            return;
        }
        c.addEventListener("mousedown", ObtenerCoords);
        LimpiarCanvas();
        select.disabled = true;
        btnGuardar.disabled = false;
        btnLeer.disabled = true;
        btnTrazado.disabled = true;
        btnLimpiar.disabled = false;
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
                if (coordsCanvas.length == 0) {
                    select.disabled = false;
                    btnLeer.disabled = false;
                    btnLimpiar.disabled = true;
                    error = "No existen cordenadas al intentar guardar"
                    return alert(error)
                }
                db = event.target.result;
                console.log('OPEN', db);
                //console.log(coordsCanvas);
                coordsCanvas.unshift({ Px: parseInt(select.value.split(",")[0]), Py: parseInt(select.value.split(",")[1]) });
                insert(db, coordsCanvas);
            }

            //Revisar errores
            function insert(db, coordenadas) {
                let plaza = parseInt(prompt("Indique el nº de Plaza"));
                let planta = parseInt(prompt("Indique la Planta asocsiada"));
                if (!isNaN(plaza) && !isNaN(planta)) {
                    if (planta > Plantas) {
                        coordsCanvas.length = 0;
                        select.disabled = false;
                        btnLeer.disabled = false;
                        btnLimpiar.disabled = true;
                        alert("Esta planta no existe en el parking");
                    }
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
                        coordsCanvas.length = 0;
                    }

                    txn.oncomplete = function () {
                        coordsCanvas.length = 0;
                        select.disabled = false;
                        btnLeer.disabled = false;
                        btnLimpiar.disabled = true;
                        db.close();
                    };

                } else {
                    coordsCanvas.length = 0;
                    select.disabled = false;
                    btnLeer.disabled = false;
                    btnLimpiar.disabled = true;
                    error = "Se ha producido un error";
                    alert(error);
                }
            }
        }
        LimpiarCanvas();
        btnGuardar.disabled = true;
        btnTrazado.disabled = false;
    });

    const qrDataContainer = document.querySelector("#qr-data");
    const qrReader = new QRReader(camCanvas, qrDataContainer);

    btnLeer.addEventListener("click", async () => {

        LimpiarCanvas();
        qrReader.toggleCamera();

        if (qrReader.getIsCamOpen()) {
            btnLeer.innerHTML = "Parar cámara";
            return;
        }
        btnLeer.innerHTML = "Obtener Trayectoria";

        //Base de Datos por indexeDB
        if (indexedDB) {
            let db;
            let request = indexedDB.open('dbPlantas', 2);

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('OPEN', db);
                let dato = qrDataContainer.innerHTML.split(" ");
                console.log(dato)
                if (dato.length == 1) {
                    alert("No se ha escaneado ningún código QR")
                } else {
                    obtenerTrayectoria(db, parseInt(dato[1]), parseInt(dato[3]), parseInt(dato[5]));
                }
            }

            function obtenerTrayectoria(db, Planta, plaza, puerta) {
                let txn = db.transaction(`Planta ${Planta}`);
                let store = txn.objectStore(`Planta ${Planta}`);

                let indexrequest = store.index("myidx");

                let request = indexrequest.get([PUERTAS[puerta], plaza]);

                request.onsuccess = function () {
                    console.log(request.result);
                    let objeto = request.result;
                    generarTrazado(ctx, objeto.Puerta, objeto.Trayectoria, solucion);
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
function generarTrazado(ctx, puerta, coordenadas, color) {
    LimpiarCanvas();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
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
    generarTrazado(ctx, puerta, coordsCanvas, dibujado);
}

function LimpiarCanvas() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var img = new Image();      //Implementamos la imagen a traves de un objeto
    img.src = "img/Planta1-Enum.png";
    img.onload = function () {    //Cargamos la imagen e insertamos nuestra imagen
        ctx.drawImage(img, 0, 0);
    }
    c.width = c.width;
}