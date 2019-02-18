const express = require('express');
const path = require('path');
const { comingSoon } = require('../utils/constants');

const addRootRedirect = (app, pathName) => {
  app.get(`/${pathName}`, (request, response) => {
    response.sendFile(path.resolve(__dirname, `../../frontend/dist/index.html`));
  });
  app.get(`/${pathName}/*`, (request, response) => {
    response.sendFile(path.resolve(__dirname, `../../frontend/dist/${request.url.slice(pathName.length + 2)}`));
  });
};

module.exports = app => {
  // Base Public Routes
  if (comingSoon) {
    app.use(express.static('../comingSoon'));
    return;
  }

  app.use(express.static('../frontend/dist'));

  // Page Routes
  addRootRedirect(app, 'about');
  addRootRedirect(app, 'operator');
  addRootRedirect(app, 'contribute');
  addRootRedirect(app, 'getting-started-with-operators');
  addRootRedirect(app, 'what-is-an-operator');
};
