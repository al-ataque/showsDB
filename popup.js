document.getElementById('getLink').addEventListener('click', function() {
    const getLinkButton = document.getElementById('getLink');
    getLinkButton.classList.add('loading');
    getLinkButton.disabled = true;
  
    // Obtener el enlace de la pestaña activa
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tab = tabs[0];
      if (tab && tab.url) {
        // Guardamos el enlace como atributo de la ventana
        document.getElementById('movieForm').dataset.link = tab.url;
        getLinkButton.textContent = "Enlace obtenido";
        getLinkButton.classList.remove('loading');
        getLinkButton.classList.add('success');
      } else {
        console.error('No se pudo obtener el enlace de la pestaña activa');
        getLinkButton.textContent = "Error obteniendo enlace";
        getLinkButton.classList.remove('loading');
      }
  
      setTimeout(() => {
        getLinkButton.textContent = "Obtener enlace"; // Restablecer el texto después de 2 segundos
        getLinkButton.disabled = false;
      }, 2000);
    });
  });
  
  document.getElementById('movieForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const rating = document.getElementById('rating').value;
    const link = document.getElementById('movieForm').dataset.link; // Usamos el enlace guardado
    
    if (name && rating && link) {
      const movie = { name, rating, link };
      
      // Guardar en el almacenamiento local usando Chrome Storage
      chrome.storage.local.get({ movies: [] }, function(result) {
        const movies = result.movies;
        movies.push(movie);
        chrome.storage.local.set({ movies }, function() {
          displayMovies();
        });
      });
      
      // Limpiar el formulario
      document.getElementById('movieForm').reset();
      delete document.getElementById('movieForm').dataset.link; // Limpiar el enlace guardado
    }
  });
  
  function displayMovies() {
    chrome.storage.local.get({ movies: [] }, function(result) {
      const movieList = document.getElementById('movieList');
      movieList.innerHTML = '';
  
      result.movies.forEach((movie, index) => {
        const li = document.createElement('li');
        const domain = (new URL(movie.link)).hostname;
        
        li.innerHTML = `
          <div class="movie-item">
            <div class="movie-info">
              <strong>${movie.name}</strong>
              <span>Nota: ${movie.rating}</span>
              <a href="${movie.link}" target="_blank">${domain}</a>
            </div>
            <button class="delete-btn" data-index="${index}">×</button>
          </div>
        `;
        
        movieList.appendChild(li);
      });
  
      // Añadir eventos de eliminación
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
          const index = this.getAttribute('data-index');
          deleteMovie(index);
        });
      });
    });
  }
  
  function deleteMovie(index) {
    chrome.storage.local.get({ movies: [] }, function(result) {
      const movies = result.movies;
      movies.splice(index, 1); // Eliminar la película por índice
      chrome.storage.local.set({ movies }, function() {
        displayMovies(); // Refrescar la lista después de eliminar
      });
    });
  }
  
  // Mostrar las películas al cargar el popup
  document.addEventListener('DOMContentLoaded', displayMovies);
  