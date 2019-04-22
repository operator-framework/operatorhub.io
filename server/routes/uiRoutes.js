const express = require('express');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const testRouteFile = path.resolve(__dirname, '../../test-route/akamai-sureroute-test-object.html');

const getDistFilePath = fileName => {
  const distDir = path.resolve(__dirname, '../../frontend/dist');
  if (!fileName) {
    fileName = 'index.html';
  }
  const filePath = path.join(distDir, fileName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  let subFileName = fileName;
  while (subFileName.indexOf('/') !== -1) {
    subFileName = subFileName.slice(fileName.indexOf('/'));
    const subfilePath = path.join(distDir, subFileName);
    if (fs.existsSync(subfilePath)) {
      return subfilePath;
    }
  }

  return path.join(distDir, 'index.html');
};

const addRootRedirect = (app, pathName) => {
  app.get(`*${pathName}`, (request, response) => {
    const distFilePath = getDistFilePath(request.url.slice(pathName.length + 2));
    response.sendFile(distFilePath);
  });
  app.get(`*${pathName}/*`, (request, response) => {
    const distFilePath = getDistFilePath(request.url.slice(pathName.length + 2));
    response.sendFile(distFilePath);
  });
};

module.exports = app => {
  // Base Public Routes
  const uiRoutes = [
    'operator',
    'preview',
    'editor',
    'about',
    'contribute',
    'getting-started',
    'what-is-an-operator',
    'how-to-install-an-operator'
  ];

  app.use(express.static('../frontend/dist'));

  // Page Routes
  _.forEach(uiRoutes, uiRoute => {
    addRootRedirect(app, uiRoute);
  });

  // Test Route
  app.get('/akamai-sureroute-test', (request, response) => {
    response.sendFile(testRouteFile);
  });
  app.get('/akamai-sureroute-test/*', (request, response) => {
    response.sendFile(testRouteFile);
  });
};
