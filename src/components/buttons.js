import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";

import components from "components";

function CustomButton(props) {
  let navigator = useNavigate();

  const onClick = e => {
    e.preventDefault();
    if (props.disabled) return;
    if (props.loading) return;
    if (props.onClick) props.onClick(navigator);
  };

  return (
    <div className="w-full m-auto">
      <Button
        variant={props.variant ? props.variant : "filled"}
        color={props.color ? props.color : "blue-gray"}
        ripple={true}
        fullWidth={props.fullWidth ? props.fullWidth : true}
        onClick={onClick}
      >
        {props.loading
          ? <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <components.Spinner className="w-6" />
            </div>
          : null}
        <span className={props.loading ? "invisible" : ""}>
          {props.text}
        </span>
      </Button>
    </div>
  );
}

function Transparent(props) {
  let navigator = useNavigate();

  const onClick = e => {
    e.preventDefault();
    if (props.onClick) props.onClick(navigator);
  };

  return (
    <div onClick={onClick}>
      {props.children}
    </div>
  );
}

const exports = {
  CustomButton,
  Transparent
};

export default exports;
