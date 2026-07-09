document.addEventListener('DOMContentLoaded', () => {
  const count = 10;
  const overlay = document.getElementById('dog-overlay');
  if (!overlay) return;

  const bases = [];
  for (let i = 1; i <= count; i++) {
    bases.push(`/static/todo/dogs/dog${i}`); // existing static location
  }
  // Also try Japanese-named files placed at PROJECT_ROOT/犬 (served under /static/)
  for (let i = 1; i <= count; i++) {
    bases.push(`/static/犬${i}`);
  }

  const exts = ['.jpg', '.png', '.svg', '.jpeg'];

  const viewportWidth = () => Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const viewportHeight = () => Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  function tryLoadWithExts(base, cb) {
    let i = 0;
    function next() {
      if (i >= exts.length) return cb(null);
      const url = base + exts[i++];
      const img = new Image();
      img.onload = () => cb(url);
      img.onerror = () => next();
      img.src = url;
    }
    next();
  }

  function addDog(src) {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'dog-item';
    img.style.position = 'absolute';
    img.style.pointerEvents = 'none';
    img.style.width = '90px';
    img.style.height = 'auto';
    img.style.setProperty('--rot', `${Math.floor(Math.random() * 21 - 10)}deg`);

    const vw = viewportWidth();
    const vh = viewportHeight();
    const w = 90;
    const h = 90; // approximate
    const x = Math.floor(Math.random() * Math.max(1, vw - w));
    const y = Math.floor(Math.random() * Math.max(1, vh - h));
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    overlay.appendChild(img);
  }

  function scatter() {
    overlay.innerHTML = '';
    const numToPlace = 12;
    let placed = 0;
    const tries = [];

    for (let i = 0; i < numToPlace; i++) {
      const base = bases[Math.floor(Math.random() * bases.length)];
      tries.push(new Promise((res) => {
        tryLoadWithExts(base, (url) => {
          if (url) addDog(url);
          res();
        });
      }));
    }

    // ensure all attempts complete (not strictly necessary)
    Promise.all(tries).then(() => { /* done */ });
  }

  scatter();
  window.addEventListener('resize', () => {
    clearTimeout(window._dogScatterTimeout);
    window._dogScatterTimeout = setTimeout(scatter, 250);
  });
});