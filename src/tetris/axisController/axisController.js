export { AxisController };

/**
 *
 * @param {import("../../kolibri/observable/observableMap").ObservableMapType} om
 */
const AxisController = (om) => {
  const render = () => {
    const $container = document.createElement("button");
    $container.style.position = "absolute";
    $container.style.bottom = "10px";
    $container.style.right = "10px";
    $container.style.width = "220px";
    $container.style.height = "220px";
    $container.style.zIndex = "1000"; // Ensure it's on top

    $container.innerHTML = "Go right";
    $container.onclick = () => {
      // alert(1);
      console.log("Move right");
      gameController.moveRight();
    };

    // // Create nested ring controls for X and Y axes
    // const axes = [
    //   RadialModel({
    //     axisName: "X",
    //     radius: 100,
    //     color: "red",
    //     initialValue: 0,
    //   }),
    // ];

    // axes.forEach((axisModel, index) => {
    //   RadialController(axisModel).render($container);
    // });

    document.body.appendChild($container);
  };

  render();
};
