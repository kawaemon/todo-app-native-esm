export function wait(ms) {
  return new Promise((r) => setTimeout(() => r(), ms));
}

export function prettyprint(x) {
  return JSON.stringify(x, null, 4);
}

export function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

export function withoutNullish(raw) {
  const obj = clone(raw);

  const removal = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v == null || v === "") {
      removal.push(k);
    }
  }

  for (const key of removal) {
    delete obj[key];
  }

  return obj;
}

export function humanDate(date) {
  const diff = Math.round((date - new Date()) / (1000 * 60 * 60 * 24));
  switch (diff) {
    case -2:
      return "おととい";
    case -1:
      return "昨日";
    case 0:
      return "今日";
    case 1:
      return "明日";
    case 2:
      return "あさって";
    default:
      const abs = Math.abs;
      if (abs(diff) > 365) {
        const years = Math.floor(diff / 365);
        return diff > 0 ? `約${years}年後` : `約${-years}年前`;
      }
      if (abs(diff) > 30) {
        const months = Math.floor(diff / 30);
        return diff > 0 ? `約${months}ヶ月後` : `約${-months}ヶ月前`;
      }
      return diff > 0 ? `${diff}日後` : `${-diff}日前`;
  }
}

export async function request(method, url, body) {
  const x = await fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  return await x.json();
}
