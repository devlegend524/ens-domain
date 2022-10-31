import React from "react";
import services from "services";
class Modal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: props.open === true ? true : false
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.show && !prevProps.show) {
      this.setState({
        open: true
      });
    }
  }

  toggle() {
    if (this.state.open && this.props.onClose) {
      const result = this.props.onClose();
      if (!result) return;
    }
    this.setState(
      state => ({
        open: !state.open
      }),
      () => {
        if (this.state.open && this.props.onOpen) {
          this.props.onOpen();
        }
      }
    );
  }

  hide() {
    if (this.state.open) this.toggle();
  }

  render() {
    const open = this.state.open;
    return (
      <div
        className={`duration-150 transition-all flex items-center justify-center z-10 fixed top-0 left-0 w-full h-full ${open
          ? "pointer-events-all opacity-100"
          : "pointer-events-none opacity-0"}`}
      >
        <div
          onClick={this.toggle.bind(this)}
          className="absolute top-0 left-0 z-0 w-full h-full backdrop-blur-sm"
        />
        <div className="bg-black opacity-25 z-10 absolute top-0 left-0 w-full h-full pointer-events-none" />
        <div
          onClick={e => e.stopPropagation()}
          className=" m-4 bg-white dark:bg-gray-900 rounded max-w-screen-sm max-h-screen w-full border-gray-200 dark:border-gray-700 border p-4 shadow relative z-20 overflow-y-auto"
        >
          <div className="flex justify-between items-center gap-4 border-b border-gray-400 pb-4 mb-4">
            <img
              src={services.linking.static("images/eth.png")}
              className="w-6 h-6"
              alt="logo"
              srcSet=""
            />
            {this.props.title
              ? <div className="font-bold ">
                  {this.props.title}
                </div>
              : null}
            <div onClick={this.toggle.bind(this)} className="flex items-center">
              <img
                src={services.linking.static("images/close.png")}
                className="w-3 h-3"
                alt="close"
                srcSet=""
              />
            </div>
          </div>
          <div className="p-1">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
