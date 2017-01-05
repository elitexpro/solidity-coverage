
/**
 * This file contains methods that produce a coverage map to pass to instanbul
 * from data generated by `instrumentSolidity.js`
 */
const SolidityCoder = require('web3/lib/solidity/coder.js');
const path = require('path');

const lineTopic = 'b8995a65f405d9756b41a334f38d8ff0c93c4934e170d3c1429c3e7ca101014d';
const functionTopic = 'd4ce765fd23c5cc3660249353d61ecd18ca60549dd62cb9ca350a4244de7b87f';
const branchTopic = 'd4cf56ed5ba572684f02f889f12ac42d9583c8e3097802060e949bfbb3c1bff5';
const statementTopic = 'b51abbff580b3a34bbc725f2dc6f736e9d4b45a41293fd0084ad865a31fde0c8';

/**
 * Converts solcover event data into an object that can be
 * be passed to instanbul to produce coverage reports.
 * @type {CoverageMap}
 */
module.exports = class CoverageMap {

  constructor() {
    this.coverage = {};
  }

  /**
   * Initializes a coverage map object for contract instrumented per `info` and located
   * at `canonicalContractPath`
   * @param {Object} info `info = getIntrumentedVersion(contract, fileName, true)`
   * @param {String} canonicalContractPath target file location
   * @return {Object} coverage map with all values set to zero
   */
  addContract(info, canonicalContractPath) {
    this.coverage[canonicalContractPath] = {
      l: {},
      path: canonicalContractPath,
      s: {},
      b: {},
      f: {},
      fnMap: {},
      statementMap: {},
      branchMap: {},
    };

    info.runnableLines.forEach((item, idx) => {
      this.coverage[canonicalContractPath].l[info.runnableLines[idx]] = 0;
    });
    this.coverage[canonicalContractPath].fnMap = info.fnMap;
    for (let x = 1; x <= Object.keys(info.fnMap).length; x++) {
      this.coverage[canonicalContractPath].f[x] = 0;
    }
    this.coverage[canonicalContractPath].branchMap = info.branchMap;
    for (let x = 1; x <= Object.keys(info.branchMap).length; x++) {
      this.coverage[canonicalContractPath].b[x] = [0, 0];
    }
    this.coverage[canonicalContractPath].statementMap = info.statementMap;
    for (let x = 1; x <= Object.keys(info.statementMap).length; x++) {
      this.coverage[canonicalContractPath].s[x] = 0;
    }
  }

  /**
   * Populates an empty coverage map with values derived from an array of events
   * fired by instrumented contracts as they are tested
   * @param  {Array} events
   * @param  {String} relative path to host contracts eg: './../contracts'
   * @return {Object} coverage map.
   */
  generate(events, pathPrefix) {
    for (let idx = 0; idx < events.length; idx++) {
      const event = JSON.parse(events[idx]);
      if (event.topics.indexOf(lineTopic) >= 0) {
        const data = SolidityCoder.decodeParams(['string', 'uint256'], event.data.replace('0x', ''));
        const canonicalContractPath = path.resolve(pathPrefix + path.basename(data[0]));
        this.coverage[canonicalContractPath].l[data[1].toNumber()] += 1;
      } else if (event.topics.indexOf(functionTopic) >= 0) {
        const data = SolidityCoder.decodeParams(['string', 'uint256'], event.data.replace('0x', ''));
        const canonicalContractPath = path.resolve(pathPrefix + path.basename(data[0]));
        this.coverage[canonicalContractPath].f[data[1].toNumber()] += 1;
      } else if (event.topics.indexOf(branchTopic) >= 0) {
        const data = SolidityCoder.decodeParams(['string', 'uint256', 'uint256'], event.data.replace('0x', ''));
        const canonicalContractPath = path.resolve(pathPrefix + path.basename(data[0]));
        this.coverage[canonicalContractPath].b[data[1].toNumber()][data[2].toNumber()] += 1;
      } else if (event.topics.indexOf(statementTopic) >= 0) {
        const data = SolidityCoder.decodeParams(['string', 'uint256'], event.data.replace('0x', ''));
        const canonicalContractPath = path.resolve(pathPrefix + path.basename(data[0]));
        this.coverage[canonicalContractPath].s[data[1].toNumber()] += 1;
      }
    }
    return Object.assign({}, this.coverage);
  }
};

