// One-time baseline capture, run before changing engine source. Not used to update expectations.
import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
const server = await createServer({ server: { middlewareMode: true } });
try {
  const engine = await server.ssrLoadModule('/src/game/engine.ts');
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const records = [];
  for (const language of ['en', 'th']) for (let seed = 0; seed < 100; seed++) {
    let life = engine.createLife({seed, language, name: 'Baseline'});
    const checkpoints = [hash(life)];
    life = engine.beginLife(life);
    checkpoints.push(hash(life));
    for (let step = 0; step < 1200 && life.phase !== 'ended'; step++) {
      const decision = engine.getDecision(life);
      const choice = decision?.choices.find(c => !c.disabled && (c.cost ?? 0) <= life.coins && !c.risk);
      life = decision ? engine.choose(life, (choice ?? decision.choices.find(c => !c.disabled && (c.cost ?? 0) <= life.coins)).id) : engine.advance(life, 'year');
      checkpoints.push(hash(life));
    }
    records.push({seed, language, checkpoints});
  }
  mkdirSync('src/game/fixtures', {recursive:true});
  writeFileSync('src/game/fixtures/legacy-baseline.json', JSON.stringify({baseline:'238c3e4', policy:'first enabled affordable risk-free choice, else first enabled affordable; advance year; SHA256(JSON.stringify(life)) after every action', records}));
  console.log(`Captured ${records.length} lives and ${records.reduce((n,r)=>n+r.checkpoints.length,0)} full-state hashes`);
} finally { await server.close(); }
