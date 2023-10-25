import { parseLinkHeader } from "../../reference/parseLinkHeader";

const BASE_URL = "http://localhost:3000/photos-short-list";
// const BASE_URL = "http://localhost:3000/photos";

const controller = new AbortController();

export default class Api {
  static async getPhotos(page = null, limit = null) {
    let next;
    const url = new URL(BASE_URL);
    if (limit) url.searchParams.append("_limit", limit);
    if (page) url.searchParams.append("_page", page);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
      }).then(res => {
        next = parseLinkHeader(res.headers.get("Link"));
        return res.json();
      });

      return { res, next: next.next };
    } catch (err) {
      throw new Error("Error!");
    }
  }
  static async getNextPhotos(url) {
    let next;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
      }).then(res => {
        next = parseLinkHeader(res.headers.get("Link"));
        return res.json();
      });
      return { res, next: next.next };
    } catch (err) {
      if (!controller.signal.aborted) {
        dispatch(requestFailed({ error: e.message }));
      }
    }
  }
}
