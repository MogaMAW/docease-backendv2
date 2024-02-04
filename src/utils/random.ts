export class RandomNumber {
  private number: number;

  constructor() {
    this.number = Math.random();
  }

  d3() {
    return Math.floor(this.number * 1000);
  }

  d4() {
    return Math.floor(this.number * 10000);
  }
  d5() {
    return Math.floor(this.number * 100000);
  }
  d6() {
    return Math.floor(this.number * 1000000);
  }
  d7() {
    return Math.floor(this.number * 10000000);
  }
  d8() {
    return Math.floor(this.number * 100000000);
  }
}
