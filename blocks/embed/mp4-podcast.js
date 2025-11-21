export const embedSoundcloudMP4 = (url) => {
  const poster = '/lab-notes/3d-biology/media_1ec63634817954fe290c9908046dff163d10fbdb5.jpg'; // Custom image
  const embedHTML = `
    <div class="sc-player simple">
      <audio id="sc-audio" preload="metadata" src="${url.href}"></audio>
      <div class="sc-thumb" tabindex="0" aria-label="Play/Pause">
        <img src="${poster}" alt="Podcast thumbnail" />
      </div>

      <div class="sc-info">
        <div style="display: flex; align-items: center;gap: 10px;">
          <button class="sc-play-btn" aria-label="Play/Pause">
            <svg class="sc-play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
            <svg class="sc-pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <div class="sc-title">Podcast Title</div>
        </div>
        <div class="sc-progress-container" aria-label="Audio progress bar">
          <div class="sc-progress">
            <div class="sc-progress-filled"></div>
          </div>
        </div>

        <div class="sc-time">
          <span class="sc-current-time">0:00</span>
          <span class="sc-duration">0:00</span>
        </div>
      </div>
    </div>
  `;

  return embedHTML;
};

export function decorateSoundcloudMP4(block) {
  const audio = block.querySelector('#sc-audio');
  const playBtn = block.querySelector('.sc-play-btn');
  const player = block.querySelector('.sc-player');
  const currentTimeEl = block.querySelector('.sc-current-time');
  const durationEl = block.querySelector('.sc-duration');
  const progressContainer = block.querySelector('.sc-progress');
  const progressFilled = block.querySelector('.sc-progress-filled');
  const thumb = block.querySelector('.sc-thumb');

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const togglePlay = () => {
    if (audio.paused) {
      audio.play();
      player.classList.add('playing');
    } else {
      audio.pause();
      player.classList.remove('playing');
    }
  };

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  thumb.addEventListener('click', togglePlay);

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  const updateProgress = (time) => {
    const pct = (time / audio.duration) * 100 || 0;
    progressFilled.style.width = `${pct}%`;
    currentTimeEl.textContent = formatTime(time);
  };

  audio.addEventListener('timeupdate', () => updateProgress(audio.currentTime));

  const seek = (event) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = event.touches ? event.touches[0].clientX : event.clientX;
    const pct = Math.min(Math.max((clickX - rect.left) / rect.width, 0), 1);
    const newTime = pct * audio.duration;
    audio.currentTime = newTime;
    updateProgress(newTime);
  };

  progressContainer.addEventListener('click', seek);
  progressContainer.addEventListener('touchstart', seek);

  // Optional: drag to seek
  let isDragging = false;
  // eslint-disable-next-line no-return-assign
  progressContainer.addEventListener('mousedown', () => (isDragging = true));
  // eslint-disable-next-line no-return-assign
  document.addEventListener('mouseup', () => (isDragging = false));
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    seek(e);
  });
}
