import React from 'react';
import "./Error404.css";
import { Link } from 'react-router-dom';

function Error404() {
  return (
    <div className="error404">
            <h1>ERROR 404!</h1>
            <h2>Oops! It seems like the page you are looking for does not exit or has been removed.</h2>
            <p>Please recheck the url. Thank-you!</p>
    </div>
  )
}

export default Error404;