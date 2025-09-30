// @ts-check
import "./monkeyball.css";

export const monkeyBall = ($el) => {
  const html = /*html*/ `
    <div class="monkeyball">
      <div class="shadow"></div>
      <div class="texture"></div>
    </div>
  `;

  $el.innerHTML = html;

  const $ball = $el.querySelector(".monkeyball");
  const $texture = $el.querySelector(".texture");

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

  // Velocity tracking
  let velocityX = 0;
  let velocityY = 0;
  let lastTime = 0;

  // Animation frame for momentum
  let animationId = /** @type {number | null} */ (null);

  // Friction/damping factor (0.95 means 5% reduction per frame)
  const friction = 0.95;
  const minVelocity = 0.1; // Stop animation when velocity is very small

  const applyMomentum = () => {
    if (
      Math.abs(velocityX) < minVelocity &&
      Math.abs(velocityY) < minVelocity
    ) {
      // Stop animation when velocity is too small
      return;
    }

    // Apply the current velocity to rotation
    rotate(velocityX, velocityY);

    // Reduce velocity due to friction
    velocityX *= friction;
    velocityY *= friction;

    // Continue the animation
    animationId = requestAnimationFrame(applyMomentum);
  };

  $ball.addEventListener("mousedown", (/** @type {MouseEvent} */ e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = Date.now();

    // Cancel any existing momentum animation
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    // Reset velocity when starting a new drag
    velocityX = 0;
    velocityY = 0;
  });

  window.addEventListener("mousemove", (/** @type {MouseEvent} */ e) => {
    if (isDragging) {
      const currentTime = Date.now();
      const deltaTime = Math.max(currentTime - lastTime, 1); // Prevent division by zero

      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;

      // Calculate velocity (pixels per millisecond, scaled up for better effect)
      velocityX = (deltaX / deltaTime) * 16; // Scale by ~16ms (60fps)
      velocityY = (deltaY / deltaTime) * 16;

      rotate(deltaX, deltaY);

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = currentTime;
    }
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;

      // Start momentum animation if there's significant velocity
      if (
        Math.abs(velocityX) > minVelocity ||
        Math.abs(velocityY) > minVelocity
      ) {
        animationId = requestAnimationFrame(applyMomentum);
      }
    }
  });
};
