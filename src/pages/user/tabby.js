import { useEffect, useState } from "react";
import { Route } from "react-router-dom/cjs/react-router-dom";
const ExamplePage=(props)=>{
   const [count, increaseCount]=useState(0)
   const [onblur, setIsOnblur]=useState(false)
   
    const onFocus = () => {
        setIsOnblur(false);
      };
    
      const onBlur = () => {
        increaseCount((prev)=>prev+1);
        setIsOnblur(true);
        console.log(true);
      };
      console.log(count);
    useEffect(() => {
        window.addEventListener("load", () => {
          if (props.location.pathname.includes("/example")) {
            window.addEventListener("focus", onFocus);
            window.addEventListener("blur", onBlur);
          }
      
          return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
          };
        });
      }, []);
 return(
    <>
    hello
    </>
 )
}
export const ExampleRoute = ({ ...rest }) => {
    return (
      <Route {...rest} render={(props) => <ExamplePage {...props} />} />
    );
  };
  