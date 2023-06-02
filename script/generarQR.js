const PLANTA = 1;
const PUERTA = 1;
const PLAZA = 10;

//Añadir en el value link de descarga del qr que se escanea

document.addEventListener('DOMContentLoaded', () => {
  const imagen = document.createElement("img")
  const canvas = document.querySelector("#mycanvas");
  var ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });
  
  boton = document.querySelector("#btnDescargar");
  
  const camCanvas = document.querySelector("#cam-canvas");
  const qrDataContainer = document.querySelector("#qr-data");
  var botonscan = document.querySelector("#btnscan");

  const qrReader = new QRReader(camCanvas, qrDataContainer);

  new QRious({
    element: imagen,
    value: "Planta " + PLANTA + " Plaza " + PLAZA + " Puerta " + PUERTA, // La URL o el texto
    size: 350,
    backgroundAlpha: "#ffffff", // 0 para fondo transparente
    foreground: "#000000", // Color del QR
    level: "H", // Puede ser L,M,Q y H (L es el de menor nivel, H el mayor)
  });

  imagen.onload = function () {    //Cargamos la imagen e insertamos nuestra imagen
    ctx.drawImage(imagen, 0, 0);
    /* Para obtener el dato en formato texo del QR
    Obtenemos la imgen que esta en el canvas y se la pasamos a la funcion jsQR */
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(
      frameData.data,
      frameData.width,
      frameData.height,
    )
    if (code) {
      console.log(code.data);
    }
  }

  boton.onclick = () => {
    const enlace = document.createElement("a");
    enlace.href = imagen.src;
    enlace.download = `CódigoQr de la Plaza ${PLAZA}.png`;
    enlace.click();
  }

  botonscan.onclick = async () => {
    qrReader.toggleCamera();
    if (qrReader.getIsCamOpen()) {
      botonscan.innerHTML = "Parar cámara";
      return;
    }
    botonscan.innerHTML = "Iniciar cámara";
  }
});

/* document.querySelector("#cargar2").addEventListener("click", async () => {

  try {
    // showOpenFilePicker nos devuelve un array			
    const referencias = await window.showOpenFilePicker({
      types: [
        { description: 'Imágenes', accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg'] } },
      ],
      excludeAcceptAllOption: true, // no permitir la opcion de "cualquier tipo de archivo" ?
      multiple: false // permitir elegir varios archivos ?
    });

    // por cada archivo...
    referencias.forEach(async (refer) => {
      // a partir de la referencia, obtenemos el archivo
      var archivo = await refer.getFile();

      // creamos un elemento imagen usando dicho archivo
      var img = document.createElement("img");
      img.src = URL.createObjectURL(archivo);
      img.alt = archivo.name;

      // añadimos dicho elemento imagen a la página
      document.body.append(img);
    });
  } catch (err) {
    console.log("Se ha producido un error o se ha cancelado la carga. " + err);
  }
}); */



