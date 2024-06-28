const { exec } = require('child_process');
const depcheck = require('depcheck');

const options = {
    // 你可以根据需要配置选项
};

depcheck(process.cwd(), options, (unused) => {
    const unusedDeps = unused.dependencies.concat(unused.devDependencies);

    if (unusedDeps.length === 0) {
        console.log('No unused dependencies found.');
        return;
    }

    console.log('Unused dependencies:', unusedDeps.join(', '));

    const uninstallCommand = `npm uninstall ${unusedDeps.join(' ')}`;
    console.log(`Running: ${uninstallCommand}`);
    exec(uninstallCommand, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log(stdout);
        console.log('Unused dependencies removed.');
    });
});
