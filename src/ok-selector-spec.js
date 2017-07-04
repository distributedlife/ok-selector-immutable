import { expect } from 'chai';
import Immutable from 'immutable';
import read, { unwrap, has} from './ok-selector';

describe('ok-selector', () => {
  const state = Immutable.fromJS({
    level1: {
      level2: {
        level3: {
          value: 'yes'
        }
      }
    },
    array: [
      {id: 1, value: 2},
      {id: 2, value: 4},
      {id: 3, value: 6},
      {id: 4, value: 8}
    ]
  });

  describe('read', () => {
    it('should support dot.strings', () => {
      expect(read(state, 'level1.level2.level3.value')).to.equal('yes');
      expect(read(state, 'level1.level2.level3').toJS()).to.deep.equal({value: 'yes'});
      expect(read(state, 'array').toJS()).to.deep.equal([
        {id: 1, value: 2},
        {id: 2, value: 4},
        {id: 3, value: 6},
        {id: 4, value: 8}
      ]);
    });

    it('should support addressing arrays by id', () => {
      expect(read(state, 'array:3').toJS()).to.deep.equal({id: 3, value: 6});
      expect(read(state, 'array:3.value')).to.deep.equal(6);
    });

    it('should support plucking all values from an array', () => {
      expect(read(state, 'array*.value').toJS()).to.deep.equal([2, 4, 6, 8]);
    });
  })

  describe('has', () => {
    it('should support dot.strings', () => {
      expect(has(state, 'level1.level2.level3.value')).to.eql(true);
      expect(has(state, 'level1.level2.level3')).to.eql(true);
      expect(has(state, 'array')).to.eql(true);
    });

    it('should support missing dot.strings', () => {
      expect(has(state, 'level1.level2.level3.dunno')).to.equal(false);
      expect(has(state, 'level1.level2.level4')).to.equal(false);
      expect(has(state, 'array22')).to.equal(false);
    });

    it('should support addressing arrays by id', () => {
      expect(has(state, 'array:3')).to.equal(true);
      expect(has(state, 'array:3.value')).to.equal(true);
    });

    it('should support addressing incorrect arrays by id', () => {
      expect(has(state, 'array22:3')).to.equal(false);
      expect(has(state, 'array22:3.value')).to.equal(false);
    });
  });

  describe('unwrap', () => {
    it('should support unwrapping', () => {
      expect(unwrap(state, 'array*.value')).to.deep.equal([2, 4, 6, 8]);
    })
  })
})
