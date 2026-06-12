export class FormatUtils {
  static quantity(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
  }
}
