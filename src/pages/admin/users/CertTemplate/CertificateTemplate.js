import { useState } from "react";
import { exportComponentAsPNG, exportComponentAsPDF } from "react-component-export-image";
import { useRef } from "react";
import template from "../../../../assets/images/template.png"
import "./style.css";
import { AdminMainAreaWrapper } from "../../../../layouts";
import { Button, Heading } from "../../../../components";
import { Flex } from "@chakra-ui/react";
export const Certificate = ({name, title}) => {
  const certificateWrapper = useRef(null);
  return (   
    <div>
   
      <div className="App">

        <div id="downloadWrapper" ref={certificateWrapper}>
          <div id="certificateWrapper">
           <div className="title"> 
           <p>{name}</p>
            <p>{title}</p>
           </div>
            <img src={template} alt="Certificate" />
          </div>
        </div>
      </div>
        <Flex justifyContent={"flex-end"} mr={7}>
        <Button
            onClick={(e) => {
              e.preventDefault();
              exportComponentAsPNG(certificateWrapper, {
                html2CanvasOptions: { backgroundColor: null },
              });
            }}
          >
            Download
          </Button>
        </Flex>
          </div>
  );
};