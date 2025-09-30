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

  // Helper functions to get coordinates from mouse or touch events
  const getClientX = (/** @type {MouseEvent | TouchEvent} */ e) => {
    return e.type.startsWith('touch') ? 
      (/** @type {TouchEvent} */ (e)).touches[0]?.clientX || (/** @type {TouchEvent} */ (e)).changedTouches[0]?.clientX :
      (/** @type {MouseEvent} */ (e)).clientX;
  };

  const getClientY = (/** @type {MouseEvent | TouchEvent} */ e) => {
    return e.type.startsWith('touch') ? 
      (/** @type {TouchEvent} */ (e)).touches[0]?.clientY || (/** @type {TouchEvent} */ (e)).changedTouches[0]?.clientY :
      (/** @type {MouseEvent} */ (e)).clientY;
  };

  // Generic start drag function
  const startDrag = (/** @type {MouseEvent | TouchEvent} */ e) => {
    isDragging = true;
    lastX = getClientX(e);
    lastY = getClientY(e);
    lastTime = Date.now();

    // Cancel any existing momentum animation
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    // Reset velocity when starting a new drag
    velocityX = 0;
    velocityY = 0;
    
    // Prevent default behavior for touch events
    if (e.type.startsWith('touch')) {
      e.preventDefault();
    }
  };

  // Generic drag function
  const handleDrag = (/** @type {MouseEvent | TouchEvent} */ e) => {
    if (isDragging) {
      const currentTime = Date.now();
      const deltaTime = Math.max(currentTime - lastTime, 1); // Prevent division by zero

      const currentX = getClientX(e);
      const currentY = getClientY(e);
      const deltaX = currentX - lastX;
      const deltaY = currentY - lastY;

      // Calculate velocity (pixels per millisecond, scaled up for better effect)
      velocityX = (deltaX / deltaTime) * 16; // Scale by ~16ms (60fps)
      velocityY = (deltaY / deltaTime) * 16;

      rotate(deltaX, deltaY);

      lastX = currentX;
      lastY = currentY;
      lastTime = currentTime;
      
      // Prevent default behavior for touch events to avoid scrolling
      if (e.type.startsWith('touch')) {
        e.preventDefault();
      }
    }
  };

  // Generic end drag function
  const endDrag = () => {
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
  };

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

  // Mouse event listeners
  $ball.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", handleDrag);
  window.addEventListener("mouseup", endDrag);

  // Touch event listeners for mobile compatibility
  $ball.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("touchmove", handleDrag, { passive: false });
  window.addEventListener("touchend", endDrag);
  window.addEventListener("touchcancel", endDrag); // Handle touch cancellation
};
