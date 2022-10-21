import React from "react";

class ProgressBar extends React.PureComponent {
  render() {
    return (
      <div
        className="bg-gray-300 w-full h-2 dark:bg-gray-800 overflow-hidden"
        style={{ borderRadius: "30px" }}
      >
        <div
          className="h-full bg-alert-blue transition-all"
          style={{ borderRadius: "30px", width: this.props.progress + "%" }}
        />
      </div>
    );
  }
}

export default ProgressBar;
