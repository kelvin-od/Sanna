// src/Components/Pages/withTitle.jsx
import React, { useEffect } from 'react';

const withTitle = (Component, title) => {
  return (props) => {
    useEffect(() => {
      document.title = title;
      // The following line removes the ESLint warning by not including the dependency array.
    }, []);

    return <Component {...props} />;
  };
};

export default withTitle;
