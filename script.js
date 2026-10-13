document.addEventListener('DOMContentLoaded', () => {

  const PLAYLIST_INGLES    = "PLbR9TdG8K-Fk";
  const PLAYLIST_REGGETON  = "PLYI2XFS6O2_s";

  const btnComenzar   = document.getElementById('btnComenzar');
  const modalMusica   = document.getElementById('modalMusica');
  const btnSinMusica  = document.getElementById('btnSinMusica');
  const btnsPlaylist  = document.querySelectorAll('.btn-playlist');

  const playerUI        = document.getElementById('playerUI');
  const playerCancion   = document.getElementById('playerCancion');
  const playerPlaylist  = document.getElementById('playerPlaylist');
  const btnPlayPause    = document.getElementById('btnPlayPause');
  const btnPrev         = document.getElementById('btnPrev');
  const btnNext         = document.getElementById('btnNext');
  const btnMute         = document.getElementById('btnMute');

  const barraProgreso        = document.getElementById('barraProgreso');
  const barraProgresoRelleno = document.getElementById('barraProgresoRelleno');
  const tiempoActualEl       = document.getElementById('tiempoActual');
  const tiempoTotalEl        = document.getElementById('tiempoTotal');
  const barraVolumen         = document.getElementById('barraVolumen');
  const barraVolumenRelleno  = document.getElementById('barraVolumenRelleno');

  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxCerrar  = document.getElementById('lightboxCerrar');

  let player = null;
  let playerListo = false;
  let playlistPendiente = null;
  let playlistActual = null;
  let pausado = false;
  let muteado = false;

  window.onYouTubeIframeAPIReady = function() {
    crearPlayer();
  };

  function crearPlayer(idPlaylistInicial) {
    if (player && typeof player.destroy === 'function') {
      try { player.destroy(); } catch(e) {}
    }

    const contenedor = document.getElementById('reproductorYoutube');
    contenedor.innerHTML = '';
    const nuevoDiv = document.createElement('div');
    nuevoDiv.id = 'ytPlayerInterno';
    contenedor.appendChild(nuevoDiv);

    playerListo = false;

    const opciones = {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 1,
        loop: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: (event) => {
          playerListo = true;
          event.target.setVolume(70);
          if (idPlaylistInicial) {
            event.target.loadPlaylist({
              list: idPlaylistInicial,
              listType: 'playlist',
              index: 0
            });
            event.target.playVideo();
          } else if (playlistPendiente) {
            reproducirPlaylist(playlistPendiente);
            playlistPendiente = null;
          }
        },
        onStateChange: (event) => {
          if (event.data === 1) {
            pausado = false;
            playerUI.classList.remove('pausado');
            btnPlayPause.textContent = '⏸';
            actualizarCancion();
          } else if (event.data === 2) {
            pausado = true;
            playerUI.classList.add('pausado');
            btnPlayPause.textContent = '▶';
          }
        }
      }
    };

    if (idPlaylistInicial) {
      opciones.playerVars.list = idPlaylistInicial;
      opciones.playerVars.listType = 'playlist';
    }

    player = new YT.Player('ytPlayerInterno', opciones);
  }

  function actualizarCancion() {
    if (!player || typeof player.getVideoData !== 'function') return;
    const data = player.getVideoData();
    if (data && data.title) {
      playerCancion.textContent = data.title;
    }
  }

  setInterval(actualizarCancion, 3000);

  function formatearTiempo(seg) {
    if (!seg || seg < 0) return '0:00';
    const min = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return min + ':' + (s < 10 ? '0' : '') + s;
  }

  function actualizarProgreso() {
    if (!player || typeof player.getCurrentTime !== 'function') return;
    const actual = player.getCurrentTime();
    const total  = player.getDuration();
    if (total > 0) {
      const porcentaje = (actual / total) * 100;
      barraProgresoRelleno.style.width = porcentaje + '%';
      tiempoActualEl.textContent = formatearTiempo(actual);
      tiempoTotalEl.textContent  = formatearTiempo(total);
    }
  }

  setInterval(actualizarProgreso, 500);

  barraProgreso.addEventListener('click', (e) => {
    if (!player || typeof player.seekTo !== 'function') return;
    const rect = barraProgreso.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const porcentaje = clickX / rect.width;
    const total = player.getDuration();
    if (total > 0) {
      player.seekTo(porcentaje * total, true);
    }
  });

  barraVolumen.addEventListener('click', (e) => {
    if (!player || typeof player.setVolume !== 'function') return;
    const rect = barraVolumen.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const porcentaje = Math.max(0, Math.min(1, clickX / rect.width));
    player.setVolume(porcentaje * 100);
    barraVolumenRelleno.style.width = (porcentaje * 100) + '%';
  });

  btnComenzar.addEventListener('click', () => {
    modalMusica.classList.add('activo');
  });

  btnsPlaylist.forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.playlist;
      reproducirPlaylist(tipo);
      modalMusica.classList.remove('activo');
      playerUI.style.display = 'flex';
      setTimeout(() => {
        document.getElementById('carta').scrollIntoView({ behavior: 'smooth' });
      }, 300);
    });
  });

  btnSinMusica.addEventListener('click', () => {
    modalMusica.classList.remove('activo');
    setTimeout(() => {
      document.getElementById('carta').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });

  function reproducirPlaylist(tipo) {
    playerPlaylist.textContent = tipo === 'ingles' ? 'Música en Inglés' : 'Reggaetón';
    playlistActual = tipo;
    pausado = false;
    muteado = false;
    btnMute.textContent = '🔊';

    const idPlaylist = tipo === 'ingles' ? PLAYLIST_INGLES : PLAYLIST_REGGETON;

    if (!playerListo || !player) {
      playlistPendiente = tipo;
      return;
    }

    crearPlayer(idPlaylist);
  }

  btnPlayPause.addEventListener('click', () => {
    if (!player) return;
    if (pausado) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  });

  btnNext.addEventListener('click', () => {
    if (!player) return;
    player.nextVideo();
    setTimeout(actualizarCancion, 800);
  });

  btnPrev.addEventListener('click', () => {
    if (!player) return;
    player.previousVideo();
    setTimeout(actualizarCancion, 800);
  });

  btnMute.addEventListener('click', () => {
    if (!player) return;
    if (muteado) {
      player.unMute();
      muteado = false;
      btnMute.textContent = '🔊';
      barraVolumenRelleno.style.width = '70%';
    } else {
      player.mute();
      muteado = true;
      btnMute.textContent = '🔇';
      barraVolumenRelleno.style.width = '0%';
    }
  });

  document.addEventListener('keydown', (e) => {
    const secciones = document.querySelectorAll('.seccion');
    const scrollActual = window.scrollY;
    const altoVentana = window.innerHeight;
    const indiceActual = Math.round(scrollActual / altoVentana);

    if (e.key === 'Escape' && lightbox.classList.contains('activo')) {
      cerrarLightbox();
      return;
    }

    if (e.key === 'ArrowDown' && indiceActual < secciones.length - 1) {
      secciones[indiceActual + 1].scrollIntoView({ behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' && indiceActual > 0) {
      secciones[indiceActual - 1].scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.querySelectorAll('.foto-galeria img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxImg.src = img.src;
      lightbox.classList.add('activo');
    });
  });

  function cerrarLightbox() {
    lightbox.classList.remove('activo');
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }

  lightboxCerrar.addEventListener('click', (e) => {
    e.stopPropagation();
    cerrarLightbox();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      cerrarLightbox();
    }
  });

});