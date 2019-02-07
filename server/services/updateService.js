const loadService = require('./loadService');

const { exec } = require('child_process');

const updateLocalOperators = (serverRequest, serverResponse) => {
  exec('./scripts/update-operators.sh', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      serverResponse.status(500).send(stderr);
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    serverResponse.send(stdout);

    loadService.loadOperators(loadError => {
      if (loadError) {
        console.dir(loadError);
      } else {
        console.log('Operators have been updated');
      }
    });
  });
};

const updateService = {
  updateLocalOperators
};

module.exports = updateService;
