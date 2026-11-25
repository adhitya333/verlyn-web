const animation = document.querySelector('[data-service-animation]');
if (animation) {
  const button = animation.querySelector('[data-animation-pause]');
  button.addEventListener('click', () => {
    const paused = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Play animation' : 'Pause animation';
    animation.classList.toggle('is-paused', paused);
  });
  animation.classList.add('is-animated');
}
