import {describe,expect,it} from 'vitest';
import {createLife} from '../engine';
describe('new-life release routing',()=>{
  it('creates expanded lives by default while preserving explicit legacy creation',()=>{
    expect(createLife({seed:42}).ruleset).toBe('expanded-1');
    expect(createLife({seed:42,ruleset:'legacy-1'}).ruleset).not.toBe('expanded-1');
  });
});
