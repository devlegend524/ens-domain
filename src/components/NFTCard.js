import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadImage, parseFont } from "canvas";
import services from "services";
const customFonts = {
  postTitle: {
    file: "kefa-regular.ttf",
    name: "Kefa",
  },
  siteName: {
    file: "menlo-regular.ttf",
    name: "Menlo",
  },
};
const fonts = {
  postTitlexl: "bold 40px Franklin Gothic Medium",
  postTitlelg: "bold 35px Franklin Gothic Medium",
  postTitlemd: "bold 30px Franklin Gothic Medium",
  postTitlesm: "bold 25px Franklin Gothic Medium",
  site: "bold 15pt Franklin Gothic Medium",
};

export default function NFTCard({ name, isLinked, classes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef) {
      const imageCanvas = canvasRef.current;
      // Register custom fonts
      Object.keys(customFonts).forEach((font) => {
        parseFont(
          `${services.linking.static("fonts")}/${customFonts[font].file}`,
          {
            family: customFonts[font].name,
          }
        );
      });

      const names = name.split(".");
      let actualName = "";
      for (let i = 0; i < names.length - 1; i += 1) {
        actualName += names[i];
        if (i < names.length - 2) actualName += ".";
      }

      const ctx = imageCanvas.getContext("2d");
      loadImage(services.linking.static("images/nft_bg.png")).then(
        async (data) => {
          ctx.drawImage(data, 0, 0);
          ctx.fillStyle = "rgba(30, 144, 255, 0.1)";
          ctx.fillRect(0, 0, 300, 300);
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          console.log("length of name: ", actualName.length);
          if (actualName.length < 10) {
            ctx.font = fonts.postTitlexl;
          } else if (actualName.length >= 10 && actualName.length < 15) {
            ctx.font = fonts.postTitlemd;
          } else if (actualName.length >= 15 && actualName.length < 20) {
            ctx.font = fonts.postTitlesm;
          } else {
            ctx.font = fonts.site;
          }
          let drawX = 150;
          let drawY = 200;
          let maxWidth = 280;
          ctx.fillText(actualName, drawX, drawY, maxWidth);
        }
      );
    }
  }, [canvasRef]);

  return (
    <>
      {isLinked ? (
        <Link
          className={`inline-block ${classes ? classes : ""} `}
          to={`/domains/${name}`}
        >
          <canvas id="myCanvas" width="300" height="300" ref={canvasRef}  className="rounded-lg">
            Your browser does not support the HTML canvas tag.
          </canvas>
        </Link>
      ) : (
        <div className="inline-block animated_border">
          <canvas id="myCanvas" width="300" height="300" ref={canvasRef} className="rounded-lg">
            Your browser does not support the HTML canvas tag.
          </canvas>
        </div>
      )}
    </>
  );
}
