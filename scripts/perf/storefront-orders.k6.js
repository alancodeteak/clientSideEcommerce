import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<300"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4100";
const SHOP_ID = __ENV.SHOP_ID || "";
const TOKEN = __ENV.TOKEN || "";

export default function () {
  const res = http.get(`${BASE_URL}/storefront/orders`, {
    headers: {
      "x-shop-id": SHOP_ID,
      Authorization: `Bearer ${TOKEN}`
    }
  });

  check(res, {
    "status is 200": (r) => r.status === 200
  });

  sleep(1);
}
