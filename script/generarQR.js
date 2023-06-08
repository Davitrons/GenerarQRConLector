//Ver proyecto anterior para poder crear Qr con la libreria qrius a partir del texto escaneao de la camara

document.addEventListener('DOMContentLoaded', () => {
  const imagen = document.createElement("img")
  const canvas = document.querySelector("#mycanvas");
  var ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  boton = document.querySelector("#btnDescargar");

  const camCanvas = document.querySelector("#cam-canvas");
  var botonscan = document.querySelector("#btnscan");

  const qrDataContainer = document.querySelector("#qr-data");
  const qrReader = new QRReader(camCanvas, qrDataContainer);

  botonscan.onclick = async () => {
    qrReader.toggleCamera();

    new QRious({
      element: imagen,
      value: qrDataContainer.innerHTML, // La URL o el texto
      size: 350,
      backgroundAlpha: "#ffffff", // 0 para fondo transparente
      foreground: "#000000", // Color del QR
      level: "H", // Puede ser L,M,Q y H (L es el de menor nivel, H el mayor)
    });
  
    imagen.onload = function () {    //Cargamos la imagen e insertamos nuestra imagen
      ctx.drawImage(imagen, 0, 0);
    }

    botonscan.innerHTML = "Escanear Código";
    
    if (qrReader.getIsCamOpen()) {
      botonscan.innerHTML = "Parar cámara";
      return;
    }
  }

  boton.onclick = () => {
    const enlace = document.createElement("a");
    enlace.href = imagen.src;
    enlace.download = `CódigoQr de la Plaza`;
    enlace.click();
  }

});
