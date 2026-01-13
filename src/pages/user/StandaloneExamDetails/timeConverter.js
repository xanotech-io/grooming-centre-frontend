import React from 'react';

const timeConverter = (num) => {
  if (num === 1) {
    return `${num} minute`;
  } else if (num < 60) {
    return `${num} minutes`;
  } else {
    let hr = Math.floor(num / 60);
    let min = num % 60;
    if (hr === 1 && min === 0) {
      return `${hr} hour`;
    } else if (hr > 1 && min === 0) {
      return `${hr} hours`;
    } else if (hr > 1 && min > 0) {
      return `${hr} hours ${min} minute`;
    } else {
      return `${hr} hour ${min} minutes`;
    }
  }
};

export default timeConverter;
