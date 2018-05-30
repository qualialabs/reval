import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';

let rootDir = path.join(process.cwd(), '..', '..', '..', '..', '..'),
    buildPrefix = path.join(process.cwd(), '..')
;

let parsePath = function(filePath) {
  if (filePath[0] === path.sep && !filePath.startsWith(rootDir)) {
    return {};
  }

  let relativePath = filePath.replace(rootDir + path.sep, ''),
      isPackage = relativePath.startsWith('packages')
  ;

  if (!isPackage) {
    let parsed = {
      relativePath,
      clientPath: path.join(buildPrefix, 'web.browser', 'app', 'app.js'),
      serverPath: path.join(buildPrefix, 'server', 'app', 'app.js'),
    };

    if (relativePath.startsWith('client')) {
      delete parsed.serverPath;
    }

    if (relativePath.startsWith('server')) {
      delete parsed.clientPath;
    }

    return parsed;
  }

  let packageJSPath = rootDir + path.sep + relativePath.split(path.sep).slice(0, 2).join(path.sep) + path.sep + 'package.js',
      packageJS = fs.readFileSync(packageJSPath, 'utf8'),
      packageName = packageJS.match(/name\s*:\s*['"](.*?)['"]/)[1],
      escapedPackageName = packageName.replace(':', '_'),
      clientPath = path.join(buildPrefix, 'web.browser', 'packages', escapedPackageName + '.js'),
      serverPath = path.join(buildPrefix, 'server', 'packages', escapedPackageName + '.js'),
      parsed = {}
  ;

  parsed.relativePath = packageName + path.sep + relativePath.split(path.sep).slice(2).join(path.sep);
  parsed.escapedRelativePath = parsed.relativePath.replace(':', '_');

  if (fs.existsSync(clientPath)) {
    parsed.clientPath = clientPath;
  }

  if (fs.existsSync(serverPath)) {
    parsed.serverPath = serverPath;
  }

  return parsed;
};

export default {

  rootDir,
  buildPrefix,

  findFilePath(templateName, sourceType) {
    if (!templateName) {
      return '';
    }

    let exclude = `--exclude-dir=.git --exclude-dir=.meteor --exclude-dir=.npm --exclude-dir=.common`;
    let command = {
      js: `grep -ril --include='*.js' ${exclude} -e "Template\\.${templateName}\\." -e "register(['\\"]${templateName}['\\"])" ${rootDir}`,
      html: `grep -ril --include='*.html' --include='*.jade' ${exclude} -e "template name=[\\"']${templateName}[\\"']" -e "template(name=[\\"']${templateName}[\\"'])" ${rootDir}`,
    }[sourceType];

    return childProcess
        .execSync(command)
        .toString()
        .split('\n')[0]
    ;
  },

  findFile(filePath) {
    let parsed = parsePath(filePath),
        locations = {
          client: false,
          server: false,
        }
    ;

    if (parsed.clientPath && fs.existsSync(parsed.clientPath)) {
      let clientSrc = fs.readFileSync(parsed.clientPath, 'utf8');
      locations.client = clientSrc.includes(parsed.relativePath) || clientSrc.includes(parsed.escapedRelativePath);
    }

    if (parsed.serverPath && fs.existsSync(parsed.serverPath)) {
      let serverSrc = fs.readFileSync(parsed.serverPath, 'utf8');
      locations.server = serverSrc.includes(parsed.relativePath) || serverSrc.includes(parsed.escapedRelativePath);
    }

    return locations;
  },

  resolvePath(filePath) {
    if (filePath && filePath[0] !== path.sep) {
      if (filePath[0] === '~') {
        filePath = filePath.replace('~', os.homedir());
      }
      else {
        filePath = path.resolve(rootDir, filePath);
      }
    }

    return filePath;
  },

  normalizePath(filePath) {
    filePath = filePath.replace(/\\/g, '/');
    return path.normalize(filePath);
  },

  getData(request) {
    let payload = '';

    Meteor.wrapAsync(done => {
      request.on('data', function(data) {
        payload += data;
      });
      request.on('end', function() {
        done(null, '');
      });
    })();

    return payload;
  },

  getSafeModified(filePath) {
    let modified = new Date();
    if (!fs.existsSync(filePath)) {
      return modified;
    }

    let stats = fs.statSync(filePath),
        fileModified = new Date(stats.mtime.getTime() + 1000)
    ;

    return modified > fileModified
      ? modified
      : fileModified
    ;
  },

  getModuleName(filePath) {
    let moduleName = filePath.replace(path.normalize(rootDir + path.sep), ''),
        parts = moduleName.split('/')
    ;
    if (parts[0] === 'packages') {
      moduleName = 'node_modules/meteor/' + parsePath(filePath).relativePath;
    }
    return '/' + moduleName;
  },

  findAllFiles() {
    console.log(rootDir);
    let command = `cd ../../../../.. && find . -not \\( -path '*/\\.*' -o -path '*/node_modules*' -prune \\) \\( -name '*\\.js' -o -name '*\\.html' -o -name '*\\.css' \\)`;
    return childProcess
      .execSync(command)
      .toString()
      .split('\n')
      .map(path => path.slice(2))
    ;
  },

};
