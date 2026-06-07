const { spawn } = require('child_process');

const child = spawn('npx', ['surge', '--project', '.', '--domain', 'mingli-app.surge.sh'], {
  cwd: '/mnt/agents/output/app/dist',
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
child.stdout.on('data', (d) => {
  output += d.toString();
  process.stdout.write(d);
});
child.stderr.on('data', (d) => {
  output += d.toString();
  process.stderr.write(d);
});

// Wait a bit for prompts
setTimeout(() => {
  child.stdin.write('3376787168@qq.com\n');
  
  setTimeout(() => {
    child.stdin.write('\n');
    
    setTimeout(() => {
      child.stdin.end();
    }, 5000);
  }, 3000);
}, 2000);

child.on('exit', (code) => {
  console.log('\nExit code:', code);
  process.exit(code);
});

setTimeout(() => {
  console.log('\nFinal output:', output);
  child.kill();
  process.exit(1);
}, 30000);
