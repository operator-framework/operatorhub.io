const express = require('express');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { releaseDate, ignoreComingSoon } = require('../utils/constants');

const testRouteFile = path.resolve(__dirname, '../../test-route/akamai-sureroute-test-object.html');

const getComingSoonFilePath = fileName => {
  const distDir = path.resolve(__dirname, '../../comingSoon');
  if (!fileName) {
    fileName = 'index.html';
  }
  const filePath = path.join(distDir, fileName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return path.join(distDir, 'index.html');
};

const getDistFilePath = fileName => {
  const distDir = path.resolve(__dirname, '../../frontend/dist');
  if (!fileName) {
    fileName = 'index.html';
  }
  const filePath = path.join(distDir, fileName);
  if (fs.existsSync(filePath)) {
    return filePath;
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
  // Prior to release, serve up only the Coming Soon page
  if (!ignoreComingSoon && Date.now() < releaseDate.getTime()) {
    app.get('*', (request, response, next) => {
      // Check if we have since released
      if (Date.now() < releaseDate.getTime()) {
        const filePath = getComingSoonFilePath(request.url);
        response.sendFile(filePath);
      } else {
        // Released!
        next();
      }
    });
  }

  // Base Public Routes
  const uiRoutes = [
    'operator',
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
