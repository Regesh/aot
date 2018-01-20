const fs = require('fs');
const path = require('path');
var ROOT = path.resolve(__dirname, '..');
var root = path.join.bind(path, ROOT);
const EVENT = process.env.npm_lifecycle_event || '';

function printAndExit(msg) {
    console.log(msg);
    process.exit();
}

function hasProcessFlag(flag) {
    return process.argv.join('').indexOf(flag) > -1;
}

function hasNpmFlag(flag) {
    return EVENT.includes(flag);
}

function isWebpackDevServer() {
    return process.argv[1] && !!(/webpack-dev-server/.exec(process.argv[1]));
}

function getEnvFile(suffix) {
    if (suffix && suffix[0] !== '.') {
      suffix = '.' + suffix;
    }
  
    if (suffix === null) {
      return;
    }
  
    let fileName = root(`src/environments/environment${suffix}.ts`);
    if (fs.existsSync(fileName)) {
      return fileName;
    } else if (fs.existsSync(fileName = root('src/environments/environment.ts'))) {
      console.warn(`Could not find environment file with suffix ${suffix}, loading default environment file`);
      return fileName;
    } else {
      throw new Error('Environment file not found.')
    }
  }

function ngcWebpackSetup(prod, metadata) {
    if (!metadata) {
        metadata = DEFAULT_METADATA;
    }

    const buildOptimizer = prod;
    const sourceMap = true; // TODO: apply based on tsconfig value?
    const ngcWebpackPluginOptions = {
        skipCodeGeneration: !metadata.AOT,
        sourceMap
    };
    const environment = getEnvFile(metadata.envFileSuffix);
    if (environment) {
        ngcWebpackPluginOptions.hostReplacementPaths = {
            [root('src/environments/environment.ts')]: environment
        }
    }

    if (!prod && metadata.WATCH) {
        // Force commonjs module format for TS on dev watch builds.
        ngcWebpackPluginOptions.compilerOptions = {
            module: 'commonjs'
        };
    }

    const buildOptimizerLoader = {
        loader: '@angular-devkit/build-optimizer/webpack-loader',
        options: {
            sourceMap
        }
    };

    const loaders = [
        {
            test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
            use: metadata.AOT && buildOptimizer ? [buildOptimizerLoader, '@ngtools/webpack'] : ['@ngtools/webpack']
        },
        ...buildOptimizer
            ? [{ test: /\.js$/, use: [buildOptimizerLoader] }]
            : []
    ];

    return {
        loaders,
        plugin: ngcWebpackPluginOptions
    };
}

exports.hasProcessFlag = hasProcessFlag;
exports.hasNpmFlag = hasNpmFlag;
exports.isWebpackDevServer = isWebpackDevServer;
exports.root = root;
exports.ngcWebpackSetup = ngcWebpackSetup;
exports.printAndExit = printAndExit;