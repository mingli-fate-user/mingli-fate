const { spawn } = require('child_process');

// Use SURGE_TOKEN env if available
const env = { ...process.env };

const child = spawn('npx', ['surge', 'dist', 'mingli-fate-v2.surge.sh', '--token', process.env.SURGE_TOKEN || ''], {
  cwd: '/mnt/agents/output/app',
  stdio: ['pipe', 'pipe', 'pipe'],
  env
});

let output = '';
child.stdout.on('data', (d) => { output += d.toString(); });
child.stderr.on('data', (d) => { output += d.toString(); });

setTimeout(() => {
  child.stdin.write('3376787168@qq.com\n');
  setTimeout(() => {
    child.stdin.write('surge\n');
    setTimeout(() => {
      child.stdin.end();
    }, 10000);
  }, 5000);
}, 3000);

child.on('exit', (code) => {
  console.log('OUTPUT:', output);
  console.log('Exit code:', code);
});

setTimeout(() => { child.kill(); }, 45000);
