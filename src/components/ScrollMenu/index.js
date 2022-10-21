import React from "react";
import { useEffect } from "react";
import $ from "jquery";
import services from "services";
import "./index.css";

const ScrollMenu = (props) => {
  let containerId = props.containerId;
  let rightButtonId = props.rightButtonId;
  let leftButtonId = props.leftButtonId;

  const leftButton = () => {
    let container = document.getElementById("" + containerId);
    let far = -container.clientWidth;
    let pos = container.scrollLeft + far;
    $("#" + containerId).animate({ scrollLeft: pos }, 1000);

    if (pos <= 0)
      document.getElementById("" + leftButtonId).style.display = "none";
    if (pos < container.scrollWidth - container.clientWidth)
      document.getElementById("" + rightButtonId).style.display =
        "inline-block";
  };
  const rightButton = () => {
    let container = document.getElementById("" + containerId);
    let far = container.clientWidth;
    let pos = container.scrollLeft + far;
    $("#" + containerId).animate({ scrollLeft: pos }, 1000);

    if (pos > 0)
      document.getElementById("" + leftButtonId).style.display = "inline-block";
    if (pos >= container.scrollWidth - container.clientWidth)
      document.getElementById("" + rightButtonId).style.display = "none";
  };
  const buttonStatus = () => {
    let container = document.getElementById("" + containerId);
    if (container != null) {
      let pos = container.scrollLeft ?? 0;

      if (pos <= 0)
        document.getElementById("" + leftButtonId).style.display = "none";
      else document.getElementById("" + leftButtonId).style.display = "display";

      if (pos > container.scrollWidth - container.clientWidth)
        document.getElementById("" + rightButtonId).style.display = "none";
      else
        document.getElementById("" + rightButtonId).style.display = "display";

      if (
        container.clientWidth >
        container.childElementCount * (parseInt(props.size) + 10)
      )
        document.getElementById("" + rightButtonId).style.display = "none";
      else
        document.getElementById("" + rightButtonId).style.display =
          "inline-block";
    }
  };
  useEffect(() => {
    buttonStatus();
  });

  window.addEventListener("resize", buttonStatus);
  return (
    <div className="">
      <div className="relative inline-block">
        <button
          id={props.leftButtonId}
          className="prev z-[30] top-[-15px]"
          onClick={leftButton}
        >
          <img
            src={services.linking.static("images/back-arrow.svg")}
            alt="back"
            srcSet=""
          />
        </button>
      </div>
      <div
        className="align-middle inline-block overflow-x-auto overflow-y-hidden w-[100%] relative whitespace-nowrap image-container"
        id={props.containerId}
      >
        {props.children}
      </div>
      <div className="relative inline-block">
        <button
          id={props.rightButtonId}
          className="next z-[30] top-[-15px] left-[-30px]"
          onClick={rightButton}
        >
          <img
            src={services.linking.static("images/right.svg")}
            alt="back"
            srcSet=""
          />
        </button>
      </div>
    </div>
  );
};
export default ScrollMenu;
