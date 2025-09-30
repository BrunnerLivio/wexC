// @ts-check
import './monkeyball.css';

export const monkeyBall = ($el) => {

  const html = /*html*/ `
    <div class="monkeyball">
      <div class="shadow"></div>
      <div class="texture"></div>
    </div>
  `;

  $el.innerHTML = html;

  const $ball = $el.querySelector('.monkeyball');
  const $texture = $el.querySelector('.texture');

  // Change the background position of the texture to simulate rotation
  let posX = 0;
  let posY = 0;

  const rotate = (deltaX, deltaY) => {
    posX += deltaX;
    posY += deltaY;
    $texture.style.backgroundPosition = `${posX}px ${posY}px`;
  };

  // Example interaction: Rotate the ball when clicked and dragged
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  $ball.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      rotate(deltaX, deltaY);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });


}