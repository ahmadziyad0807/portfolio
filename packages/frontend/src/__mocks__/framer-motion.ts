// Mock for framer-motion to avoid test issues
import React from 'react';

const motion = {
  div: React.forwardRef<HTMLDivElement, any>((props, ref) => 
    React.createElement('div', { ...props, ref })
  ),
  img: React.forwardRef<HTMLImageElement, any>((props, ref) => 
    React.createElement('img', { ...props, ref })
  ),
  span: React.forwardRef<HTMLSpanElement, any>((props, ref) => 
    React.createElement('span', { ...props, ref })
  ),
  button: React.forwardRef<HTMLButtonElement, any>((props, ref) => 
    React.createElement('button', { ...props, ref })
  ),
};

const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => 
  React.createElement(React.Fragment, {}, children);

const useInView = () => true;

export { motion, AnimatePresence, useInView };