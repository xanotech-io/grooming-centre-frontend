import { useRef, useState } from "react";

import "./style.css";
import { Button, Text } from "../../../../../components";
import { Box, Flex } from "@chakra-ui/react";

import { exportAsImage } from "../../../../../utils/exportToPng";
import { exportAsPdf } from "../../../../../utils/exportToPdf";
import template from "../../../../../assets/images/Certificate.png"

export const Certificate = ({ name, title }) => {
  const certificateWrapper = useRef(null);
  const [drop, setDrop] = useState(false);
  return (
    <div>
      <div className="">
        <div
          id="cert"
          ref={certificateWrapper}
          style={{
            position: "relative",
            width: "842px", // A4 width in pixels at 96 DPI
            height: "595px", // A4 height in pixels at 96 DPI
            backgroundImage: `url(${template})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Name field positioned over the certificate blank line */}
          <div
            style={{
              position: "absolute",
              top: "250px", // Adjusted for the new template
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "32px",
              fontFamily: "serif",
              color: "#333",
              textAlign: "center",
              fontWeight: "bold",
              letterSpacing: "2px",
              maxWidth: "500px",
            }}
          >
            {name}
          </div>
            {/* title field positioned over the certificate blank line */}
          <div
                style={{
                    position: "absolute",
                    top: "311px", // Adjusted for the new template
                    left: "58%",
                    transform: "translateX(-50%)",
                    fontSize: "13px",
                    fontFamily: "serif",
                    color: "#333",
                    textAlign: "left",
                    fontWeight: "bold",
                    letterSpacing: "0px",
                    maxWidth: "230px",
                    lineClamp: 1
                }}
            >
                {title}
          </div>
        </div>
      </div>

      <Flex justifyContent={"flex-end"} mt={6} pos={"relative"}>
        {drop ? (
          <Box
            backgroundColor={"#fff"}
            pos={"absolute"}
            top={"45px"}
            right={"0"}
            w="120px"
            minH="50px"
            shadow={"2xl"}
            rounded={"md"}
            border={"1px solid gray"}
            zIndex={"100"}
            p={3}
            cursor={"pointer"}
          >
            <Text
              mt={2}
              fontSize={"16px"}
              onClick={() => {
                setDrop(false);
                exportAsImage(
                  certificateWrapper.current,
                  `${title} certificate for ${name}`
                );
              }}
            >
              PNG
            </Text>
            <Text
              mt={2}
              onClick={() => {
                setDrop(false);
                exportAsPdf(
                  certificateWrapper.current,
                  `${title} certificate for ${name}`
                );
              }}
            >
              PDF
            </Text>
          </Box>
        ) : null}
        <Button
          onClick={() => {
            setDrop(!drop);
          }}
        >
          Export
        </Button>
      </Flex>
    </div>
  );
};
