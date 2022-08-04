import '../styles/globals.css';
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { UserContext } from "../library/context";
import { useState, useEffect, useRef } from "react";
import { useUserData } from "../library/hooks";
import { motion } from "framer-motion";
import { Domain } from 'domain';

function MyApp({ Component, pageProps }) {

  const ref = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)
  const ref4 = useRef(null)

  const userData = useUserData();
  const [cursorPositon, setCursorPosition] = useState({
    x: 0,
    y: 0,
  })

  const [cursorVariant, setCursorVariant] = useState("default")

  useEffect(() => {
    let changeSize = e => {
      setCursorVariant("enter")
    }

    let changeColor = e => {
      setCursorVariant("default")
    }

    let current = ref.current;
    let current2 = ref2.current;

    current.addEventListener("mouseenter", changeSize);
    current2.addEventListener("mouseenter", changeSize);

    if (ref3.current != null) {
      let current3 = ref3.current;
      let current4 = ref4.current;
      current3.addEventListener("mouseenter", changeSize);
      current4.addEventListener("mouseenter", changeSize);
    }

    return () => {
      current.addEventListener("mouseleave", changeColor);
      current2.addEventListener("mouseleave", changeColor);

      if (ref3.current != null) {
        let current3 = ref3.current;
        let current4 = ref4.current;
        current3.addEventListener("mouseleave", changeColor);
        current4.addEventListener("mouseleave", changeColor);
      }
    }
  })

  useEffect(() => {
    let cursor = e => {
      setCursorPosition({
        x: e.clientX,
        y: e.clientY
      })
    }

    addEventListener("mousemove", cursor);
    return () => {
      removeEventListener("mousemove", cursor);
    }
  }, [])

  const variants = {
    default: {
      x: cursorPositon.x - 7.5,
      y: cursorPositon.y - 7.5,
    },
    enter : {
      x: cursorPositon.x - 25,
      y: cursorPositon.y - 25,
      width: "50px",
      height: "50px"
    }
  }

  return (
    <>
    <motion.div
        variants = {variants}
        animate = {cursorVariant}
        className = "cursor"
      />
      <UserContext.Provider value = { userData }>
        <Navbar forwardedRef = { [ref, ref2, ref3, ref4 ] } />
        <Component {...pageProps}/>
        <Toaster />
      </UserContext.Provider>
    </>
  )
}

export default MyApp
