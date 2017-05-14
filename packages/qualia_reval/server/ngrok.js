import {WebApp} from 'meteor/webapp';
import {execSync, spawn} from 'child_process';
import http from 'http';

class Ngrok {

  start() {
    if (this.ngrok) {
      return;
    }

    execSync(`chmod a+x ${this.getPath()}`);

    this.ngrok = spawn(this.getPath(), ['http', this.getLocalURL()]);
    process.on('exit', () => {
      this.stop();
    });

    this.waitHealthy();
  }

  stop() {
    this.ngrok.kill();
  }

  waitHealthy() {
    if (this.healthy) {
      return;
    }

    console.log('Starting ngrok');
    Meteor.wrapAsync(done => {
      this.checkHealthy(done);
      this.healthy = true;
    })();
  }

  checkHealthy(done) {
    let publicURL;
    try {
      publicURL = this.getPublicURL();
    }
    catch(e) {}

    if (publicURL) {
      console.log('Connected to ngrok');
      done();
    }
    else {
      console.log('Waiting for ngrok to start...');
      Meteor.setTimeout(() => this.checkHealthy(done), 1000);
    }
  }

  getLocalURL() {
    let address = WebApp.httpServer.address();
    return `${address.address}:${address.port}`;
  }

  getPublicURL() {
    return Meteor.wrapAsync(done => {
      let req = http.get('http://localhost:4040/api/tunnels', res => {
        let rawData = '';
        res.setEncoding('utf8');

        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          try {
            let parsedData = JSON.parse(rawData),
                tunnel = parsedData.tunnels.filter(tunnel => tunnel.config.addr === this.getLocalURL())[0]
            ;
            done(null, tunnel.public_url);
          } catch (e) {
            done(e);
          }
        });
      });

      req.on('error', e => done(e));
      req.end();
    })();
  }

  getPath() {
    return Assets.absoluteFilePath(`assets/ngrok_${process.platform}`);
  }

}

export default Ngrok;
