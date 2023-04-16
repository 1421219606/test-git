const glob = require('glob');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const execa = require('execa');
const cwd = process.cwd();
const shell = require('shelljs');

async function publish() {
  try {
    const { packages } = await inquirer.prompt({
      type: 'checkbox',
      name: 'packages',
      message: '选择你要发布的包',
      choices: glob.sync('packages/*'),
    });
    if (packages.length) {
      const tpl = {
        changelog: {
          labels: {
            'pr(enhancement)': ':rocket: Enhancement',
            'pr(bug)': ':bug: Bug Fix',
            'pr(documentation)': ':book: Documentation',
            'pr(dependency)': ':deciduous_tree: Dependency',
            'pr(chore)': ':turtle: Chore',
          },
          repo: 'umijs/father-doc',
          cacheDir: '.changelog',
        },
        packages,
        command: {
          version: {
            exact: true,
          },
        },
        npmClient: 'yarn',
        version: 'independent',
      };
      fs.writeFileSync(`${cwd}/lerna.json`, JSON.stringify(tpl, null, 4));
      shell.exec('git add lerna.json');
      shell.exec('git commit -m "feat: change lerna.json"');
      execa.commandSync('lerna publish', {
        stdio: 'inherit',
        cwd,
      });
    } else {
      console.log('未选择包');
    }
  } catch (error) {
    console.log(error);
  }
}
publish();
