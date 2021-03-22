export class Helpers {
  // clones object but keeps references to classes
  static deepCopy<T>(obj: T): T {
    return this.deepCopyRecur<T>(obj, {}, new Set());
  }

  private static deepCopyRecur<T>(obj: T, rtnObj: Partial<T>, objHistory: Set<T>): T {
    if (!obj || typeof obj !== "object") {
      return obj;
    }
    objHistory.add(obj);
    for (const [ key, val ] of Object.entries(obj)) {
      if (val === null || val.constructor.name !== "Object" || objHistory.has(val)) {
        rtnObj[key] = val;
      } else {
        rtnObj[key] = val instanceof Array ? [] : {};
        this.deepCopyRecur(val, rtnObj[key], objHistory);
      }
    }
    return rtnObj as T;
  }
}