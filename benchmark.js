const detailButtons = [
  { id: 'back', url: null },
  { id: 'image', url: 'img.jpg' },
  { id: 'live', url: 'http://live' },
  { id: 'github', url: 'http://github' }
];

const ITERATIONS = 10000000;

console.log('Running benchmark...');

const startUnoptimized = performance.now();
let dummy1 = 0;
for (let i = 0; i < ITERATIONS; i++) {
  const live1 = detailButtons.findIndex(b => b.id === 'live');
  const live2 = detailButtons.findIndex(b => b.id === 'live');
  const live3 = detailButtons.findIndex(b => b.id === 'live');
  const github1 = detailButtons.findIndex(b => b.id === 'github');
  const github2 = detailButtons.findIndex(b => b.id === 'github');
  const github3 = detailButtons.findIndex(b => b.id === 'github');
  dummy1 += live1 + github1;
}
const endUnoptimized = performance.now();

const startOptimized = performance.now();
let dummy2 = 0;
for (let i = 0; i < ITERATIONS; i++) {
  const live = detailButtons.findIndex(b => b.id === 'live');
  const github = detailButtons.findIndex(b => b.id === 'github');
  const live1 = live;
  const live2 = live;
  const live3 = live;
  const github1 = github;
  const github2 = github;
  const github3 = github;
  dummy2 += live1 + github1;
}
const endOptimized = performance.now();

console.log(`Unoptimized: ${(endUnoptimized - startUnoptimized).toFixed(2)}ms`);
console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(2)}ms`);
console.log(`Improvement: ${(((endUnoptimized - startUnoptimized) - (endOptimized - startOptimized)) / (endUnoptimized - startUnoptimized) * 100).toFixed(2)}%`);
